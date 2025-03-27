import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { DuplicateEventRaisedError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { OrderStockDepletedEvent } from '../model/OrderStockDepletedEvent'

export interface IEsRaiseOrderStockDepletedEventClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  raiseOrderStockDepletedEvent: (orderStockDepletedEvent: OrderStockDepletedEvent) => Promise<void>
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
  public async raiseOrderStockDepletedEvent(orderStockDepletedEvent: OrderStockDepletedEvent): Promise<void> {
    const logContext = 'EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent'
    console.info(`${logContext} init:`, { orderStockDepletedEvent })

    try {
      this.validateInput(orderStockDepletedEvent)
      const ddbCommand = this.buildDdbCommand(orderStockDepletedEvent)
      await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand, orderStockDepletedEvent })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, orderStockDepletedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(orderStockDepletedEvent: OrderStockDepletedEvent): void {
    const logContext = 'EsRaiseOrderStockDepletedEventClient.validateInput'

    if (orderStockDepletedEvent instanceof OrderStockDepletedEvent === false) {
      const errorMessage = `Expected OrderStockDepletedEvent but got ${orderStockDepletedEvent}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderStockDepletedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(orderStockDepletedEvent: OrderStockDepletedEvent): PutCommand {
    const logContext = 'EsRaiseOrderStockDepletedEventClient.buildDdbCommand'

    try {
      const tableName = process.env.EVENT_STORE_TABLE_NAME

      const { eventName, eventData, createdAt, updatedAt } = orderStockDepletedEvent
      const { orderId, sku, units, price, userId } = eventData

      const eventPk = `EVENTS#ORDER_ID#${orderId}`
      const eventSk = `EVENT#${eventName}`
      const eventTn = `EVENTS#EVENT`
      const eventSn = `EVENTS`
      const eventGsi1pk = `EVENTS#EVENT`
      const eventGsi1sk = `CREATED_AT#${createdAt}`

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
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderStockDepletedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: PutCommand): Promise<void> {
    const logContext = 'EsRaiseOrderStockDepletedEventClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand })
    } catch (error) {
      // If the condition fails, the event has already been raised, so we throw a non-transient
      // DuplicateEventRaisedError
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
