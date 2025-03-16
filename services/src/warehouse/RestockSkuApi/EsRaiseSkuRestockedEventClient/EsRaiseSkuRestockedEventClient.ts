import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { DuplicateEventRaisedError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { SkuRestockedEvent } from '../model/SkuRestockedEvent'

export interface IEsRaiseSkuRestockedEventClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  raiseSkuRestockedEvent: (skuRestockedEvent: SkuRestockedEvent) => Promise<void>
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
  public async raiseSkuRestockedEvent(skuRestockedEvent: SkuRestockedEvent): Promise<void> {
    const logContext = 'EsRaiseSkuRestockedEventClient.raiseSkuRestockedEvent'
    console.info(`${logContext} init:`, { skuRestockedEvent })

    try {
      const ddbCommand = this.buildDdbCommand(skuRestockedEvent)
      await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand })
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
      console.error(`${logContext} exit error:`, { error, skuRestockedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(skuRestockedEvent: SkuRestockedEvent): PutCommand {
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
  private async sendDdbCommand(ddbCommand: PutCommand): Promise<void> {
    const logContext = 'EsRaiseSkuRestockedEventClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand })
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })

      // If the ConditionExpression fails, the event has already been raised, so we throw a
      // non-transient DuplicateEventRaisedError
      if (DynamoDbUtils.isConditionalCheckFailedException(error)) {
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
