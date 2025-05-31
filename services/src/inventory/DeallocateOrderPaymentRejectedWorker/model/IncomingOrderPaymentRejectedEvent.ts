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

export type IncomingOrderPaymentRejectedEventInput = EventBridgeEvent<string, EventDetail>

type IncomingOrderPaymentRejectedEventData = TypeUtilsPretty<
  Pick<OrderAllocationData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type IncomingOrderPaymentRejectedEventProps = InventoryEvent<
  InventoryEventName.ORDER_PAYMENT_REJECTED_EVENT,
  IncomingOrderPaymentRejectedEventData
>

/**
 *
 */
export class IncomingOrderPaymentRejectedEvent implements IncomingOrderPaymentRejectedEventProps {
  /**
   *
   */
  private constructor(
    readonly eventName: InventoryEventName.ORDER_PAYMENT_REJECTED_EVENT,
    readonly eventData: IncomingOrderPaymentRejectedEventData,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    incomingOrderPaymentRejectedEventInput: IncomingOrderPaymentRejectedEventInput,
  ): IncomingOrderPaymentRejectedEvent {
    const logContext = 'IncomingOrderPaymentRejectedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { incomingOrderPaymentRejectedEventInput })

    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildProps(incomingOrderPaymentRejectedEventInput)
      const incomingOrderPaymentRejectedEvent = new IncomingOrderPaymentRejectedEvent(
        eventName,
        eventData,
        createdAt,
        updatedAt,
      )
      console.info(`${logContext} exit success:`, { incomingOrderPaymentRejectedEvent })
      return incomingOrderPaymentRejectedEvent
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderPaymentRejectedEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    incomingOrderPaymentRejectedEventInput: IncomingOrderPaymentRejectedEventInput,
  ): IncomingOrderPaymentRejectedEventProps {
    const validInput = this.parseValidateInput(incomingOrderPaymentRejectedEventInput)
    const { eventName, eventData, createdAt, updatedAt } = validInput
    const { orderId, sku, units, price, userId } = eventData
    const incomingOrderPaymentRejectedEventProps: IncomingOrderPaymentRejectedEventProps = {
      eventName,
      eventData: { orderId, sku, units, price, userId },
      createdAt,
      updatedAt,
    }
    return incomingOrderPaymentRejectedEventProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static parseValidateInput(
    incomingOrderPaymentRejectedEventInput: IncomingOrderPaymentRejectedEventInput,
  ): IncomingOrderPaymentRejectedEventProps {
    const logContext = 'IncomingOrderPaymentRejectedEvent.parseValidateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      eventName: ValueValidators.validInventoryEventNameLiteral(InventoryEventName.ORDER_PAYMENT_REJECTED_EVENT),
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
      const eventDetail = incomingOrderPaymentRejectedEventInput.detail
      const unverifiedEvent = unmarshall(eventDetail.dynamodb.NewImage)
      const incomingOrderPaymentRejectedEventProps = schema.parse(
        unverifiedEvent,
      ) as IncomingOrderPaymentRejectedEventProps
      return incomingOrderPaymentRejectedEventProps
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingOrderPaymentRejectedEventInput })
      throw invalidArgumentsError
    }
  }
}
