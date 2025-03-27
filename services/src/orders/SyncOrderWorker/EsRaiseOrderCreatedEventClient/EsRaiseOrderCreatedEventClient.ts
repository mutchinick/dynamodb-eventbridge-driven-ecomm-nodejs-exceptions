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

    try {
      // TODO: this.validateInput(...)
      this.validateInput(orderCreatedEvent)
      const ddbCommand = this.buildDdbCommand(orderCreatedEvent)
      await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand, orderCreatedEvent })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, orderCreatedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(orderCreatedEvent: OrderCreatedEvent): void {
    const logContext = 'EsRaiseOrderCreatedEventClient.validateInput'

    if (orderCreatedEvent instanceof OrderCreatedEvent === false) {
      const errorMessage = `Expected OrderCreatedEvent but got ${orderCreatedEvent}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderCreatedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(orderCreatedEvent: OrderCreatedEvent): PutCommand {
    const logContext = 'EsRaiseOrderCreatedEventClient.buildDdbCommand'

    try {
      const tableName = process.env.EVENT_STORE_TABLE_NAME

      const { eventData } = orderCreatedEvent
      const { orderId, orderStatus, sku, units, price, userId, createdAt, updatedAt } = eventData

      const eventPk = `EVENTS#ORDER_ID#${orderId}`
      const eventSk = `EVENT#${orderCreatedEvent.eventName}`
      const eventTn = `EVENTS#EVENT`
      const eventSn = `EVENTS`
      const eventGsi1pk = `EVENTS#EVENT`
      const eventGsi1sk = `CREATED_AT#${orderCreatedEvent.createdAt}`

      const ddbCommand = new PutCommand({
        TableName: tableName,
        Item: {
          pk: eventPk,
          sk: eventSk,
          eventName: orderCreatedEvent.eventName,
          eventData: {
            orderId,
            orderStatus,
            sku,
            units,
            price,
            userId,
            createdAt,
            updatedAt,
          },
          createdAt: orderCreatedEvent.createdAt,
          updatedAt: orderCreatedEvent.updatedAt,
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
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderCreatedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: PutCommand): Promise<void> {
    const logContext = 'EsRaiseOrderCreatedEventClient.sendDdbCommand'

    try {
      await this.ddbDocClient.send(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand })
    } catch (error) {
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
