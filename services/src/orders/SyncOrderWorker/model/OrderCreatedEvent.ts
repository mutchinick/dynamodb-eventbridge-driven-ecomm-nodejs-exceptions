import { z } from 'zod'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderEvent, OrderEventData } from '../../model/OrderEvent'
import { OrderEventName } from '../../model/OrderEventName'
import { ValueValidators } from '../../model/ValueValidators'

type OrderCreatedEventData = Required<OrderEventData>

export interface OrderCreatedEventInput {
  incomingEventName: OrderEventName
  orderData: OrderData
}

type OrderCreatedEventProps = OrderEvent<string, OrderCreatedEventData>

/**
 *
 */
export class OrderCreatedEvent implements OrderCreatedEventProps {
  /**
   *
   */
  private constructor(
    public readonly eventName: string,
    public readonly eventData: OrderCreatedEventData,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(orderCreatedEventInput: OrderCreatedEventInput): OrderCreatedEvent {
    const logContext = 'OrderCreatedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { orderCreatedEventInput })

    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildProps(orderCreatedEventInput)
      const orderCreatedEvent = new OrderCreatedEvent(eventName, eventData, createdAt, updatedAt)
      console.info(`${logContext} exit success:`, { orderCreatedEvent, orderCreatedEventInput })
      return orderCreatedEvent
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
      console.error(`${logContext} exit error:`, { error, orderCreatedEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(orderCreatedEventInput: OrderCreatedEventInput): OrderCreatedEventProps {
    this.validateInput(orderCreatedEventInput)

    const { orderData } = orderCreatedEventInput
    const { orderId, orderStatus, sku, units, price, userId, createdAt, updatedAt } = orderData
    const date = new Date().toISOString()
    const orderCreatedEventProps: OrderCreatedEventProps = {
      eventName: OrderEventName.ORDER_CREATED_EVENT,
      eventData: {
        orderId,
        orderStatus,
        sku,
        units,
        price,
        userId,
        createdAt,
        updatedAt,
      },
      createdAt: date,
      updatedAt: date,
    }
    return orderCreatedEventProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(orderCreatedEventInput: OrderCreatedEventInput): void {
    const logContext = 'OrderCreatedEvent.validateInput'

    const schema = z.object({
      incomingEventName: ValueValidators.validOrderPlacedEventName(),
      orderData: z.object({
        orderId: ValueValidators.validOrderId(),
        orderStatus: ValueValidators.validOrderStatus(),
        sku: ValueValidators.validSku(),
        units: ValueValidators.validUnits(),
        price: ValueValidators.validPrice(),
        userId: ValueValidators.validUserId(),
        createdAt: ValueValidators.validCreatedAt(),
        updatedAt: ValueValidators.validUpdatedAt(),
      }),
    })

    try {
      schema.parse(orderCreatedEventInput)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { error, orderCreatedEventInput })
      throw invalidArgumentsError
    }
  }
}
