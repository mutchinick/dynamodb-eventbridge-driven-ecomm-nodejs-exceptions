import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import {
  ForbiddenOrderStatusTransitionError,
  InvalidArgumentsError,
  InvalidOperationError,
  RedundantOrderStatusTransitionError,
  StaleOrderStatusTransitionError,
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

type UpdateOrderCommandData = TypeUtilsPretty<Pick<OrderData, 'orderId' | 'orderStatus' | 'updatedAt'>>

type UpdateOrderCommandProps = {
  readonly commandData: UpdateOrderCommandData
  readonly options?: Record<string, unknown>
}

type UpdateOrderErrorFactory = () =>
  | ForbiddenOrderStatusTransitionError
  | RedundantOrderStatusTransitionError
  | StaleOrderStatusTransitionError

/**
 *
 */
export class UpdateOrderCommand implements UpdateOrderCommandProps {
  /**
   *
   */
  private constructor(
    public readonly commandData: UpdateOrderCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {ForbiddenOrderStatusTransitionError}
   * @throws {RedundantOrderStatusTransitionError}
   * @throws {StaleOrderStatusTransitionError}
   * @throws {InvalidOperationError}
   */
  public static validateAndBuild(updateOrderCommandInput: UpdateOrderCommandInput): UpdateOrderCommand {
    const logContext = 'this.validateAndBuild'
    console.info(`${logContext} init:`, { updateOrderCommandInput })

    try {
      const { commandData, options } = this.buildProps(updateOrderCommandInput)
      const updateOrderCommand = new UpdateOrderCommand(commandData, options)
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
   * @throws {StaleOrderStatusTransitionError}
   * @throws {InvalidOperationError}
   */
  private static buildProps(updateOrderCommandInput: UpdateOrderCommandInput): UpdateOrderCommandProps {
    this.validateInput(updateOrderCommandInput)

    const { existingOrderData, incomingOrderEvent } = updateOrderCommandInput
    const existingOrderStatus = existingOrderData.orderStatus
    const incomingEventName = incomingOrderEvent.eventName

    const newOrderStatus = this.computeNewOrderStatus({ existingOrderStatus, incomingEventName })
    const currentDate = new Date().toISOString()
    const updateOrderCommandProps: UpdateOrderCommandProps = {
      commandData: {
        orderId: existingOrderData.orderId,
        orderStatus: newOrderStatus,
        updatedAt: currentDate,
      },
      options: {},
    }
    return updateOrderCommandProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(updateOrderCommandInput: UpdateOrderCommandInput): void {
    const logContext = 'this.validateInput'

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
      eventName: ValueValidators.validOrderEventName(),
      eventData: z.object({
        orderId: ValueValidators.validOrderId(),
        sku: ValueValidators.validSku(),
        units: ValueValidators.validUnits(),
        price: ValueValidators.validPrice(),
        userId: ValueValidators.validUserId(),
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
   * @throws {StaleOrderStatusTransitionError}
   * @throws {InvalidOperationError}
   */
  private static computeNewOrderStatus({
    existingOrderStatus,
    incomingEventName,
  }: {
    existingOrderStatus: OrderStatus
    incomingEventName: OrderEventName
  }): OrderStatus {
    const logContext = 'this.computeNewOrderStatus'

    const eventToStatusMap = this.orderStatusTransitionRules[existingOrderStatus]
    const statusOrErrorFactory = eventToStatusMap?.[incomingEventName]

    if (!statusOrErrorFactory) {
      // NOTE: Unreachable with current tests because of guards, but helps make the system fundamentally safe.
      const error = new Error(`Expected valid event but received "${incomingEventName}"`)
      const invalidOperationError = InvalidOperationError.nonTransient(error)
      console.error(`${logContext} exit error:`, { invalidOperationError, existingOrderStatus, incomingEventName })
      throw invalidOperationError
    }

    const isErrorFactory = (val: unknown): val is UpdateOrderErrorFactory => typeof val === 'function'

    if (isErrorFactory(statusOrErrorFactory)) {
      const orderStatusTransitionError = statusOrErrorFactory()
      console.error(`${logContext} exit error:`, {
        orderStatusTransitionError,
        existingOrderStatus,
        incomingEventName,
      })
      throw orderStatusTransitionError
    }

    const newOrderStatus = statusOrErrorFactory as OrderStatus
    return newOrderStatus
  }

  /**
   * ForbiddenOrderStatusTransitionError: something nasty happened upstream.
   * Transition will not be allowed nor should it be retried.
   */
  private static forbiddenErrorFactory(): ForbiddenOrderStatusTransitionError {
    const error = new Error('Order status transition is forbidden (non-transient error, cannot retry)')
    return ForbiddenOrderStatusTransitionError.from(error)
  }

  /**
   * RedundantOrderStatusTransitionError: probably a glitch happened upstream.
   * Transition will not be allowed nor should it be retried.
   */
  private static redundancyErrorFactory(): RedundantOrderStatusTransitionError {
    const error = new Error('Order status transition is redundant (non-transient error, cannot retry)')
    return RedundantOrderStatusTransitionError.from(error)
  }

  /**
   * StaleOrderStatusTransitionError: event got here late and is no longer valid.
   * Transition will not be allowed nor should it be retried.
   */
  private static staleErrorFactory(): StaleOrderStatusTransitionError {
    const error = new Error('Order status transition is stale (non-transient error, cannot retry)')
    return StaleOrderStatusTransitionError.from(error)
  }

  /**
   * Rules for transitioning order statuses based on incoming events.
   * Each order status maps to a set of events and their resulting statuses or errors.
   */
  private static readonly orderStatusTransitionRules: Record<
    OrderStatus,
    Record<OrderEventName, OrderStatus | UpdateOrderErrorFactory>
  > = {
    ORDER_CREATED_STATUS: {
      ORDER_PLACED_EVENT: this.staleErrorFactory,
      ORDER_CREATED_EVENT: this.redundancyErrorFactory,
      ORDER_STOCK_DEPLETED_EVENT: OrderStatus.ORDER_STOCK_DEPLETED_STATUS,
      ORDER_STOCK_ALLOCATED_EVENT: OrderStatus.ORDER_STOCK_ALLOCATED_STATUS,
      ORDER_PAYMENT_REJECTED_EVENT: OrderStatus.ORDER_PAYMENT_REJECTED_STATUS,
      ORDER_PAYMENT_ACCEPTED_EVENT: OrderStatus.ORDER_PAYMENT_ACCEPTED_STATUS,
      ORDER_SHIPPED_EVENT: OrderStatus.ORDER_SHIPPED_STATUS,
      ORDER_DELIVERED_EVENT: OrderStatus.ORDER_DELIVERED_STATUS,
      ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
    },
    ORDER_STOCK_DEPLETED_STATUS: {
      ORDER_PLACED_EVENT: this.staleErrorFactory,
      ORDER_CREATED_EVENT: this.staleErrorFactory,
      ORDER_STOCK_DEPLETED_EVENT: this.redundancyErrorFactory,
      ORDER_STOCK_ALLOCATED_EVENT: this.forbiddenErrorFactory,
      ORDER_PAYMENT_REJECTED_EVENT: this.forbiddenErrorFactory,
      ORDER_PAYMENT_ACCEPTED_EVENT: this.forbiddenErrorFactory,
      ORDER_SHIPPED_EVENT: this.forbiddenErrorFactory,
      ORDER_DELIVERED_EVENT: this.forbiddenErrorFactory,
      ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
    },
    ORDER_STOCK_ALLOCATED_STATUS: {
      ORDER_PLACED_EVENT: this.staleErrorFactory,
      ORDER_CREATED_EVENT: this.staleErrorFactory,
      ORDER_STOCK_DEPLETED_EVENT: this.forbiddenErrorFactory,
      ORDER_STOCK_ALLOCATED_EVENT: this.redundancyErrorFactory,
      ORDER_PAYMENT_REJECTED_EVENT: OrderStatus.ORDER_PAYMENT_REJECTED_STATUS,
      ORDER_PAYMENT_ACCEPTED_EVENT: OrderStatus.ORDER_PAYMENT_ACCEPTED_STATUS,
      ORDER_SHIPPED_EVENT: OrderStatus.ORDER_SHIPPED_STATUS,
      ORDER_DELIVERED_EVENT: OrderStatus.ORDER_DELIVERED_STATUS,
      ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
    },
    ORDER_PAYMENT_REJECTED_STATUS: {
      ORDER_PLACED_EVENT: this.staleErrorFactory,
      ORDER_CREATED_EVENT: this.staleErrorFactory,
      ORDER_STOCK_DEPLETED_EVENT: this.forbiddenErrorFactory,
      ORDER_STOCK_ALLOCATED_EVENT: this.staleErrorFactory,
      ORDER_PAYMENT_REJECTED_EVENT: this.redundancyErrorFactory,
      ORDER_PAYMENT_ACCEPTED_EVENT: this.forbiddenErrorFactory,
      ORDER_SHIPPED_EVENT: this.forbiddenErrorFactory,
      ORDER_DELIVERED_EVENT: this.forbiddenErrorFactory,
      ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
    },
    ORDER_PAYMENT_ACCEPTED_STATUS: {
      ORDER_PLACED_EVENT: this.staleErrorFactory,
      ORDER_CREATED_EVENT: this.staleErrorFactory,
      ORDER_STOCK_DEPLETED_EVENT: this.forbiddenErrorFactory,
      ORDER_STOCK_ALLOCATED_EVENT: this.staleErrorFactory,
      ORDER_PAYMENT_REJECTED_EVENT: this.forbiddenErrorFactory,
      ORDER_PAYMENT_ACCEPTED_EVENT: this.redundancyErrorFactory,
      ORDER_SHIPPED_EVENT: OrderStatus.ORDER_SHIPPED_STATUS,
      ORDER_DELIVERED_EVENT: OrderStatus.ORDER_DELIVERED_STATUS,
      ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
    },
    ORDER_SHIPPED_STATUS: {
      ORDER_PLACED_EVENT: this.staleErrorFactory,
      ORDER_CREATED_EVENT: this.staleErrorFactory,
      ORDER_STOCK_DEPLETED_EVENT: this.forbiddenErrorFactory,
      ORDER_STOCK_ALLOCATED_EVENT: this.staleErrorFactory,
      ORDER_PAYMENT_REJECTED_EVENT: this.forbiddenErrorFactory,
      ORDER_PAYMENT_ACCEPTED_EVENT: this.staleErrorFactory,
      ORDER_SHIPPED_EVENT: this.redundancyErrorFactory,
      ORDER_DELIVERED_EVENT: OrderStatus.ORDER_DELIVERED_STATUS,
      ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
    },
    ORDER_DELIVERED_STATUS: {
      ORDER_PLACED_EVENT: this.staleErrorFactory,
      ORDER_CREATED_EVENT: this.staleErrorFactory,
      ORDER_STOCK_DEPLETED_EVENT: this.forbiddenErrorFactory,
      ORDER_STOCK_ALLOCATED_EVENT: this.staleErrorFactory,
      ORDER_PAYMENT_REJECTED_EVENT: this.forbiddenErrorFactory,
      ORDER_PAYMENT_ACCEPTED_EVENT: this.staleErrorFactory,
      ORDER_SHIPPED_EVENT: this.staleErrorFactory,
      ORDER_DELIVERED_EVENT: this.redundancyErrorFactory,
      ORDER_CANCELED_EVENT: OrderStatus.ORDER_CANCELED_STATUS,
    },
    ORDER_CANCELED_STATUS: {
      ORDER_PLACED_EVENT: this.staleErrorFactory,
      ORDER_CREATED_EVENT: this.staleErrorFactory,
      ORDER_STOCK_DEPLETED_EVENT: this.staleErrorFactory,
      ORDER_STOCK_ALLOCATED_EVENT: this.staleErrorFactory,
      ORDER_PAYMENT_REJECTED_EVENT: this.staleErrorFactory,
      ORDER_PAYMENT_ACCEPTED_EVENT: this.staleErrorFactory,
      ORDER_SHIPPED_EVENT: this.staleErrorFactory,
      ORDER_DELIVERED_EVENT: this.staleErrorFactory,
      ORDER_CANCELED_EVENT: this.redundancyErrorFactory,
    },
  }
}
