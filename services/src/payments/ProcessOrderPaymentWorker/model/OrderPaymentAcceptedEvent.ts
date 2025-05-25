import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { PaymentsEvent } from '../../model/PaymentsEvent'
import { PaymentsEventName } from '../../model/PaymentsEventName'
import { ValueValidators } from '../../model/ValueValidators'

export type OrderPaymentAcceptedEventInput = TypeUtilsPretty<
  Pick<OrderPaymentData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type OrderPaymentAcceptedEventData = TypeUtilsPretty<
  Pick<OrderPaymentData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type OrderPaymentAcceptedEventProps = PaymentsEvent<
  PaymentsEventName.ORDER_PAYMENT_ACCEPTED_EVENT,
  OrderPaymentAcceptedEventData
>

/**
 *
 */
export class OrderPaymentAcceptedEvent implements OrderPaymentAcceptedEventProps {
  /**
   *
   */
  private constructor(
    public readonly eventName: PaymentsEventName.ORDER_PAYMENT_ACCEPTED_EVENT,
    public readonly eventData: OrderPaymentAcceptedEventData,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    orderPaymentAcceptedEventInput: OrderPaymentAcceptedEventInput,
  ): OrderPaymentAcceptedEvent {
    const logContext = 'OrderPaymentAcceptedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { orderPaymentAcceptedEventInput })

    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildProps(orderPaymentAcceptedEventInput)
      const orderPaymentAcceptedEvent = new OrderPaymentAcceptedEvent(eventName, eventData, createdAt, updatedAt)
      console.info(`${logContext} exit success:`, { orderPaymentAcceptedEvent, orderPaymentAcceptedEventInput })
      return orderPaymentAcceptedEvent
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, orderPaymentAcceptedEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    orderPaymentAcceptedEventInput: OrderPaymentAcceptedEventInput,
  ): OrderPaymentAcceptedEventProps {
    this.validateInput(orderPaymentAcceptedEventInput)

    const { orderId, sku, units, price, userId } = orderPaymentAcceptedEventInput
    const currentDate = new Date().toISOString()
    const orderPaymentAcceptedEventProps: OrderPaymentAcceptedEventProps = {
      eventName: PaymentsEventName.ORDER_PAYMENT_ACCEPTED_EVENT,
      eventData: { orderId, sku, units, price, userId },
      createdAt: currentDate,
      updatedAt: currentDate,
    }
    return orderPaymentAcceptedEventProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(orderPaymentAcceptedEventInput: OrderPaymentAcceptedEventInput): void {
    const logContext = 'OrderPaymentAcceptedEvent.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
    })

    try {
      schema.parse(orderPaymentAcceptedEventInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderPaymentAcceptedEventInput })
      throw invalidArgumentsError
    }
  }
}
