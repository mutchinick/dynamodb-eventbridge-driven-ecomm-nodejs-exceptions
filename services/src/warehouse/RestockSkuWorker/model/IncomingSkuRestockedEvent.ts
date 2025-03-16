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
    const logContext = 'IncomingSkuRestockedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { incomingSkuRestockedEventInput })

    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildProps(incomingSkuRestockedEventInput)
      const incomingSkuRestockedEvent = new IncomingSkuRestockedEvent(eventName, eventData, createdAt, updatedAt)
      console.info(`${logContext} exit success:`, { incomingSkuRestockedEvent, incomingSkuRestockedEventInput })
      return incomingSkuRestockedEvent
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingSkuRestockedEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    incomingSkuRestockedEventInput: IncomingSkuRestockedEventInput,
  ): Result<IncomingSkuRestockedEventProps, InvalidArgumentsError> {
    return this.parseValidateInput(incomingSkuRestockedEventInput)
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static parseValidateInput(
    incomingSkuRestockedEventInput: IncomingSkuRestockedEventInput,
  ): Result<IncomingSkuRestockedEventProps, InvalidArgumentsError> {
    const logContext = 'IncomingSkuRestockedEvent.parseValidateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      eventName: ValueValidators.validSkuRestockedEventName(),
      eventData: z.object({
        sku: ValueValidators.validSku(),
        units: ValueValidators.validUnits(),
        lotId: ValueValidators.validLotId(),
      }),
      createdAt: ValueValidators.validCreatedAt(),
      updatedAt: ValueValidators.validUpdatedAt(),
    })

    try {
      const eventDetail = incomingSkuRestockedEventInput.detail
      const unverifiedEvent = unmarshall(eventDetail.dynamodb.NewImage)
      const incomingSkuRestockedEvent = schema.parse(unverifiedEvent) as IncomingSkuRestockedEventProps
      return incomingSkuRestockedEvent
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingSkuRestockedEventInput })
      throw invalidArgumentsError
    }
  }
}
