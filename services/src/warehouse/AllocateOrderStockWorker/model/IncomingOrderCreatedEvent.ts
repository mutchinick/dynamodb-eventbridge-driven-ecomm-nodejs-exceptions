import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { z } from 'zod'
import { InvalidArgumentsError, Result } from '../../errors/AppError'
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

type IncomingOrderCreatedEventData = Pick<AllocateOrderStockData, 'sku' | 'units' | 'orderId'>

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
  ): Result<IncomingOrderCreatedEvent, InvalidArgumentsError> {
    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildProps(incomingOrderCreatedEventInput)
      return new IncomingOrderCreatedEvent(eventName, eventData, createdAt, updatedAt)
    } catch (error) {
      console.error('IncomingOrderCreatedEvent.validateAndBuild', { error, incomingOrderCreatedEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    incomingOrderCreatedEventInput: IncomingOrderCreatedEventInput,
  ): Result<IncomingOrderCreatedEventProps, InvalidArgumentsError> {
    try {
      const eventDetail = incomingOrderCreatedEventInput.detail
      const unverifiedIncomingOrderCreatedEvent = unmarshall(eventDetail.dynamodb.NewImage)
      const incomingOrderCreatedEvent = z
        .object({
          eventName: ValueValidators.validOrderCreatedEventName(),
          eventData: z.object({
            sku: ValueValidators.validSku(),
            units: ValueValidators.validUnits(),
            orderId: ValueValidators.validOrderId(),
          }),
          createdAt: ValueValidators.validCreatedAt(),
          updatedAt: ValueValidators.validUpdatedAt(),
        })
        .parse(unverifiedIncomingOrderCreatedEvent) as IncomingOrderCreatedEventProps
      return incomingOrderCreatedEvent
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      throw invalidArgumentsError
    }
  }
}
