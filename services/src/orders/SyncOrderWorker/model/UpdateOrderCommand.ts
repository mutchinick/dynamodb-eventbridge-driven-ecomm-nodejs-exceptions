import { z } from 'zod'
import {
  ForbiddenOrderStatusTransitionError,
  InvalidArgumentsError,
  InvalidOperationError,
  NotReadyOrderStatusTransitionError,
  RedundantOrderStatusTransitionError,
} from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingOrderEvent } from './IncomingOrderEvent'

export type UpdateOrderCommandInput = {
  existingOrderData: OrderData
  incomingOrderEvent: IncomingOrderEvent
}

type UpdateOrderCommandData = Pick<OrderData, 'orderId' | 'orderStatus' | 'updatedAt'>

type UpdateOrderCommandProps = {
  readonly orderData: UpdateOrderCommandData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class UpdateOrderCommand implements UpdateOrderCommandProps {
  /**
   *
   */
  private constructor(
    public readonly orderData: UpdateOrderCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {ForbiddenOrderStatusTransitionError}
   * @throws {RedundantOrderStatusTransitionError}
   * @throws {NotReadyOrderStatusTransitionError}
   * @throws {InvalidOperationError}
   */
  public static validateAndBuild(updateOrderCommandInput: UpdateOrderCommandInput): UpdateOrderCommand {
    const logContext = 'UpdateOrderCommand.validateAndBuild'
    console.info(`${logContext} init:`, { updateOrderCommandInput })

    try {
      const { orderData, options } = this.buildProps(updateOrderCommandInput)
      const updateOrderCommand = new UpdateOrderCommand(orderData, options)
      console.info(`${logContext} exit success:`, { updateOrderCommand, updateOrderCommandInput })
      return updateOrderCommand
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, updateOrderCommandInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {ForbiddenOrderStatusTransitionError}
   * @throws {RedundantOrderStatusTransitionError}
   * @throws {NotReadyOrderStatusTransitionError}
   * @throws {InvalidOperationError}
   */
  private static buildProps(updateOrderCommandInput: UpdateOrderCommandInput): UpdateOrderCommandProps {
    this.validateInput(updateOrderCommandInput)

    const { existingOrderData, incomingOrderEvent } = updateOrderCommandInput
    const existingOrderStatus = existingOrderData.orderStatus
    const incomingEventName = incomingOrderEvent.eventName

    const orderId = existingOrderData.orderId
    const newOrderStatus = this.getNewOrderStatus({ existingOrderStatus, incomingEventName })
    const updatedAt = new Date().toISOString()
    return {
      orderData: {
        orderId,
        orderStatus: newOrderStatus,
        updatedAt,
      },
      options: {},
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(updateOrderCommandInput: UpdateOrderCommandInput): void {
    const logContext = 'UpdateOrderCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const existingOrderDataSchema = z.object({
      orderId: ValueValidators.validOrderId(),
      orderStatus: ValueValidators.validOrderStatus(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
      createdAt: ValueValidators.validCreatedAt(),
      updatedAt: ValueValidators.validUpdatedAt(),
    })

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const incomingOrderEventSchema = z.object({
      eventName: ValueValidators.validIncomingEventName(),
      eventData: z.object({
        orderId: ValueValidators.validOrderId(),
        orderStatus: ValueValidators.validOrderStatus().optional(),
        sku: ValueValidators.validSku().optional(),
        units: ValueValidators.validUnits().optional(),
        price: ValueValidators.validPrice().optional(),
        userId: ValueValidators.validUserId().optional(),
        createdAt: ValueValidators.validCreatedAt().optional(),
        updatedAt: ValueValidators.validUpdatedAt().optional(),
      }),
      createdAt: ValueValidators.validCreatedAt(),
      updatedAt: ValueValidators.validUpdatedAt(),
    })

    const schema = z.object({
      existingOrderData: existingOrderDataSchema,
      incomingOrderEvent: incomingOrderEventSchema,
    })

    try {
      schema.parse(updateOrderCommandInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, updateOrderCommandInput })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {ForbiddenOrderStatusTransitionError}
   * @throws {RedundantOrderStatusTransitionError}
   * @throws {NotReadyOrderStatusTransitionError}
   * @throws {InvalidOperationError}
   */
  private static getNewOrderStatus({
    existingOrderStatus,
    incomingEventName,
  }: {
    existingOrderStatus: OrderStatus
    incomingEventName: OrderEventName
  }): OrderStatus {
    const logContext = 'UpdateOrderCommand.getNewOrderStatus'

    const forbiddenError = ForbiddenOrderStatusTransitionError.from()
    const redundancyError = RedundantOrderStatusTransitionError.from()
    const notReadyError = NotReadyOrderStatusTransitionError.from()

    // This reads: Existing OrderStatus upon receiving OrderEventName then...
    const orderStatusTransitionRules: Record<
      OrderStatus,
      Record<
        OrderEventName,
        | OrderStatus
        | ForbiddenOrderStatusTransitionError
        | RedundantOrderStatusTransitionError
        | NotReadyOrderStatusTransitionError
      >
    > = {
      ORDER_CREATED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenError,
        ORDER_CREATED_EVENT: redundancyError,
        ORDER_STOCK_DEPLETED_EVENT: OrderStatus.ORDER_STOCK_DEPLETED_STATUS,
        ORDER_STOCK_ALLOCATED_EVENT: OrderStatus.ORDER_STOCK_ALLOCATED_STATUS,
        ORDER_PAYMENT_REJECTED_EVENT: notReadyError,
        ORDER_PAYMENT_ACCEPTED_EVENT: notReadyError,
        ORDER_FULFILLED_EVENT: notReadyError,
        ORDER_PACKAGED_EVENT: notReadyError,
        ORDER_SHIPPED_EVENT: notReadyError,
        ORDER_DELIVERED_EVENT: notReadyError,
        ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
      },
      ORDER_STOCK_DEPLETED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenError,
        ORDER_CREATED_EVENT: forbiddenError,
        ORDER_STOCK_DEPLETED_EVENT: redundancyError,
        ORDER_STOCK_ALLOCATED_EVENT: forbiddenError,
        ORDER_PAYMENT_REJECTED_EVENT: forbiddenError,
        ORDER_PAYMENT_ACCEPTED_EVENT: forbiddenError,
        ORDER_FULFILLED_EVENT: forbiddenError,
        ORDER_PACKAGED_EVENT: forbiddenError,
        ORDER_SHIPPED_EVENT: forbiddenError,
        ORDER_DELIVERED_EVENT: forbiddenError,
        ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
      },
      ORDER_STOCK_ALLOCATED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenError,
        ORDER_CREATED_EVENT: forbiddenError,
        ORDER_STOCK_DEPLETED_EVENT: forbiddenError,
        ORDER_STOCK_ALLOCATED_EVENT: redundancyError,
        ORDER_PAYMENT_REJECTED_EVENT: OrderStatus.ORDER_PAYMENT_REJECTED_STATUS,
        ORDER_PAYMENT_ACCEPTED_EVENT: OrderStatus.ORDER_PAYMENT_ACCEPTED_STATUS,
        ORDER_FULFILLED_EVENT: notReadyError,
        ORDER_PACKAGED_EVENT: notReadyError,
        ORDER_SHIPPED_EVENT: notReadyError,
        ORDER_DELIVERED_EVENT: notReadyError,
        ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
      },
      ORDER_PAYMENT_REJECTED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenError,
        ORDER_CREATED_EVENT: forbiddenError,
        ORDER_STOCK_DEPLETED_EVENT: forbiddenError,
        ORDER_STOCK_ALLOCATED_EVENT: forbiddenError,
        ORDER_PAYMENT_REJECTED_EVENT: redundancyError,
        ORDER_PAYMENT_ACCEPTED_EVENT: forbiddenError,
        ORDER_FULFILLED_EVENT: forbiddenError,
        ORDER_PACKAGED_EVENT: forbiddenError,
        ORDER_SHIPPED_EVENT: forbiddenError,
        ORDER_DELIVERED_EVENT: forbiddenError,
        ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
      },
      ORDER_PAYMENT_ACCEPTED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenError,
        ORDER_CREATED_EVENT: forbiddenError,
        ORDER_STOCK_DEPLETED_EVENT: forbiddenError,
        ORDER_STOCK_ALLOCATED_EVENT: forbiddenError,
        ORDER_PAYMENT_REJECTED_EVENT: forbiddenError,
        ORDER_PAYMENT_ACCEPTED_EVENT: redundancyError,
        ORDER_FULFILLED_EVENT: OrderStatus.ORDER_FULFILLED_STATUS,
        ORDER_PACKAGED_EVENT: notReadyError,
        ORDER_SHIPPED_EVENT: notReadyError,
        ORDER_DELIVERED_EVENT: notReadyError,
        ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
      },
      ORDER_FULFILLED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenError,
        ORDER_CREATED_EVENT: forbiddenError,
        ORDER_STOCK_DEPLETED_EVENT: forbiddenError,
        ORDER_STOCK_ALLOCATED_EVENT: forbiddenError,
        ORDER_PAYMENT_REJECTED_EVENT: forbiddenError,
        ORDER_PAYMENT_ACCEPTED_EVENT: forbiddenError,
        ORDER_FULFILLED_EVENT: redundancyError,
        ORDER_PACKAGED_EVENT: OrderStatus.ORDER_PACKAGED_STATUS,
        ORDER_SHIPPED_EVENT: notReadyError,
        ORDER_DELIVERED_EVENT: notReadyError,
        ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
      },
      ORDER_PACKAGED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenError,
        ORDER_CREATED_EVENT: forbiddenError,
        ORDER_STOCK_DEPLETED_EVENT: forbiddenError,
        ORDER_STOCK_ALLOCATED_EVENT: forbiddenError,
        ORDER_PAYMENT_REJECTED_EVENT: forbiddenError,
        ORDER_PAYMENT_ACCEPTED_EVENT: forbiddenError,
        ORDER_FULFILLED_EVENT: forbiddenError,
        ORDER_PACKAGED_EVENT: redundancyError,
        ORDER_SHIPPED_EVENT: OrderStatus.ORDER_SHIPPED_STATUS,
        ORDER_DELIVERED_EVENT: notReadyError,
        ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
      },
      ORDER_SHIPPED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenError,
        ORDER_CREATED_EVENT: forbiddenError,
        ORDER_STOCK_DEPLETED_EVENT: forbiddenError,
        ORDER_STOCK_ALLOCATED_EVENT: forbiddenError,
        ORDER_PAYMENT_REJECTED_EVENT: forbiddenError,
        ORDER_PAYMENT_ACCEPTED_EVENT: forbiddenError,
        ORDER_FULFILLED_EVENT: forbiddenError,
        ORDER_PACKAGED_EVENT: forbiddenError,
        ORDER_SHIPPED_EVENT: redundancyError,
        ORDER_DELIVERED_EVENT: OrderStatus.ORDER_DELIVERED_STATUS,
        ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
      },
      ORDER_DELIVERED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenError,
        ORDER_CREATED_EVENT: forbiddenError,
        ORDER_STOCK_DEPLETED_EVENT: forbiddenError,
        ORDER_STOCK_ALLOCATED_EVENT: forbiddenError,
        ORDER_PAYMENT_REJECTED_EVENT: forbiddenError,
        ORDER_PAYMENT_ACCEPTED_EVENT: forbiddenError,
        ORDER_FULFILLED_EVENT: forbiddenError,
        ORDER_PACKAGED_EVENT: forbiddenError,
        ORDER_SHIPPED_EVENT: forbiddenError,
        ORDER_DELIVERED_EVENT: redundancyError,
        ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
      },
      ORDER_CANCELED_STATUS: {
        ORDER_PLACED_EVENT: forbiddenError,
        ORDER_CREATED_EVENT: forbiddenError,
        ORDER_STOCK_DEPLETED_EVENT: forbiddenError,
        ORDER_STOCK_ALLOCATED_EVENT: forbiddenError,
        ORDER_PAYMENT_REJECTED_EVENT: forbiddenError,
        ORDER_PAYMENT_ACCEPTED_EVENT: forbiddenError,
        ORDER_FULFILLED_EVENT: forbiddenError,
        ORDER_PACKAGED_EVENT: forbiddenError,
        ORDER_SHIPPED_EVENT: forbiddenError,
        ORDER_DELIVERED_EVENT: forbiddenError,
        ORDER_CANCELED_EVENT: redundancyError,
      },
    }

    const eventNameToOrderStatusMap = orderStatusTransitionRules[existingOrderStatus]
    const newOrderStatus = eventNameToOrderStatusMap?.[incomingEventName]

    if (!newOrderStatus) {
      const invalidOperationError = InvalidOperationError.from('non-transient')
      console.error(`${logContext} exit error:`, { invalidOperationError, existingOrderStatus, incomingEventName })
      throw invalidOperationError
    }

    if (newOrderStatus instanceof Error) {
      const newOrderStatusError = newOrderStatus
      console.error(`${logContext} exit error:`, { newOrderStatusError, existingOrderStatus, incomingEventName })
      throw newOrderStatusError
    }

    return newOrderStatus
  }
}
