import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { z } from 'zod'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderEvent, OrderEventData } from '../../model/OrderEvent'
import { OrderEventName } from '../../model/OrderEventName'
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

export type IncomingOrderEventInput = EventBridgeEvent<string, EventDetail>

type IncomingOrderEventProps = OrderEvent<OrderEventName, OrderEventData>

/**
 *
 */
export class IncomingOrderEvent implements IncomingOrderEventProps {
  /**
   *
   */
  private constructor(
    readonly eventName: OrderEventName,
    readonly eventData: OrderEventData,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  /**
   *
   */
  public static isOrderPlacedEvent(incomingOrderEvent: IncomingOrderEvent): boolean {
    return incomingOrderEvent.eventName === OrderEventName.ORDER_PLACED_EVENT
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(incomingOrderEventInput: IncomingOrderEventInput): IncomingOrderEvent {
    const logContext = 'IncomingOrderEvent.validateAndBuild'
    console.info(`${logContext} init:`, { incomingOrderEventInput })

    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildProps(incomingOrderEventInput)
      const incomingOrderEvent = new IncomingOrderEvent(eventName, eventData, createdAt, updatedAt)
      console.info(`${logContext} exit success:`, { incomingOrderEvent, incomingOrderEventInput })
      return incomingOrderEvent
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(incomingOrderEventInput: IncomingOrderEventInput): IncomingOrderEventProps {
    return this.parseValidateInput(incomingOrderEventInput)
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static parseValidateInput(incomingOrderEventInput: IncomingOrderEventInput): IncomingOrderEventProps {
    const logContext = 'IncomingOrderEvent.parseValidateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      eventName: ValueValidators.validIncomingEventName(),
      eventData: z.object({
        orderId: ValueValidators.validOrderId(),
        orderStatus: ValueValidators.validOrderStatus().optional(),
        sku: ValueValidators.validSku().optional(),
        units: ValueValidators.validUnits().optional(),
        price: ValueValidators.validPrice().optional(),
        userId: ValueValidators.validUserId().optional(),
        createdAt: ValueValidators.validCreatedAt().optional(),
        updatedAt: ValueValidators.validUpdatedAt().optional(),
      }),
      createdAt: ValueValidators.validCreatedAt(),
      updatedAt: ValueValidators.validUpdatedAt(),
    })

    try {
      const eventDetail = incomingOrderEventInput.detail
      const unverifiedEvent = unmarshall(eventDetail.dynamodb.NewImage)
      const incomingOrderEvent = schema.parse(unverifiedEvent) as IncomingOrderEventProps
      return incomingOrderEvent
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingOrderEventInput })
      throw invalidArgumentsError
    }
  }
}
