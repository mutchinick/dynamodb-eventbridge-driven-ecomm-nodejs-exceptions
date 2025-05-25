import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { DuplicateEventRaisedError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderPaymentAcceptedEvent } from '../model/OrderPaymentAcceptedEvent'

export interface IEsRaiseOrderPaymentAcceptedEventClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  raiseOrderPaymentAcceptedEvent: (orderPaymentAcceptedEvent: OrderPaymentAcceptedEvent) => Promise<void>
}

/**
 *
 */
export class EsRaiseOrderPaymentAcceptedEventClient implements IEsRaiseOrderPaymentAcceptedEventClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  public async raiseOrderPaymentAcceptedEvent(orderPaymentAcceptedEvent: OrderPaymentAcceptedEvent): Promise<void> {
    const logContext = 'EsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent'
    console.info(`${logContext} init:`, { orderPaymentAcceptedEvent })

    try {
      this.validateInput(orderPaymentAcceptedEvent)
      const ddbCommand = this.buildDdbCommand(orderPaymentAcceptedEvent)
      await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand, orderPaymentAcceptedEvent })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, orderPaymentAcceptedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(orderPaymentAcceptedEvent: OrderPaymentAcceptedEvent): void {
    const logContext = 'EsRaiseOrderPaymentAcceptedEventClient.validateInput'

    if (orderPaymentAcceptedEvent instanceof OrderPaymentAcceptedEvent === false) {
      const errorMessage = `Expected OrderPaymentAcceptedEvent but got ${orderPaymentAcceptedEvent}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderPaymentAcceptedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(orderPaymentAcceptedEvent: OrderPaymentAcceptedEvent): PutCommand {
    const logContext = 'EsRaiseOrderPaymentAcceptedEventClient.buildDdbCommand'

    try {
      const tableName = process.env.EVENT_STORE_TABLE_NAME

      const { eventName, eventData, createdAt, updatedAt } = orderPaymentAcceptedEvent
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
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderPaymentAcceptedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: PutCommand): Promise<void> {
    const logContext = 'EsRaiseOrderPaymentAcceptedEventClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand })
    } catch (error) {
      // If the condition fails, the event has already been raised, so we throw a non-transient
      // DuplicateEventRaisedError
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
