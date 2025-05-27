import {
  DepletedStockAllocationError,
  DuplicateStockAllocationError,
  InvalidArgumentsError,
} from '../../errors/AppError'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { IDbAllocateOrderStockClient } from '../DbAllocateOrderStockClient/DbAllocateOrderStockClient'
import { IDbGetOrderAllocationClient } from '../DbGetOrderAllocationClient/DbGetOrderAllocationClient'
import { IEsRaiseOrderStockAllocatedEventClient } from '../EsRaiseOrderStockAllocatedEventClient/EsRaiseOrderStockAllocatedEventClient'
import { IEsRaiseOrderStockDepletedEventClient } from '../EsRaiseOrderStockDepletedEventClient/EsRaiseOrderStockDepletedEventClient'
import { AllocateOrderStockCommand, AllocateOrderStockCommandInput } from '../model/AllocateOrderStockCommand'
import { GetOrderAllocationCommand, GetOrderAllocationCommandInput } from '../model/GetOrderAllocationCommand'
import { IncomingOrderCreatedEvent } from '../model/IncomingOrderCreatedEvent'
import { OrderStockAllocatedEvent, OrderStockAllocatedEventInput } from '../model/OrderStockAllocatedEvent'
import { OrderStockDepletedEvent, OrderStockDepletedEventInput } from '../model/OrderStockDepletedEvent'

export interface IAllocateOrderStockWorkerService {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  allocateOrderStock: (incomingOrderCreatedEvent: IncomingOrderCreatedEvent) => Promise<void>
}

/**
 *
 */
