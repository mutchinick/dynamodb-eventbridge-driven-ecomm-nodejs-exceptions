import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderEvent } from '../../model/OrderEvent'
import { OrderEventName } from '../../model/OrderEventName'
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

export type IncomingOrderEventInput = EventBridgeEvent<string, EventDetail>

type IncomingOrderEventData = TypeUtilsPretty<Pick<OrderData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>>

type IncomingOrderEventProps = OrderEvent<OrderEventName, IncomingOrderEventData>

/**
 *
 */
export class IncomingOrderEvent implements IncomingOrderEventProps {
  /**
   *
   */
  private constructor(
    readonly eventName: OrderEventName,
    readonly eventData: IncomingOrderEventData,
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
    const validInput = this.parseValidateInput(incomingOrderEventInput)
    const { eventName, eventData, createdAt, updatedAt } = validInput
    const { orderId, sku, units, price, userId } = eventData
    const incomingOrderEventProps: IncomingOrderEventProps = {
      eventName,
      eventData: { orderId, sku, units, price, userId },
      createdAt,
      updatedAt,
    }
    return incomingOrderEventProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static parseValidateInput(incomingOrderEventInput: IncomingOrderEventInput): IncomingOrderEventProps {
    const logContext = 'IncomingOrderEvent.parseValidateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      eventName: ValueValidators.validOrderEventName(),
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
