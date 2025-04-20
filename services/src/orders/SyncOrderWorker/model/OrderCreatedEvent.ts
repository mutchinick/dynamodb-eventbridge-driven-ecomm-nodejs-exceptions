import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderEvent } from '../../model/OrderEvent'
import { OrderEventName } from '../../model/OrderEventName'
import { ValueValidators } from '../../model/ValueValidators'

export type OrderCreatedEventInput = TypeUtilsPretty<Pick<OrderData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>>

type OrderCreatedEventData = TypeUtilsPretty<Pick<OrderData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>>

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
      console.error(`${logContext} exit error:`, { error, orderCreatedEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(orderCreatedEventInput: OrderCreatedEventInput): OrderCreatedEventProps {
    this.validateInput(orderCreatedEventInput)

    const { orderId, sku, units, price, userId } = orderCreatedEventInput
    const currentDate = new Date().toISOString()
    const orderCreatedEventProps: OrderCreatedEventProps = {
      eventName: OrderEventName.ORDER_CREATED_EVENT,
      eventData: { orderId, sku, units, price, userId },
      createdAt: currentDate,
      updatedAt: currentDate,
    }
    return orderCreatedEventProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(orderCreatedEventInput: OrderCreatedEventInput): void {
    const logContext = 'OrderCreatedEvent.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
    })

    try {
      schema.parse(orderCreatedEventInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderCreatedEventInput })
      throw invalidArgumentsError
    }
  }
}
