import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { PaymentsEvent } from '../../model/PaymentsEvent'
import { PaymentsEventName } from '../../model/PaymentsEventName'
import { ValueValidators } from '../../model/ValueValidators'

export type OrderPaymentRejectedEventInput = TypeUtilsPretty<
  Pick<OrderPaymentData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type OrderPaymentRejectedEventData = TypeUtilsPretty<
  Pick<OrderPaymentData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type OrderPaymentRejectedEventProps = PaymentsEvent<
  PaymentsEventName.ORDER_PAYMENT_REJECTED_EVENT,
  OrderPaymentRejectedEventData
>

/**
 *
 */
export class OrderPaymentRejectedEvent implements OrderPaymentRejectedEventProps {
  /**
   *
   */
  private constructor(
    public readonly eventName: PaymentsEventName.ORDER_PAYMENT_REJECTED_EVENT,
    public readonly eventData: OrderPaymentRejectedEventData,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    orderPaymentRejectedEventInput: OrderPaymentRejectedEventInput,
  ): OrderPaymentRejectedEvent {
    const logContext = 'OrderPaymentRejectedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { orderPaymentRejectedEventInput })

    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildProps(orderPaymentRejectedEventInput)
      const orderPaymentRejectedEvent = new OrderPaymentRejectedEvent(eventName, eventData, createdAt, updatedAt)
      console.info(`${logContext} exit success:`, { orderPaymentRejectedEvent, orderPaymentRejectedEventInput })
      return orderPaymentRejectedEvent
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, orderPaymentRejectedEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    orderPaymentRejectedEventInput: OrderPaymentRejectedEventInput,
  ): OrderPaymentRejectedEventProps {
    this.validateInput(orderPaymentRejectedEventInput)

    const { orderId, sku, units, price, userId } = orderPaymentRejectedEventInput
    const currentDate = new Date().toISOString()
    const orderPaymentRejectedEventProps: OrderPaymentRejectedEventProps = {
      eventName: PaymentsEventName.ORDER_PAYMENT_REJECTED_EVENT,
      eventData: { orderId, sku, units, price, userId },
      createdAt: currentDate,
      updatedAt: currentDate,
    }
    return orderPaymentRejectedEventProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(orderPaymentRejectedEventInput: OrderPaymentRejectedEventInput): void {
    const logContext = 'OrderPaymentRejectedEvent.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
    })

    try {
      schema.parse(orderPaymentRejectedEventInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderPaymentRejectedEventInput })
      throw invalidArgumentsError
    }
  }
}
