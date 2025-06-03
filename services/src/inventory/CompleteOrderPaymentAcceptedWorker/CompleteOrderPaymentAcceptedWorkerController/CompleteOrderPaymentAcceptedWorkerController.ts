import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { InvalidArgumentsError, isTransientError } from '../../errors/AppError'
import { ICompleteOrderPaymentAcceptedWorkerService } from '../CompleteOrderPaymentAcceptedWorkerService/CompleteOrderPaymentAcceptedWorkerService'
import {
  IncomingOrderPaymentAcceptedEvent,
  IncomingOrderPaymentAcceptedEventInput,
} from '../model/IncomingOrderPaymentAcceptedEvent'

export interface ICompleteOrderPaymentAcceptedWorkerController {
  completeOrders: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

/**
 *
 */
export class CompleteOrderPaymentAcceptedWorkerController implements ICompleteOrderPaymentAcceptedWorkerController {
  /**
   *
   */
  constructor(private readonly completeOrderPaymentAcceptedWorkerService: ICompleteOrderPaymentAcceptedWorkerService) {
    this.completeOrders = this.completeOrders.bind(this)
  }

  /**
   *
   */
  public async completeOrders(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    const logContext = 'CompleteOrderPaymentAcceptedWorkerController.completeOrders'
    console.info(`${logContext} init:`, { sqsEvent })

    const sqsBatchResponse: SQSBatchResponse = { batchItemFailures: [] }

    if (!sqsEvent || !sqsEvent.Records) {
      const error = new Error(`Expected SQSEvent but got ${sqsEvent}`)
      console.error(`${logContext} exit error:`, { error, sqsEvent })
      return sqsBatchResponse
    }

    for (const record of sqsEvent.Records) {
      try {
        await this.completeOrderSingle(record)
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
   * @throws {InvalidStockCompletionError}
   * @throws {UnrecognizedError}
   */
  private async completeOrderSingle(sqsRecord: SQSRecord): Promise<void> {
    const logContext = 'CompleteOrderPaymentAcceptedWorkerController.completeOrderSingle'
    console.info(`${logContext} init:`, { sqsRecord })

    try {
      const unverifiedEvent = this.parseInputEvent(sqsRecord) as IncomingOrderPaymentAcceptedEventInput
      const incomingOrderPaymentAcceptedEvent = IncomingOrderPaymentAcceptedEvent.validateAndBuild(unverifiedEvent)
      await this.completeOrderPaymentAcceptedWorkerService.completeOrder(incomingOrderPaymentAcceptedEvent)
      console.info(`${logContext} exit success:`, { incomingOrderPaymentAcceptedEvent, sqsRecord })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, sqsRecord })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private parseInputEvent(sqsRecord: SQSRecord): unknown {
    const logContext = 'CompleteOrderPaymentAcceptedWorkerController.parseInputEvent'

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
