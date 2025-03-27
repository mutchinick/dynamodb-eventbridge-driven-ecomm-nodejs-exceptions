import {
  DepletedStockAllocationError,
  DuplicateStockAllocationError,
  InvalidArgumentsError,
} from '../../errors/AppError'
import { IDbAllocateOrderStockClient } from '../DbAllocateOrderStockClient/DbAllocateOrderStockClient'
import { IEsRaiseOrderStockAllocatedEventClient } from '../EsRaiseOrderStockAllocatedEventClient/EsRaiseOrderStockAllocatedEventClient'
import { IEsRaiseOrderStockDepletedEventClient } from '../EsRaiseOrderStockDepletedEventClient/EsRaiseOrderStockDepletedEventClient'
import { AllocateOrderStockCommand } from '../model/AllocateOrderStockCommand'
import { IncomingOrderCreatedEvent } from '../model/IncomingOrderCreatedEvent'
import { OrderStockAllocatedEvent } from '../model/OrderStockAllocatedEvent'
import { OrderStockDepletedEvent } from '../model/OrderStockDepletedEvent'

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

    try {
      this.validateInput(incomingOrderCreatedEvent)
      await this.allocateOrder(incomingOrderCreatedEvent)
      await this.raiseAllocatedEvent(incomingOrderCreatedEvent)
      console.info(`${logContext} exit success:`, { incomingOrderCreatedEvent })
      return
    } catch (error) {
      if (error instanceof DuplicateStockAllocationError) {
        await this.raiseAllocatedEvent(incomingOrderCreatedEvent)
        console.info(`${logContext} exit success: form-error:`, { incomingOrderCreatedEvent, error })
        return
      }

      if (error instanceof DepletedStockAllocationError) {
        await this.raiseDepletedEvent(incomingOrderCreatedEvent)
        console.info(`${logContext} exit success: form-error:`, { incomingOrderCreatedEvent, error })
        return
      }

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
   * @throws {DuplicateStockAllocationError}
   * @throws {DepletedStockAllocationError}
   * @throws {UnrecognizedError}
   */
  private async allocateOrder(incomingOrderCreatedEvent: IncomingOrderCreatedEvent): Promise<void> {
    const logContext = 'AllocateOrderStockWorkerService.allocateOrder'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    try {
      const allocateOrderStockCommand = AllocateOrderStockCommand.validateAndBuild({ incomingOrderCreatedEvent })
      await this.dbAllocateOrderStockClient.allocateOrderStock(allocateOrderStockCommand)
      console.info(`${logContext} exit success:`, { allocateOrderStockCommand, incomingOrderCreatedEvent })
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
      const { eventData } = incomingOrderCreatedEvent
      const orderStockAllocatedEvent = OrderStockAllocatedEvent.validateAndBuild(eventData)
      await this.esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(orderStockAllocatedEvent)
      console.info(`${logContext} exit success:`, { orderStockAllocatedEvent, incomingOrderCreatedEvent })
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
      const { eventData } = incomingOrderCreatedEvent
      const orderStockDepletedEvent = OrderStockDepletedEvent.validateAndBuild(eventData)
      await this.esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(orderStockDepletedEvent)
      console.info(`${logContext} exit success:`, { orderStockDepletedEvent, incomingOrderCreatedEvent })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderCreatedEvent })
      throw error
    }
  }
}
