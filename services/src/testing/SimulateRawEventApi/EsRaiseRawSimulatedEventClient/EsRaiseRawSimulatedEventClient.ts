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
  private buildDdbCommand(rawSimulatedEvent: RawSimulatedEvent): PutCommand {
    const logContext = 'EsRaiseRawSimulatedEventClient.sendDdbCommand'

    try {
      const { pk, sk, eventName, eventData, createdAt, updatedAt, _tn } = rawSimulatedEvent
      return new PutCommand({
        TableName: process.env.EVENT_STORE_TABLE_NAME,
        Item: { pk, sk, eventName, eventData, createdAt, updatedAt, _tn },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      })
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
