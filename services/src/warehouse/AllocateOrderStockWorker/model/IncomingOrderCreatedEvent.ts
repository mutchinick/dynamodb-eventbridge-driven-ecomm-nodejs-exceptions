import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { z } from 'zod'
import { InvalidArgumentsError } from '../../errors/AppError'
import { AllocateOrderStockData } from '../../model/AllocateOrderStockData'
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

export type IncomingOrderCreatedEventInput = EventBridgeEvent<string, EventDetail>

// TODO: Not all events provide the full Order data
// https://github.com/mutchinick/dynamodb-eventbridge-driven-ecomm-nodejs-exceptions/issues/1
type IncomingOrderCreatedEventData = Pick<AllocateOrderStockData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
// type IncomingOrderCreatedEventData = Pick<AllocateOrderStockData, 'sku' | 'units' | 'orderId'>

type IncomingOrderCreatedEventProps = WarehouseEvent<
  WarehouseEventName.ORDER_CREATED_EVENT,
  IncomingOrderCreatedEventData
>

/**
 *
 */
export class IncomingOrderCreatedEvent implements IncomingOrderCreatedEventProps {
  /**
   *
   */
  private constructor(
    readonly eventName: WarehouseEventName.ORDER_CREATED_EVENT,
    readonly eventData: IncomingOrderCreatedEventData,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    incomingOrderCreatedEventInput: IncomingOrderCreatedEventInput,
  ): IncomingOrderCreatedEvent {
    const logContext = 'IncomingOrderCreatedEvent.validateInput'
    console.info(`${logContext} init:`, { incomingOrderCreatedEventInput })

    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildProps(incomingOrderCreatedEventInput)
      const incomingOrderCreated = new IncomingOrderCreatedEvent(eventName, eventData, createdAt, updatedAt)
      console.info(`${logContext} exit success:`, { incomingOrderCreated, incomingOrderCreatedEventInput })
      return incomingOrderCreated
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderCreatedEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    incomingOrderCreatedEventInput: IncomingOrderCreatedEventInput,
  ): IncomingOrderCreatedEventProps {
    const validInput = this.parseValidateInput(incomingOrderCreatedEventInput)
    const incomingOrderCreatedEventProps: IncomingOrderCreatedEventProps = {
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
    return incomingOrderCreatedEventProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static parseValidateInput(
    incomingOrderCreatedEventInput: IncomingOrderCreatedEventInput,
  ): IncomingOrderCreatedEventProps {
    const logContext = 'IncomingOrderCreatedEvent.parseValidateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      eventName: ValueValidators.validOrderCreatedEventName(),
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
      const eventDetail = incomingOrderCreatedEventInput.detail
      const unverifiedEvent = unmarshall(eventDetail.dynamodb.NewImage)
      const incomingOrderCreatedEvent = schema.parse(unverifiedEvent) as IncomingOrderCreatedEventProps
      return incomingOrderCreatedEvent
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingOrderCreatedEventInput })
      throw invalidArgumentsError
    }
  }
}
