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
      this.validateInput(orderPlacedEvent)
      const ddbCommand = this.buildDdbCommand(orderPlacedEvent)
      await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand, orderPlacedEvent })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, orderPlacedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(orderPlacedEvent: OrderPlacedEvent): void {
    const logContext = 'EsRaiseOrderPlacedEventClient.validateInput'

    if (orderPlacedEvent instanceof OrderPlacedEvent === false) {
      const errorMessage = `Expected OrderPlacedEvent but got ${orderPlacedEvent}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderPlacedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(orderPlacedEvent: OrderPlacedEvent): PutCommand {
    const logContext = 'EsRaiseOrderPlacedEventClient.buildDdbCommand'

    try {
      const tableName = process.env.EVENT_STORE_TABLE_NAME

      const { eventName, eventData, createdAt, updatedAt } = orderPlacedEvent
      const { orderId, sku, units, price, userId } = eventData

      const eventPk = `EVENTS#ORDER_ID#${orderPlacedEvent.eventData.orderId}`
      const eventSk = `EVENT#${orderPlacedEvent.eventName}`
      const eventTn = `EVENTS#EVENT`
      const eventSn = `EVENTS`
      const eventGsi1pk = `EVENTS#EVENT`
      const eventGsi1sk = `CREATED_AT#${orderPlacedEvent.createdAt}`

      const ddbCommand = new PutCommand({
        TableName: tableName,
        Item: {
          pk: eventPk,
          sk: eventSk,
          eventName,
          eventData: {
            orderId,
            sku,
            units,
            price,
            userId,
          },
          createdAt,
          updatedAt,
          _tn: eventTn,
          _sn: eventSn,
          gsi1pk: eventGsi1pk,
          gsi1sk: eventGsi1sk,
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      })
      return ddbCommand
    } catch (error) {
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
