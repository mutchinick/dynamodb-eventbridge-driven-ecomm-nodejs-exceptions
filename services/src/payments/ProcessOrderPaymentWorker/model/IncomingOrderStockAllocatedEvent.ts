import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { PaymentsEvent } from '../../model/PaymentsEvent'
import { PaymentsEventName } from '../../model/PaymentsEventName'
import { ValueValidators } from '../../model/ValueValidators'

type EventDetail = {
  eventName: 'INSERT'
  eventSource: 'aws:dynamodb'
  eventID: string
  eventVersion: string
  awsRegion: string
  dynamodb: {
    NewImage: AttributeValue | Record<string, AttributeValue>
  }
}

export type IncomingOrderStockAllocatedEventInput = EventBridgeEvent<string, EventDetail>

type IncomingOrderStockAllocatedEventData = TypeUtilsPretty<
  Pick<OrderPaymentData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type IncomingOrderStockAllocatedEventProps = PaymentsEvent<
  PaymentsEventName.ORDER_STOCK_ALLOCATED_EVENT,
  IncomingOrderStockAllocatedEventData
>

/**
 *
 */
export class IncomingOrderStockAllocatedEvent implements IncomingOrderStockAllocatedEventProps {
  /**
   *
   */
  private constructor(
    readonly eventName: PaymentsEventName.ORDER_STOCK_ALLOCATED_EVENT,
    readonly eventData: IncomingOrderStockAllocatedEventData,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    incomingOrderStockAllocatedEventInput: IncomingOrderStockAllocatedEventInput,
  ): IncomingOrderStockAllocatedEvent {
    const logContext = 'IncomingOrderStockAllocatedEvent.validateInput'
    console.info(`${logContext} init:`, { incomingOrderStockAllocatedEventInput })

    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildProps(incomingOrderStockAllocatedEventInput)
      const incomingOrderStockAllocatedEvent = new IncomingOrderStockAllocatedEvent(
        eventName,
        eventData,
        createdAt,
        updatedAt,
      )
      console.info(`${logContext} exit success:`, {
        incomingOrderStockAllocatedEvent,
        incomingOrderStockAllocatedEventInput,
      })
      return incomingOrderStockAllocatedEvent
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderStockAllocatedEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    incomingOrderStockAllocatedEventInput: IncomingOrderStockAllocatedEventInput,
  ): IncomingOrderStockAllocatedEventProps {
    const validInput = this.parseValidateInput(incomingOrderStockAllocatedEventInput)
    const { eventName, eventData, createdAt, updatedAt } = validInput
    const { orderId, sku, units, price, userId } = eventData
    const incomingOrderStockAllocatedEventProps: IncomingOrderStockAllocatedEventProps = {
      eventName,
      eventData: { orderId, sku, units, price, userId },
      createdAt,
      updatedAt,
    }
    return incomingOrderStockAllocatedEventProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static parseValidateInput(
    incomingOrderStockAllocatedEventInput: IncomingOrderStockAllocatedEventInput,
  ): IncomingOrderStockAllocatedEventProps {
    const logContext = 'IncomingOrderStockAllocatedEvent.parseValidateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      eventName: ValueValidators.validPaymentsEventNameLiteral(PaymentsEventName.ORDER_STOCK_ALLOCATED_EVENT),
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

    try {
      const eventDetail = incomingOrderStockAllocatedEventInput.detail
      const unverifiedEvent = unmarshall(eventDetail.dynamodb.NewImage)
      const incomingOrderStockAllocatedEventProps = schema.parse(
        unverifiedEvent,
      ) as IncomingOrderStockAllocatedEventProps
      return incomingOrderStockAllocatedEventProps
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingOrderStockAllocatedEventInput })
      throw invalidArgumentsError
    }
  }
}
