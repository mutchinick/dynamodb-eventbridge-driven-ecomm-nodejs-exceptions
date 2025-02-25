import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { z } from 'zod'
import { InvalidArgumentsError, Result } from '../../errors/AppError'
import { RestockSkuData } from '../../model/RestockSkuData'
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

export type IncomingSkuRestockedEventInput = EventBridgeEvent<string, EventDetail>

type IncomingSkuRestockedEventData = Pick<RestockSkuData, 'sku' | 'units' | 'lotId'>

type IncomingSkuRestockedEventProps = WarehouseEvent<
  WarehouseEventName.SKU_RESTOCKED_EVENT,
  IncomingSkuRestockedEventData
>

/**
 *
 */
export class IncomingSkuRestockedEvent implements IncomingSkuRestockedEventProps {
  /**
   *
   */
  private constructor(
    readonly eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
    readonly eventData: IncomingSkuRestockedEventData,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    incomingSkuRestockedEventInput: IncomingSkuRestockedEventInput,
  ): Result<IncomingSkuRestockedEvent, InvalidArgumentsError> {
    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildProps(incomingSkuRestockedEventInput)
      return new IncomingSkuRestockedEvent(eventName, eventData, createdAt, updatedAt)
    } catch (error) {
      console.error('IncomingSkuRestockedEvent.validateAndBuild', { error, incomingSkuRestockedEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    incomingSkuRestockedEventInput: IncomingSkuRestockedEventInput,
  ): Result<IncomingSkuRestockedEventProps, InvalidArgumentsError> {
    try {
      const eventDetail = incomingSkuRestockedEventInput.detail
      const unverifiedIncomingSkuRestockedEvent = unmarshall(
        eventDetail.dynamodb.NewImage,
      ) as IncomingSkuRestockedEventProps
      const incomingSkuRestockedEvent = z
        .object({
          eventName: ValueValidators.validSkuRestockedEventName(),
          eventData: z.object({
            sku: ValueValidators.validSku(),
            units: ValueValidators.validUnits(),
            lotId: ValueValidators.validLotId(),
          }),
          createdAt: ValueValidators.validCreatedAt(),
          updatedAt: ValueValidators.validUpdatedAt(),
        })
        .parse(unverifiedIncomingSkuRestockedEvent) as IncomingSkuRestockedEventProps
      return incomingSkuRestockedEvent
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      throw invalidArgumentsError
    }
  }
}
