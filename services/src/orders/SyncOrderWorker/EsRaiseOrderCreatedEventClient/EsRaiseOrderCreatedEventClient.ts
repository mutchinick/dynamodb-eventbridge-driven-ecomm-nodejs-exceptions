import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { DuplicateEventRaisedError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { OrderCreatedEvent } from '../model/OrderCreatedEvent'

export interface IEsRaiseOrderCreatedEventClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  raiseOrderCreatedEvent: (orderCreatedEvent: OrderCreatedEvent) => Promise<void>
}

/**
 *
 */
export class EsRaiseOrderCreatedEventClient implements IEsRaiseOrderCreatedEventClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  public async raiseOrderCreatedEvent(orderCreatedEvent: OrderCreatedEvent): Promise<void> {
    const logContext = 'EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent'
    console.info(`${logContext} init:`, { orderCreatedEvent })
    const ddbCommand = this.buildDdbCommand(orderCreatedEvent)
    await this.sendDdbCommand(ddbCommand)
    console.info(`${logContext} exit success:`, { orderCreatedEvent })
  }

  /**
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: PutCommand): Promise<void> {
    const logContext = 'EsRaiseOrderCreatedEventClient.sendDdbCommand'

    try {
      await this.ddbDocClient.send(ddbCommand)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })

      if (DynamoDbUtils.isConditionalCheckFailedException(error)) {
        const duplicationError = DuplicateEventRaisedError.from(error)
        console.error(`${logContext} exit error:`, { duplicationError })
        throw duplicationError
      }

      const unrecognizedError = UnrecognizedError.from(error)
      console.error(`${logContext} exit error:`, { unrecognizedError, ddbCommand })
      throw unrecognizedError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(orderCreatedEvent: OrderCreatedEvent): PutCommand {
    const logContext = 'EsRaiseOrderCreatedEventClient.buildDdbCommand'

    try {
      return new PutCommand({
        TableName: process.env.EVENT_STORE_TABLE_NAME,
        Item: {
          pk: `ORDER_ID#${orderCreatedEvent.eventData.orderId}`,
          sk: `EVENT#${orderCreatedEvent.eventName}`,
          _tn: '#EVENT',
          ...orderCreatedEvent,
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      })
    } catch (error) {
      console.log(`${logContext} error caught:`, { error })
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.log(`${logContext} exit error:`, { invalidArgumentsError, orderCreatedEvent })
      throw invalidArgumentsError
    }
  }
}
