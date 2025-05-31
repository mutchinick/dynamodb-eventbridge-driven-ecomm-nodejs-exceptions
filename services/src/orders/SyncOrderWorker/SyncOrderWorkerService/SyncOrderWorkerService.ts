import { InvalidArgumentsError, InvalidOperationError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { IDbCreateOrderClient } from '../DbCreateOrderClient/DbCreateOrderClient'
import { IDbGetOrderClient } from '../DbGetOrderClient/DbGetOrderClient'
import { IDbUpdateOrderClient } from '../DbUpdateOrderClient/DbUpdateOrderClient'
import { IEsRaiseOrderCreatedEventClient } from '../EsRaiseOrderCreatedEventClient/EsRaiseOrderCreatedEventClient'
import { CreateOrderCommand, CreateOrderCommandInput } from '../model/CreateOrderCommand'
import { GetOrderCommand, GetOrderCommandInput } from '../model/GetOrderCommand'
import { IncomingOrderEvent } from '../model/IncomingOrderEvent'
import { OrderCreatedEvent, OrderCreatedEventInput } from '../model/OrderCreatedEvent'
import { UpdateOrderCommand, UpdateOrderCommandInput } from '../model/UpdateOrderCommand'

export interface ISyncOrderWorkerService {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {ForbiddenOrderStatusTransitionError}
   * @throws {RedundantOrderStatusTransitionError}
   * @throws {StaleOrderStatusTransitionError}
   * @throws {DuplicateEventRaisedError}
   * @throws {InvalidOperationError}
   * @throws {UnrecognizedError}
   */
  syncOrder: (incomingOrderEvent: IncomingOrderEvent) => Promise<void>
}

/**
 *
 */
export class SyncOrderWorkerService implements ISyncOrderWorkerService {
  /**
   *
   */
  constructor(
    private readonly dbGetOrderClient: IDbGetOrderClient,
    private readonly dbCreateOrderClient: IDbCreateOrderClient,
    private readonly dbUpdateOrderClient: IDbUpdateOrderClient,
    private readonly esRaiseOrderCreatedEventClient: IEsRaiseOrderCreatedEventClient,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {ForbiddenOrderStatusTransitionError}
   * @throws {RedundantOrderStatusTransitionError}
   * @throws {StaleOrderStatusTransitionError}
   * @throws {DuplicateEventRaisedError}
   * @throws {InvalidOperationError}
   * @throws {UnrecognizedError}
   */
  public async syncOrder(incomingOrderEvent: IncomingOrderEvent): Promise<void> {
    const logContext = 'SyncOrderWorkerService.syncOrder'
    console.info(`${logContext} init:`, { incomingOrderEvent })

    // This is one of those methods that is long and ugly, I have explored some ways to make it more readable,
    // and have liked some of them, but for now I have decided to keep it as is: verbose with naming, verbose
    // with error handling and verbose with logging. Also not a big fan of the comments =).
    // At some point I come back to it and shorten contextualized names, use helpers to clean up logging, etc.

    try {
      // The input IncomingOrderEvent should already be valid because it can only be built through the same
      // IncomingOrderEvent class which enforces strict validation. Still it performs just enough validation to
      // prevent unlikely but possible uncaught exceptions for some properties that are accessed directly.

      this.validateInput(incomingOrderEvent)

      const isOrderPlacedEvent = IncomingOrderEvent.isOrderPlacedEvent(incomingOrderEvent)
      const existingOrderData = await this.getOrder(incomingOrderEvent.eventData.orderId)

      // When IT IS an OrderPlacedEvent and the OrderData DOES NOT exist in the database then it needs to
      // create the Order and then raise the event. This is the starting point for the Order.
      if (isOrderPlacedEvent && !existingOrderData) {
        const createdOrderData = await this.createOrder(incomingOrderEvent)
        await this.raiseOrderCreatedEvent(createdOrderData)
        console.info(`${logContext} exit success: create order:`, { createdOrderData, incomingOrderEvent })
        return
      }

      // When IT IS an OrderPlacedEvent and the OrderData DOES exist in the database, it only tries
      // to raise the event again because the intuition is that is was tried before but it failed.
      if (isOrderPlacedEvent && existingOrderData) {
        await this.raiseOrderCreatedEvent(existingOrderData)
        console.info(`${logContext} exit success: raise event:`, { existingOrderData, incomingOrderEvent })
        return
      }

      // When IT IS NOT an OrderPlacedEvent and the OrderData DOES exist in the database, it needs to
      // update the Order to a new state. No event needs to be raised because it is in tracking mode.
      if (!isOrderPlacedEvent && existingOrderData) {
        await this.updateOrder(existingOrderData, incomingOrderEvent)
        console.info(`${logContext} exit success: update order:`, { existingOrderData, incomingOrderEvent })
        return
      }
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderEvent })
      throw error
    }

    // When IT IS NOT an OrderPlacedEvent and the OrderData DOES NOT exist in the database.
    // This means it reached an invalid operation somehow, so it must return an error.
    const invalidOperationError = InvalidOperationError.nonTransient()
    console.error(`${logContext} exit error:`, { invalidOperationError, incomingOrderEvent })
    throw invalidOperationError
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(incomingOrderEvent: IncomingOrderEvent): void {
    const logContext = 'SyncOrderWorkerService.validateInput'

    if (
      incomingOrderEvent instanceof IncomingOrderEvent === false ||
      incomingOrderEvent.eventData == null ||
      incomingOrderEvent.eventData.orderId == null
    ) {
      const errorMessage = `Expected IncomingOrderEvent but got ${incomingOrderEvent}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingOrderEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  private async getOrder(orderId: string): Promise<OrderData> {
    const logContext = 'SyncOrderWorkerService.getOrder'
    console.info(`${logContext} init:`, { orderId })

    try {
      const getOrderCommandInput: GetOrderCommandInput = { orderId }
      const getOrderCommand = GetOrderCommand.validateAndBuild(getOrderCommandInput)
      const existingOrderData = await this.dbGetOrderClient.getOrder(getOrderCommand)
      console.info(`${logContext} exit success:`, { existingOrderData, getOrderCommand, getOrderCommandInput })
      return existingOrderData
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, orderId })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  private async createOrder(incomingOrderEvent: IncomingOrderEvent): Promise<OrderData> {
    const logContext = 'SyncOrderWorkerService.createOrder'
    console.info(`${logContext} init:`, { incomingOrderEvent })

    try {
      const createOrderCommandInput: CreateOrderCommandInput = { incomingOrderEvent }
      const createOrderCommand = CreateOrderCommand.validateAndBuild(createOrderCommandInput)
      const createdOrderData = await this.dbCreateOrderClient.createOrder(createOrderCommand)
      console.info(`${logContext} exit success:`, { createdOrderData, createOrderCommand, createOrderCommandInput })
      return createdOrderData
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async raiseOrderCreatedEvent(createdOrderData: OrderData): Promise<void> {
    const logContext = 'SyncOrderWorkerService.raiseOrderCreatedEvent'
    console.info(`${logContext} init:`, { createdOrderData })

    try {
      const { orderId, sku, units, price, userId } = createdOrderData
      const orderCreatedEventInput: OrderCreatedEventInput = { orderId, sku, units, price, userId }
      const orderCreatedEvent = OrderCreatedEvent.validateAndBuild(orderCreatedEventInput)
      await this.esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(orderCreatedEvent)
      console.info(`${logContext} exit success:`, { orderCreatedEvent, orderCreatedEventInput })
      return
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, createdOrderData })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {ForbiddenOrderStatusTransitionError}
   * @throws {RedundantOrderStatusTransitionError}
   * @throws {StaleOrderStatusTransitionError}
   * @throws {InvalidOperationError}
   */
  private async updateOrder(existingOrderData: OrderData, incomingOrderEvent: IncomingOrderEvent): Promise<void> {
    const logContext = 'SyncOrderWorkerService.updateOrder'
    console.info(`${logContext} init:`, { incomingOrderEvent, existingOrderData })

    try {
      const updateOrderCommandInput: UpdateOrderCommandInput = { existingOrderData, incomingOrderEvent }
      const updateOrderCommand = UpdateOrderCommand.validateAndBuild(updateOrderCommandInput)
      const updatedOrderData = await this.dbUpdateOrderClient.updateOrder(updateOrderCommand)
      console.info(`${logContext} exit success:`, { updatedOrderData, updateOrderCommand, updateOrderCommandInput })
      return
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderEvent, existingOrderData })
      throw error
    }
  }
}
