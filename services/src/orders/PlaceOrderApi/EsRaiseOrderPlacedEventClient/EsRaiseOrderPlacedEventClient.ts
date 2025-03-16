import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { DuplicateEventRaisedError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { OrderPlacedEvent } from '../model/OrderPlacedEvent'

export interface IEsRaiseOrderPlacedEventClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  raiseOrderPlacedEvent: (orderPlacedEvent: OrderPlacedEvent) => Promise<void>
}

/**
 *
 */
export class EsRaiseOrderPlacedEventClient implements IEsRaiseOrderPlacedEventClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  public async raiseOrderPlacedEvent(orderPlacedEvent: OrderPlacedEvent): Promise<void> {
    const logContext = 'EsRaiseOrderPlacedEventClient.raiseOrderPlacedEvent'
    console.info(`${logContext} init:`, { orderPlacedEvent })

    try {
      const ddbCommand = this.buildDdbCommand(orderPlacedEvent)
      await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { orderPlacedEvent })
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
      console.error(`${logContext} exit error:`, { error, orderPlacedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(orderPlacedEvent: OrderPlacedEvent): PutCommand {
    const logContext = 'EsRaiseOrderPlacedEventClient.buildDdbCommand'

    try {
      return new PutCommand({
        TableName: process.env.EVENT_STORE_TABLE_NAME,
        Item: {
          pk: `ORDER_ID#${orderPlacedEvent.eventData.orderId}`,
          sk: `EVENT#${orderPlacedEvent.eventName}`,
          _tn: '#EVENT',
          ...orderPlacedEvent,
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      })
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderPlacedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbPutCommand: PutCommand): Promise<void> {
    const logContext = 'EsRaiseOrderPlacedEventClient.sendDdbCommand'

    try {
      await this.ddbDocClient.send(ddbPutCommand)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })

      if (DynamoDbUtils.isConditionalCheckFailedException(error)) {
        const duplicationError = DuplicateEventRaisedError.from(error)
        console.error(`${logContext} exit error:`, { duplicationError, ddbPutCommand })
        throw duplicationError
      }

      const unrecognizedError = UnrecognizedError.from(error)
      console.error(`${logContext} exit error:`, { unrecognizedError, ddbPutCommand })
      throw unrecognizedError
    }
  }
}
