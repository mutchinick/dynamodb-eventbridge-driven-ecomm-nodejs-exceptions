import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { DuplicateEventRaisedError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { OrderStockAllocatedEvent } from '../model/OrderStockAllocatedEvent'

export interface IEsRaiseOrderStockAllocatedEventClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  raiseOrderStockAllocatedEvent: (orderStockAllocatedEvent: OrderStockAllocatedEvent) => Promise<void>
}

/**
 *
 */
export class EsRaiseOrderStockAllocatedEventClient implements IEsRaiseOrderStockAllocatedEventClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  public async raiseOrderStockAllocatedEvent(orderStockAllocatedEvent: OrderStockAllocatedEvent): Promise<void> {
    const logContext = 'EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent'
    console.info(`${logContext} init:`, { orderStockAllocatedEvent })

    try {
      // TODO: this.validateInput(...)
      this.validateInput(orderStockAllocatedEvent)
      const ddbCommand = this.buildDdbCommand(orderStockAllocatedEvent)
      await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand, orderStockAllocatedEvent })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, orderStockAllocatedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(orderStockAllocatedEvent: OrderStockAllocatedEvent): void {
    const logContext = 'EsRaiseOrderStockAllocatedEventClient.validateInput'

    if (orderStockAllocatedEvent instanceof OrderStockAllocatedEvent === false) {
      const errorMessage = `Expected OrderStockAllocatedEvent but got ${orderStockAllocatedEvent}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderStockAllocatedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(orderStockAllocatedEvent: OrderStockAllocatedEvent): PutCommand {
    const logContext = 'EsRaiseOrderStockAllocatedEventClient.buildDdbCommand'

    try {
      const tableName = process.env.EVENT_STORE_TABLE_NAME

      const { eventName, eventData, createdAt, updatedAt } = orderStockAllocatedEvent
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
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderStockAllocatedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: PutCommand): Promise<void> {
    const logContext = 'EsRaiseOrderStockAllocatedEventClient.sendDdbCommand'
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
