import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { InventoryEvent } from '../../model/InventoryEvent'
import { InventoryEventName } from '../../model/InventoryEventName'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { ValueValidators } from '../../model/ValueValidators'

type EventDetail = {
  eventName: 'INSERT'
  eventSource: 'aws:dynamodb'
  eventID: string
  eventVersion: string
  awsRegion: string
  dynamodb: {
    NewImage: Record<string, AttributeValue>
  }
}

export type IncomingOrderPaymentAcceptedEventInput = EventBridgeEvent<string, EventDetail>

type IncomingOrderPaymentAcceptedEventData = TypeUtilsPretty<
  Pick<OrderAllocationData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type IncomingOrderPaymentAcceptedEventProps = InventoryEvent<
  InventoryEventName.ORDER_PAYMENT_ACCEPTED_EVENT,
  IncomingOrderPaymentAcceptedEventData
>

/**
 *
 */
export class IncomingOrderPaymentAcceptedEvent implements IncomingOrderPaymentAcceptedEventProps {
  /**
   *
   */
  private constructor(
    readonly eventName: InventoryEventName.ORDER_PAYMENT_ACCEPTED_EVENT,
    readonly eventData: IncomingOrderPaymentAcceptedEventData,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    incomingOrderPaymentAcceptedEventInput: IncomingOrderPaymentAcceptedEventInput,
  ): IncomingOrderPaymentAcceptedEvent {
    const logContext = 'IncomingOrderPaymentAcceptedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { incomingOrderPaymentAcceptedEventInput })

    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildProps(incomingOrderPaymentAcceptedEventInput)
      const incomingOrderPaymentAcceptedEvent = new IncomingOrderPaymentAcceptedEvent(
        eventName,
        eventData,
        createdAt,
        updatedAt,
      )
      console.info(`${logContext} exit success:`, { incomingOrderPaymentAcceptedEvent })
      return incomingOrderPaymentAcceptedEvent
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderPaymentAcceptedEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    incomingOrderPaymentAcceptedEventInput: IncomingOrderPaymentAcceptedEventInput,
  ): IncomingOrderPaymentAcceptedEventProps {
    const validInput = this.parseValidateInput(incomingOrderPaymentAcceptedEventInput)
    const { eventName, eventData, createdAt, updatedAt } = validInput
    const { orderId, sku, units, price, userId } = eventData
    const incomingOrderPaymentAcceptedEventProps: IncomingOrderPaymentAcceptedEventProps = {
      eventName,
      eventData: { orderId, sku, units, price, userId },
      createdAt,
      updatedAt,
    }
    return incomingOrderPaymentAcceptedEventProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static parseValidateInput(
    incomingOrderPaymentAcceptedEventInput: IncomingOrderPaymentAcceptedEventInput,
  ): IncomingOrderPaymentAcceptedEventProps {
    const logContext = 'IncomingOrderPaymentAcceptedEvent.parseValidateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      eventName: ValueValidators.validInventoryEventNameLiteral(InventoryEventName.ORDER_PAYMENT_ACCEPTED_EVENT),
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
      const eventDetail = incomingOrderPaymentAcceptedEventInput.detail
      const unverifiedEvent = unmarshall(eventDetail.dynamodb.NewImage)
      const incomingOrderPaymentAcceptedEventProps = schema.parse(
        unverifiedEvent,
      ) as IncomingOrderPaymentAcceptedEventProps
      return incomingOrderPaymentAcceptedEventProps
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingOrderPaymentAcceptedEventInput })
      throw invalidArgumentsError
    }
  }
}
