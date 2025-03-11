import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { InvalidArgumentsError, isTransientError } from '../../errors/AppError'
import { IncomingOrderEvent } from '../model/IncomingOrderEvent'
import { ISyncOrderWorkerService } from '../SyncOrderWorkerService/SyncOrderWorkerService'

export interface ISyncOrderWorkerController {
  syncOrders: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

/**
 *
 */
export class SyncOrderWorkerController implements ISyncOrderWorkerController {
  /**
   *
   */
  constructor(private readonly syncOrderWorkerService: ISyncOrderWorkerService) {
    this.syncOrders = this.syncOrders.bind(this)
  }

  /**
   *
   */
  public async syncOrders(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    const logContext = 'SyncOrderWorkerController.syncOrders'
    console.info(`${logContext} init:`, { sqsEvent })

    const sqsBatchResponse: SQSBatchResponse = { batchItemFailures: [] }
    for (const record of sqsEvent.Records) {
      try {
        await this.syncOrder(record)
      } catch (error) {
        if (isTransientError(error)) {
          sqsBatchResponse.batchItemFailures.push({ itemIdentifier: record.messageId })
        }
      }
    }

    console.info(`${logContext} exit success:`, { sqsBatchResponse })
    return sqsBatchResponse
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {ForbiddenOrderStatusTransitionError}
   * @throws {RedundantOrderStatusTransitionError}
   * @throws {NotReadyOrderStatusTransitionError}
   * @throws {DuplicateEventRaisedError}
   * @throws {InvalidOperationError}
   * @throws {UnrecognizedError}
   */
  private async syncOrder(sqsRecord: SQSRecord): Promise<void> {
    const logContext = 'SyncOrderWorkerController.syncOrder'
    console.info(`${logContext} init:`, { sqsRecord })

    try {
      const incomingOrderEvent = this.parseValidateEvent(sqsRecord)
      await this.syncOrderWorkerService.syncOrder(incomingOrderEvent)
      console.info(`${logContext} exit success:`)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
      console.error(`${logContext} exit error:`, { error, sqsRecord })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private parseValidateEvent(sqsRecord: SQSRecord): IncomingOrderEvent {
    const logContext = 'SyncOrderWorkerController.parseValidateEvent'

    try {
      const eventBridgeEvent = JSON.parse(sqsRecord.body)
      const incomingOrderEvent = IncomingOrderEvent.validateAndBuild(eventBridgeEvent)
      return incomingOrderEvent
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, sqsRecord })
      throw invalidArgumentsError
    }
  }
}
