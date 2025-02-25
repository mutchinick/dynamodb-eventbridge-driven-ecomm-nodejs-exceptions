import {
  AsyncResult,
  InvalidArgumentsError,
  DuplicateEventRaisedError,
  DepletedStockAllocationError,
  DuplicateStockAllocationError,
  UnrecognizedError,
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
  allocateOrderStock: (
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ) => AsyncResult<void, InvalidArgumentsError | DuplicateEventRaisedError | UnrecognizedError>
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
  public async allocateOrderStock(
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ): AsyncResult<void, InvalidArgumentsError | DuplicateEventRaisedError | UnrecognizedError> {
    const logContext = 'AllocateOrderStockWorkerService.allocateOrderStock'
    console.info(`${logContext} init:`, { incomingOrderCreatedEvent })

    try {
      await this.allocateOrder(incomingOrderCreatedEvent)
      await this.raiseAllocatedEvent(incomingOrderCreatedEvent)
      console.info(`${logContext} exit success:`, { incomingOrderCreatedEvent })
      return
    } catch (error) {
      if (error instanceof DuplicateStockAllocationError) {
        await this.raiseAllocatedEvent(incomingOrderCreatedEvent)
        console.info(`${logContext} exit success:`, { error, incomingOrderCreatedEvent })
        return
      }

      if (error instanceof DepletedStockAllocationError) {
        await this.raiseDepletedEvent(incomingOrderCreatedEvent)
        console.info(`${logContext} exit success:`, { error, incomingOrderCreatedEvent })
        return
      }

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
  private async allocateOrder(
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ): AsyncResult<
    void,
    InvalidArgumentsError | DuplicateStockAllocationError | DepletedStockAllocationError | UnrecognizedError
  > {
    const logContext = 'AllocateOrderStockWorkerService.allocateOrder'
    try {
      console.info(`${logContext} init:`, { incomingOrderCreatedEvent })
      const allocateOrderStockCommand = AllocateOrderStockCommand.validateAndBuild({ incomingOrderCreatedEvent })
      await this.dbAllocateOrderStockClient.allocateOrderStock(allocateOrderStockCommand)
      console.info(`${logContext} exit success:`)
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
  private async raiseAllocatedEvent(
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ): AsyncResult<void, InvalidArgumentsError | DuplicateEventRaisedError | UnrecognizedError> {
    const logContext = 'AllocateOrderStockWorkerService.raiseAllocatedEvent'
    try {
      console.info(`${logContext} init:`, { incomingOrderCreatedEvent })
      const { eventData } = incomingOrderCreatedEvent
      const orderStockAllocatedEvent = OrderStockAllocatedEvent.validateAndBuild(eventData)
      await this.esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(orderStockAllocatedEvent)
      console.info(`${logContext} exit success:`)
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
  private async raiseDepletedEvent(
    incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
  ): AsyncResult<void, InvalidArgumentsError | DuplicateEventRaisedError | UnrecognizedError> {
    const logContext = 'AllocateOrderStockWorkerService.raiseDepletedEvent'
    try {
      console.info(`${logContext} init:`, { incomingOrderCreatedEvent })
      const { eventData } = incomingOrderCreatedEvent
      const orderStockDepletedEvent = OrderStockDepletedEvent.validateAndBuild(eventData)
      await this.esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(orderStockDepletedEvent)
      console.info(`${logContext} exit success:`)
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderCreatedEvent })
      throw error
    }
  }
}
