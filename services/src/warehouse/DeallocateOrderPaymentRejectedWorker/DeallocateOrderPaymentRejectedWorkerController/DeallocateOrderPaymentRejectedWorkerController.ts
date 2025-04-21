import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { InvalidArgumentsError, isTransientError } from '../../errors/AppError'
import { IDeallocateOrderPaymentRejectedWorkerService } from '../DeallocateOrderPaymentRejectedWorkerService/DeallocateOrderPaymentRejectedWorkerService'
import {
  IncomingOrderPaymentRejectedEvent,
  IncomingOrderPaymentRejectedEventInput,
} from '../model/IncomingOrderPaymentRejectedEvent'

export interface IDeallocateOrderPaymentRejectedWorkerController {
  deallocateOrdersStock: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

/**
 *
 */
export class DeallocateOrderPaymentRejectedWorkerController implements IDeallocateOrderPaymentRejectedWorkerController {
  /**
   *
   */
  constructor(
    private readonly deallocateOrderPaymentRejectedWorkerService: IDeallocateOrderPaymentRejectedWorkerService,
  ) {
    this.deallocateOrdersStock = this.deallocateOrdersStock.bind(this)
  }

  /**
   *
   */
  public async deallocateOrdersStock(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    const logContext = 'DeallocateOrderPaymentRejectedWorkerController.deallocateOrdersStock'
    console.info(`${logContext} init:`, { sqsEvent })

    const sqsBatchResponse: SQSBatchResponse = { batchItemFailures: [] }

    if (!sqsEvent || !sqsEvent.Records) {
      const error = new Error(`Expected SQSEvent but got ${sqsEvent}`)
      console.error(`${logContext} exit error:`, { error, sqsEvent })
      return sqsBatchResponse
    }

    for (const record of sqsEvent.Records) {
      try {
        await this.deallocateOrderSingle(record)
      } catch (error) {
        // If the failure is transient then we add it to the batch errors to requeue and retry
        // If the failure is non-transient then we ignore it to remove it from the queue
        if (isTransientError(error)) {
          sqsBatchResponse.batchItemFailures.push({ itemIdentifier: record.messageId })
        }
      }
    }

    console.info(`${logContext} exit success:`, { sqsBatchResponse, sqsEvent })
    return sqsBatchResponse
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {InvalidStockDeallocationError}
   * @throws {UnrecognizedError}
   */
  private async deallocateOrderSingle(sqsRecord: SQSRecord): Promise<void> {
    const logContext = 'DeallocateOrderPaymentRejectedWorkerController.deallocateOrderSingle'
    console.info(`${logContext} init:`, { sqsRecord })

    try {
      const unverifiedEvent = this.parseInputEvent(sqsRecord) as IncomingOrderPaymentRejectedEventInput
      const incomingOrderPaymentRejectedEvent = IncomingOrderPaymentRejectedEvent.validateAndBuild(unverifiedEvent)
      await this.deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(incomingOrderPaymentRejectedEvent)
      console.info(`${logContext} exit success:`, { incomingOrderPaymentRejectedEvent, sqsRecord })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, sqsRecord })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private parseInputEvent(sqsRecord: SQSRecord): unknown {
    const logContext = 'DeallocateOrderPaymentRejectedWorkerController.parseInputEvent'

    try {
      const unverifiedEvent = JSON.parse(sqsRecord.body)
      return unverifiedEvent
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, sqsRecord })
      throw invalidArgumentsError
    }
  }
}
