import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import {
  AsyncResult,
  InvalidArgumentsError,
  DuplicateEventRaisedError,
  Result,
  UnrecognizedError,
} from '../../errors/AppError'
import { OrderStockDepletedEvent } from '../model/OrderStockDepletedEvent'

export interface IEsRaiseOrderStockDepletedEventClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  raiseOrderStockDepletedEvent: (
    orderStockDepletedEvent: OrderStockDepletedEvent,
  ) => AsyncResult<void, InvalidArgumentsError | DuplicateEventRaisedError | UnrecognizedError>
}

/**
 *
 */
export class EsRaiseOrderStockDepletedEventClient implements IEsRaiseOrderStockDepletedEventClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  public async raiseOrderStockDepletedEvent(
    orderStockDepletedEvent: OrderStockDepletedEvent,
  ): AsyncResult<void, InvalidArgumentsError | DuplicateEventRaisedError | UnrecognizedError> {
    const logContext = 'EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent'
    console.info(`${logContext} init:`, { orderStockDepletedEvent })
    const ddbPutCommand = this.buildDdbPutCommand(orderStockDepletedEvent)
    await this.sendDdbPutCommand(ddbPutCommand)
    console.info(`${logContext} exit success:`, { orderStockDepletedEvent })
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbPutCommand(
    orderStockDepletedEvent: OrderStockDepletedEvent,
  ): Result<PutCommand, InvalidArgumentsError> {
    try {
      const ddbPutCommand = new PutCommand({
        TableName: process.env.EVENT_STORE_TABLE_NAME,
        Item: {
          pk: `ORDER_ID#${orderStockDepletedEvent.eventData.orderId}`,
          sk: `EVENT#${orderStockDepletedEvent.eventName}`,
          _tn: '#EVENT',
          ...orderStockDepletedEvent,
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      })
      return ddbPutCommand
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async sendDdbPutCommand(
    ddbPutCommand: PutCommand,
  ): AsyncResult<void, DuplicateEventRaisedError | UnrecognizedError> {
    const logContext = 'EsRaiseOrderStockDepletedEventClient.sendDdbPutCommand'
    console.info(`${logContext} init:`, { ddbPutCommand })

    try {
      await this.ddbDocClient.send(ddbPutCommand)
      console.info(`${logContext} exit success:`, { ddbPutCommand })
    } catch (error) {
      console.error(`${logContext} error log:`, { error: JSON.stringify(error) })

      // If the condition fails, the event has already been raised, so we throw a non transient
      // DuplicateEventRaisedError
      if (error instanceof ConditionalCheckFailedException) {
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
