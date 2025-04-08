import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { z } from 'zod'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { ValueValidators } from '../../model/ValueValidators'
import { WarehouseEvent } from '../../model/WarehouseEvent'
import { WarehouseEventName } from '../../model/WarehouseEventName'

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

export type IncomingOrderPaymentRejectedEventInput = EventBridgeEvent<string, EventDetail>

type IncomingOrderPaymentRejectedEventData = Pick<OrderAllocationData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>

type IncomingOrderPaymentRejectedEventProps = WarehouseEvent<
  WarehouseEventName.ORDER_PAYMENT_REJECTED_EVENT,
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
    readonly eventName: WarehouseEventName.ORDER_PAYMENT_REJECTED_EVENT,
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
    const incomingOrderPaymentRejectedEventProps: IncomingOrderPaymentRejectedEventProps = {
      eventName: validInput.eventName,
      eventData: {
        orderId: validInput.eventData.orderId,
        sku: validInput.eventData.sku,
        units: validInput.eventData.units,
        price: validInput.eventData.price,
        userId: validInput.eventData.userId,
      },
      createdAt: validInput.createdAt,
      updatedAt: validInput.updatedAt,
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
      eventName: ValueValidators.validOrderEventNameGroup([WarehouseEventName.ORDER_PAYMENT_REJECTED_EVENT]),
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
      const incomingOrderPaymentRejectedEvent = schema.parse(unverifiedEvent) as IncomingOrderPaymentRejectedEventProps
      return incomingOrderPaymentRejectedEvent
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingOrderPaymentRejectedEventInput })
      throw invalidArgumentsError
    }
  }
}
