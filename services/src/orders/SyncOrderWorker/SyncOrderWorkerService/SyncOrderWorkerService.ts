import { InvalidArgumentsError, InvalidOperationError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { IDbCreateOrderClient } from '../DbCreateOrderClient/DbCreateOrderClient'
import { IDbGetOrderClient } from '../DbGetOrderClient/DbGetOrderClient'
import { IDbUpdateOrderClient } from '../DbUpdateOrderClient/DbUpdateOrderClient'
import { IEsRaiseOrderCreatedEventClient } from '../EsRaiseOrderCreatedEventClient/EsRaiseOrderCreatedEventClient'
import { CreateOrderCommand } from '../model/CreateOrderCommand'
import { GetOrderCommand } from '../model/GetOrderCommand'
import { IncomingOrderEvent } from '../model/IncomingOrderEvent'
import { OrderCreatedEvent } from '../model/OrderCreatedEvent'
import { UpdateOrderCommand } from '../model/UpdateOrderCommand'

export interface ISyncOrderWorkerService {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {ForbiddenOrderStatusTransitionError}
   * @throws {RedundantOrderStatusTransitionError}
   * @throws {NotReadyOrderStatusTransitionError}
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
   * @throws {NotReadyOrderStatusTransitionError}
   * @throws {DuplicateEventRaisedError}
   * @throws {InvalidOperationError}
   * @throws {UnrecognizedError}
   */
  public async syncOrder(incomingOrderEvent: IncomingOrderEvent): Promise<void> {
    const logContext = 'SyncOrderWorkerService.syncOrder'
    console.info(`${logContext} init:`, { incomingOrderEvent })

    // The input IncomingOrderEvent should already be valid because it can only be built through the same
    // IncomingOrderEvent class which enforces strict validation. Still we perform just enough validation to
    // prevent unlikely but possible uncaught exceptions for some properties that are accessed directly.
    this.validateIncomingOrderEvent(incomingOrderEvent)

    const isOrderPlacedEvent = IncomingOrderEvent.isOrderPlacedEvent(incomingOrderEvent)
    const existingOrderData = await this.getOrder(incomingOrderEvent.eventData.orderId)

    // When IT IS an OrderPlacedEvent and the OrderData DOES NOT exist in the database then we need to
    // create the Order and then raise the event. This is the starting point for the Order.
    if (isOrderPlacedEvent && !existingOrderData) {
      const orderData = await this.createOrder(incomingOrderEvent)
      await this.raiseOrderCreatedEvent(incomingOrderEvent.eventName, orderData)
      return
    }

    // When IT IS an OrderPlacedEvent and the OrderData DOES exist in the database, then we only try
    // to raise the event again because the intuition is that is was tried before but it failed.
    if (isOrderPlacedEvent && existingOrderData) {
      await this.raiseOrderCreatedEvent(incomingOrderEvent.eventName, existingOrderData)
      return
    }

    // When IT IS NOT an OrderPlacedEvent and the OrderData DOES exist in the database, then we need to
    // update the Order to a new state. No event needs to be raised because we are in tracking mode.
    if (!isOrderPlacedEvent && existingOrderData) {
      await this.updateOrder(incomingOrderEvent, existingOrderData)
      return
    }

    const invalidOpsError = InvalidOperationError.from('non_transient')
    throw invalidOpsError
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateIncomingOrderEvent(incomingOrderEvent: IncomingOrderEvent): void {
    const logContext = 'SyncOrderWorkerService.validateIncomingOrderEvent'
    console.info(`${logContext} init:`, { incomingOrderEvent })

    if (
      incomingOrderEvent instanceof IncomingOrderEvent === false ||
      incomingOrderEvent.eventData == null ||
      incomingOrderEvent.eventData.orderId == null
    ) {
      const invalidArgumentsError = InvalidArgumentsError.from()
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

    const getOrderCommand = GetOrderCommand.validateAndBuild({ orderId })
    const existingOrderData = await this.dbGetOrderClient.getOrder(getOrderCommand)
    return existingOrderData
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {ForbiddenOrderStatusTransitionError}
   * @throws {UnrecognizedError}
   */
  private async createOrder(incomingOrderEvent: IncomingOrderEvent): Promise<OrderData> {
    const logContext = 'SyncOrderWorkerService.createOrder'
    console.info(`${logContext} init:`, { incomingOrderEvent })

    const createOrderCommand = CreateOrderCommand.validateAndBuild({ incomingOrderEvent })
    const orderData = await this.dbCreateOrderClient.createOrder(createOrderCommand)
    return orderData
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {ForbiddenOrderStatusTransitionError}
   * @throws {RedundantOrderStatusTransitionError}
   * @throws {NotReadyOrderStatusTransitionError}
   * @throws {InvalidOperationError}
   */
  private async updateOrder(incomingOrderEvent: IncomingOrderEvent, existingOrderData: OrderData): Promise<void> {
    const logContext = 'SyncOrderWorkerService.updateOrder'
    console.info(`${logContext} init:`, { incomingOrderEvent, existingOrderData })

    const updateOrderCommand = UpdateOrderCommand.validateAndBuild({ incomingOrderEvent, existingOrderData })
    await this.dbUpdateOrderClient.updateOrder(updateOrderCommand)
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async raiseOrderCreatedEvent(incomingEventName: OrderEventName, orderData: OrderData): Promise<void> {
    const logContext = 'SyncOrderWorkerService.raiseOrderCreatedEvent'
    console.info(`${logContext} init:`, { incomingEventName, orderData })

    const orderCreatedEvent = OrderCreatedEvent.validateAndBuild({ incomingEventName, orderData })
    await this.esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(orderCreatedEvent)
  }
}
