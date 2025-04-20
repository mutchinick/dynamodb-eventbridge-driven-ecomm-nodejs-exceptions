import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderEvent } from '../../model/OrderEvent'
import { OrderEventName } from '../../model/OrderEventName'
import { ValueValidators } from '../../model/ValueValidators'

export type OrderPlacedEventInput = TypeUtilsPretty<Pick<OrderData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>>

type OrderPlacedEventData = TypeUtilsPretty<Pick<OrderData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>>

type OrderPlacedEventProps = OrderEvent<OrderEventName.ORDER_PLACED_EVENT, OrderPlacedEventData>

/**
 *
 */
export class OrderPlacedEvent implements OrderPlacedEventProps {
  /**
   *
   */
  private constructor(
    public readonly eventName: OrderEventName.ORDER_PLACED_EVENT,
    public readonly eventData: OrderPlacedEventData,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(orderPlacedEventInput: OrderPlacedEventInput): OrderPlacedEvent {
    const logContext = 'OrderPlacedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { orderPlacedEventInput })

    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildProps(orderPlacedEventInput)
      const orderPlacedEvent = new OrderPlacedEvent(eventName, eventData, createdAt, updatedAt)
      console.info(`${logContext} exit success:`, { orderPlacedEvent, orderPlacedEventInput })
      return orderPlacedEvent
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, orderPlacedEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(orderPlacedEventInput: OrderPlacedEventInput): OrderPlacedEventProps {
    this.validateInput(orderPlacedEventInput)

    const { orderId, sku, units, price, userId } = orderPlacedEventInput
    const date = new Date().toISOString()
    const orderPlacedEventData: OrderPlacedEventData = { orderId, sku, units, price, userId }
    const orderPlacedEventProps: OrderPlacedEventProps = {
      eventName: OrderEventName.ORDER_PLACED_EVENT,
      eventData: orderPlacedEventData,
      createdAt: date,
      updatedAt: date,
    }
    return orderPlacedEventProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(orderPlacedEventInput: OrderPlacedEventData): void {
    const logContext = 'OrderPlacedEvent.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
    })

    try {
      schema.parse(orderPlacedEventInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderPlacedEventInput })
      throw invalidArgumentsError
    }
  }
}
