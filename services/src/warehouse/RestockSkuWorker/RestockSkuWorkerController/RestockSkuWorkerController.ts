import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import {
  AsyncResult,
  InvalidArgumentsError,
  isTransientError,
  DuplicateRestockOperationError,
  Result,
  UnrecognizedError,
} from '../../errors/AppError'
import { IncomingSkuRestockedEvent } from '../model/IncomingSkuRestockedEvent'
import { IRestockSkuWorkerService } from '../RestockSkuWorkerService/RestockSkuWorkerService'

export interface IRestockSkuWorkerController {
  restockSkus: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

/**
 *
 */
export class RestockSkuWorkerController implements IRestockSkuWorkerController {
  /**
   *
   */
  constructor(private readonly restockSkuWorkerService: IRestockSkuWorkerService) {
    this.restockSkus = this.restockSkus.bind(this)
  }

  /**
   *
   */
  public async restockSkus(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    const logContext = 'RestockSkuWorkerController.restockSkus'
    console.info(`${logContext} init:`, { sqsEvent })

    const sqsBatchResponse: SQSBatchResponse = { batchItemFailures: [] }
    for (const record of sqsEvent.Records) {
      try {
        await this.restockSingleSku(record)
      } catch (error) {
        if (isTransientError(error)) {
          sqsBatchResponse.batchItemFailures.push({ itemIdentifier: record.messageId })
        }
      }
    }

    console.info(`${logContext} exit success:`, { sqsEvent })
    return sqsBatchResponse
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateRestockOperationError}
   * @throws {UnrecognizedError}
   */
  private async restockSingleSku(
    sqsRecord: SQSRecord,
  ): AsyncResult<void, InvalidArgumentsError | DuplicateRestockOperationError | UnrecognizedError> {
    const logContext = 'RestockSkuWorkerController.restockSingleSku'
    console.info(`${logContext} init:`, { sqsRecord })

    try {
      const incomingSkuRestockedEvent = this.parseValidateEvent(sqsRecord.body)
      await this.restockSkuWorkerService.restockSku(incomingSkuRestockedEvent)
      console.info(`${logContext} exit success:`, { incomingSkuRestockedEvent })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private parseValidateEvent(sqsRecordBody: string): Result<IncomingSkuRestockedEvent, InvalidArgumentsError> {
    const logContext = 'RestockSkuWorkerController.parseValidateEvent'
    console.info(`${logContext} init:`, { sqsRecordBody })

    try {
      const eventBridgeEvent = JSON.parse(sqsRecordBody)
      const incomingSkuRestockedEvent = IncomingSkuRestockedEvent.validateAndBuild(eventBridgeEvent)
      console.info(`${logContext} exit success:`, { incomingSkuRestockedEvent })
      return incomingSkuRestockedEvent
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, sqsRecordBody })
      throw invalidArgumentsError
    }
  }
}
