import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import {
  AsyncResult,
  InvalidArgumentsError,
  isTransientError,
  DuplicateEventRaisedError,
  Result,
  UnrecognizedError,
} from '../../errors/AppError'
import { IAllocateOrderStockWorkerService } from '../AllocateOrderStockWorkerService/AllocateOrderStockWorkerService'
import { IncomingOrderCreatedEvent } from '../model/IncomingOrderCreatedEvent'

export interface IAllocateOrderStockWorkerController {
  allocateOrdersStock: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

/**
 *
 */
export class AllocateOrderStockWorkerController implements IAllocateOrderStockWorkerController {
  /**
   *
   */
  constructor(private readonly allocateOrderStockWorkerService: IAllocateOrderStockWorkerService) {
    this.allocateOrdersStock = this.allocateOrdersStock.bind(this)
  }

  /**
   *
   */
  public async allocateOrdersStock(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    const logContext = 'AllocateOrderStockWorkerController.allocateOrdersStock'
    console.info(`${logContext} init:`, { sqsEvent })

    const sqsBatchResponse: SQSBatchResponse = { batchItemFailures: [] }
    for (const record of sqsEvent.Records) {
      try {
        await this.allocateSingleOrder(record)
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
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async allocateSingleOrder(
    sqsRecord: SQSRecord,
  ): AsyncResult<void, InvalidArgumentsError | DuplicateEventRaisedError | UnrecognizedError> {
    const logContext = 'AllocateOrderStockWorkerController.allocateSingleOrder'
    console.info(`${logContext} init:`, { sqsRecord })

    try {
      const incomingOrderCreatedEvent = this.parseValidateEvent(sqsRecord.body)
      await this.allocateOrderStockWorkerService.allocateOrderStock(incomingOrderCreatedEvent)
      console.info(`${logContext} exit success:`, { incomingOrderCreatedEvent })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private parseValidateEvent(sqsRecordBody: string): Result<IncomingOrderCreatedEvent, InvalidArgumentsError> {
    const logContext = 'AllocateOrderStockWorkerController.parseValidateEvent'
    console.info(`${logContext} init:`, { sqsRecordBody })

    try {
      const eventBridgeEvent = JSON.parse(sqsRecordBody)
      const incomingOrderCreatedEvent = IncomingOrderCreatedEvent.validateAndBuild(eventBridgeEvent)
      console.info(`${logContext} exit success:`, { incomingOrderCreatedEvent })
      return incomingOrderCreatedEvent
    } catch (error) {
      // If it already throws and InvalidArgumentsError we just passthrough, no need to re-wrap it
      if (error instanceof InvalidArgumentsError) {
        console.error(`${logContext} exit error:`, { error, sqsRecordBody })
        throw error
      }

      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, sqsRecordBody })
      throw invalidArgumentsError
    }
  }
}
