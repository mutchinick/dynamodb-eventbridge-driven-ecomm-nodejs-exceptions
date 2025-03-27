import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { DuplicateEventRaisedError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { RawSimulatedEvent } from '../model/RawSimulatedEvent'

export interface IEsRaiseRawSimulatedEventClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  raiseRawSimulatedEvent: (rawSimulatedEvent: RawSimulatedEvent) => Promise<void>
}

/**
 *
 */
export class EsRaiseRawSimulatedEventClient implements IEsRaiseRawSimulatedEventClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  public async raiseRawSimulatedEvent(rawSimulatedEvent: RawSimulatedEvent): Promise<void> {
    const logContext = 'EsRaiseRawSimulatedEventClient.raiseRawSimulatedEvent'
    console.info(`${logContext} init:`, { rawSimulatedEvent })

    try {
      // TODO: this.validateInput(...)
      this.validateInput(rawSimulatedEvent)
      const ddbCommand = this.buildDdbCommand(rawSimulatedEvent)
      await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand, rawSimulatedEvent })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, rawSimulatedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(rawSimulatedEvent: RawSimulatedEvent): void {
    const logContext = 'EsRaiseRawSimulatedEventClient.validateInput'

    if (rawSimulatedEvent instanceof RawSimulatedEvent === false) {
      const errorMessage = `Expected RawSimulatedEvent but got ${rawSimulatedEvent}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, rawSimulatedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(rawSimulatedEvent: RawSimulatedEvent): PutCommand {
    const logContext = 'EsRaiseRawSimulatedEventClient.sendDdbCommand'

    try {
      const tableName = process.env.EVENT_STORE_TABLE_NAME

      const eventPk = rawSimulatedEvent.pk
      const eventSk = rawSimulatedEvent.sk
      const eventTn = `EVENTS#EVENT`
      const eventSn = `EVENTS`
      const eventGsi1pk = `EVENTS#EVENT`
      const eventGsi1sk = `CREATED_AT#${rawSimulatedEvent.createdAt}`

      const ddbCommand = new PutCommand({
        TableName: tableName,
        Item: {
          pk: eventPk,
          sk: eventSk,
          ...rawSimulatedEvent,
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
      console.error(`${logContext} exit error:`, { invalidArgumentsError, rawSimulatedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: PutCommand): Promise<void> {
    const logContext = 'EsRaiseRawSimulatedEventClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand })
    } catch (error) {
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