export class AllocateOrderStockWorkerService implements IAllocateOrderStockWorkerService {
  /**
   *
   */
  constructor(
    private readonly dbGetOrderAllocationClient: IDbGetOrderAllocationClient,
    private readonly dbAllocateOrderStockClient: IDbAllocateOrderStockClient,
    private readonly esRaiseOrderStockAllocatedEventClient: IEsRaiseOrderStockAllocatedEventClient,
    private readonly esRaiseOrderStockDepletedEventClient: IEsRaiseOrderStockDepletedEventClient,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  public async allocateOrderStock(incomingOrderCreatedEvent: IncomingOrderCreatedEvent): Promise<void> {
    const logContext = 'AllocateOrderStockWorkerService.allocateOrderStock'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    // This is one of those methods that is long and ugly, I have explored some ways to make it more readable,
    // and have liked some of them, but for now I have decided to keep it as is: verbose with naming, verbose
    // with error handling and verbose with logging. Also not a big fan of the comments =).
    // At some point I come back to it and shorten contextualized names, use helpers to clean up logging, etc.

    try {
      this.validateInput(incomingOrderCreatedEvent)

      // When it reads the Allocation from the database
      const existingOrderAllocationData = await this.getOrderAllocation(incomingOrderCreatedEvent)

      // When the Allocation DOES exist and it only raises the Allocated event
      if (existingOrderAllocationData) {
        await this.raiseAllocatedEvent(incomingOrderCreatedEvent)
        console.info(`${logContext} exit success: skipped:`, { existingOrderAllocationData, incomingOrderCreatedEvent })
        return
      }

      // When the Allocation DOES NOT exist and it creates it and raises the Allocated event
      else {
        await this.allocateOrder(incomingOrderCreatedEvent)
        await this.raiseAllocatedEvent(incomingOrderCreatedEvent)
        console.info(`${logContext} exit success:`, { existingOrderAllocationData, incomingOrderCreatedEvent })
        return
      }
    } catch (error) {
      // When the Allocation DOES NOT exist WHEN READ but was created by another instance/race condition,
      // it encounters a DuplicateStockAllocationError and it tries to the raise the Allocated event
      // because it doesn't know if the Allocated event was raised successfully when first allocated.
      if (error instanceof DuplicateStockAllocationError) {
        await this.raiseAllocatedEvent(incomingOrderCreatedEvent)
        console.info(`${logContext} exit success: from-error:`, { error, incomingOrderCreatedEvent })
        return
      }

      // When the Allocation DOES NOT exist and there is not enough stock and it raises the Depleted event,
      // it encounters a DepletedStockAllocationError and it tries to the raise the Depleted event.
      if (error instanceof DepletedStockAllocationError) {
        await this.raiseDepletedEvent(incomingOrderCreatedEvent)
        console.info(`${logContext} exit success: from-error:`, { error, incomingOrderCreatedEvent })
        return
      }

      // If it gets to this point it means there is an error it did not or do not want to account for here,
      // in which case it logs the error and throw it.
      console.error(`${logContext} exit error:`, { error, incomingOrderCreatedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(incomingOrderCreatedEvent: IncomingOrderCreatedEvent): void {
    const logContext = 'AllocateOrderStockWorkerService.validateInput'

    if (incomingOrderCreatedEvent instanceof IncomingOrderCreatedEvent === false) {
      const errorMessage = `Expected IncomingOrderCreatedEvent but got ${incomingOrderCreatedEvent}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingOrderCreatedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  private async getOrderAllocation(incomingOrderCreatedEvent: IncomingOrderCreatedEvent): Promise<OrderAllocationData> {
    const logContext = 'AllocateOrderStockWorkerService.getOrderAllocation'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    try {
      const { orderId, sku } = incomingOrderCreatedEvent.eventData
      const getOrderAllocationCommandInput: GetOrderAllocationCommandInput = { orderId, sku }
      const getOrderAllocationCommand = GetOrderAllocationCommand.validateAndBuild(getOrderAllocationCommandInput)
      const orderAllocationData = await this.dbGetOrderAllocationClient.getOrderAllocation(getOrderAllocationCommand)
      console.info(`${logContext} exit success:`, {
        orderAllocationData,
        getOrderAllocationCommand,
        getOrderAllocationCommandInput,
      })
      return orderAllocationData
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderCreatedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateStockAllocationError}
   * @throws {DepletedStockAllocationError}
   * @throws {UnrecognizedError}
   */
  private async allocateOrder(incomingOrderCreatedEvent: IncomingOrderCreatedEvent): Promise<void> {
    const logContext = 'AllocateOrderStockWorkerService.allocateOrder'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    try {
      const allocateOrderStockCommandInput: AllocateOrderStockCommandInput = { incomingOrderCreatedEvent }
      const allocateOrderStockCommand = AllocateOrderStockCommand.validateAndBuild(allocateOrderStockCommandInput)
      await this.dbAllocateOrderStockClient.allocateOrderStock(allocateOrderStockCommand)
      console.info(`${logContext} exit success:`, { allocateOrderStockCommand, allocateOrderStockCommandInput })
      return
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderCreatedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async raiseAllocatedEvent(incomingOrderCreatedEvent: IncomingOrderCreatedEvent): Promise<void> {
    const logContext = 'AllocateOrderStockWorkerService.raiseAllocatedEvent'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    try {
      const { orderId, sku, units, price, userId } = incomingOrderCreatedEvent.eventData
      const orderStockAllocatedEventInput: OrderStockAllocatedEventInput = { orderId, sku, units, price, userId }
      const orderStockAllocatedEvent = OrderStockAllocatedEvent.validateAndBuild(orderStockAllocatedEventInput)
      await this.esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(orderStockAllocatedEvent)
      console.info(`${logContext} exit success:`, { orderStockAllocatedEvent, orderStockAllocatedEventInput })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderCreatedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async raiseDepletedEvent(incomingOrderCreatedEvent: IncomingOrderCreatedEvent): Promise<void> {
    const logContext = 'AllocateOrderStockWorkerService.raiseDepletedEvent'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    try {
      const { orderId, sku, units, price, userId } = incomingOrderCreatedEvent.eventData
      const orderStockDepletedEventInput: OrderStockDepletedEventInput = { orderId, sku, units, price, userId }
      const orderStockDepletedEvent = OrderStockDepletedEvent.validateAndBuild(orderStockDepletedEventInput)
      await this.esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(orderStockDepletedEvent)
      console.info(`${logContext} exit success:`, { orderStockDepletedEvent, orderStockDepletedEventInput })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderCreatedEvent })
      throw error
    }
  }
}
