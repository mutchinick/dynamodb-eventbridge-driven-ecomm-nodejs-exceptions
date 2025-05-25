import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { DuplicateEventRaisedError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderPaymentRejectedEvent } from '../model/OrderPaymentRejectedEvent'

export interface IEsRaiseOrderPaymentRejectedEventClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  raiseOrderPaymentRejectedEvent: (orderPaymentRejectedEvent: OrderPaymentRejectedEvent) => Promise<void>
}

/**
 *
 */
export class EsRaiseOrderPaymentRejectedEventClient implements IEsRaiseOrderPaymentRejectedEventClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  public async raiseOrderPaymentRejectedEvent(orderPaymentRejectedEvent: OrderPaymentRejectedEvent): Promise<void> {
    const logContext = 'EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent'
    console.info(`${logContext} init:`, { orderPaymentRejectedEvent })

    try {
      this.validateInput(orderPaymentRejectedEvent)
      const ddbCommand = this.buildDdbCommand(orderPaymentRejectedEvent)
      await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand, orderPaymentRejectedEvent })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, orderPaymentRejectedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(orderPaymentRejectedEvent: OrderPaymentRejectedEvent): void {
    const logContext = 'EsRaiseOrderPaymentRejectedEventClient.validateInput'

    if (orderPaymentRejectedEvent instanceof OrderPaymentRejectedEvent === false) {
      const errorMessage = `Expected OrderPaymentRejectedEvent but got ${orderPaymentRejectedEvent}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderPaymentRejectedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(orderPaymentRejectedEvent: OrderPaymentRejectedEvent): PutCommand {
    const logContext = 'EsRaiseOrderPaymentRejectedEventClient.buildDdbCommand'

    try {
      const tableName = process.env.EVENT_STORE_TABLE_NAME

      const { eventName, eventData, createdAt, updatedAt } = orderPaymentRejectedEvent
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
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderPaymentRejectedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: PutCommand): Promise<void> {
    const logContext = 'EsRaiseOrderPaymentRejectedEventClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand })
    } catch (error) {
      // If the condition fails, the event has already been raised,
      // so we throw a non-transient DuplicateEventRaisedError
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
