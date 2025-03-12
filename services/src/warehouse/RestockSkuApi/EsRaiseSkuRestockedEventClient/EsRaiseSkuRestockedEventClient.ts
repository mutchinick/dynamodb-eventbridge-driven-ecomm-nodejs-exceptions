import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import {
  AsyncResult,
  DuplicateEventRaisedError,
  InvalidArgumentsError,
  Result,
  UnrecognizedError,
} from '../../errors/AppError'
import { SkuRestockedEvent } from '../model/SkuRestockedEvent'

export interface IEsRaiseSkuRestockedEventClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  raiseSkuRestockedEvent: (
    skuRestockedEvent: SkuRestockedEvent,
  ) => AsyncResult<void, InvalidArgumentsError | DuplicateEventRaisedError | UnrecognizedError>
}

/**
 *
 */
export class EsRaiseSkuRestockedEventClient implements IEsRaiseSkuRestockedEventClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  public async raiseSkuRestockedEvent(
    skuRestockedEvent: SkuRestockedEvent,
  ): AsyncResult<void, InvalidArgumentsError | DuplicateEventRaisedError | UnrecognizedError> {
    const logContext = 'EsRaiseSkuRestockedEventClient.raiseSkuRestockedEvent'
    console.info(`${logContext} init:`, { skuRestockedEvent })
    const ddbCommand = this.buildDdbCommand(skuRestockedEvent)
    await this.sendDdbCommand(ddbCommand)
    console.info(`${logContext} exit success:`, { skuRestockedEvent })
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(skuRestockedEvent: SkuRestockedEvent): Result<PutCommand, InvalidArgumentsError> {
    const logContext = 'EsRaiseSkuRestockedEventClient.buildDdbCommand'

    try {
      const ddbCommand = new PutCommand({
        TableName: process.env.EVENT_STORE_TABLE_NAME,
        Item: {
          pk: `SKU#${skuRestockedEvent.eventData.sku}`,
          sk: `EVENT#${skuRestockedEvent.eventName}#LOT_ID#${skuRestockedEvent.eventData.lotId}`,
          _tn: '#EVENT',
          ...skuRestockedEvent,
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      })
      return ddbCommand
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, skuRestockedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(
    ddbCommand: PutCommand,
  ): AsyncResult<void, DuplicateEventRaisedError | UnrecognizedError> {
    const logContext = 'EsRaiseSkuRestockedEventClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand })
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })

      // If the ConditionExpression fails, the event has already been raised, so we throw a
      // non-transient DuplicateEventRaisedError
      if (error instanceof ConditionalCheckFailedException) {
        const duplicationError = DuplicateEventRaisedError.from(error)
        console.error(`${logContext} exit error:`, { duplicationError, ddbCommand })
        throw duplicationError
      }

      const unrecognizedError = UnrecognizedError.from(error)
      console.error(`${logContext} exit error:`, { unrecognizedError, ddbCommand })
      throw unrecognizedError
    }
  }
}
