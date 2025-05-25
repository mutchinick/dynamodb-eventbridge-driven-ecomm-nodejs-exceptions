import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { InvalidArgumentsError, isTransientError } from '../../errors/AppError'
import { IProcessOrderPaymentWorkerService } from '../ProcessOrderPaymentWorkerService/ProcessOrderPaymentWorkerService'
import {
  IncomingOrderStockAllocatedEvent,
  IncomingOrderStockAllocatedEventInput,
} from '../model/IncomingOrderStockAllocatedEvent'

export interface IProcessOrderPaymentWorkerController {
  processOrderPayments: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

/**
 *
 */
export class ProcessOrderPaymentWorkerController implements IProcessOrderPaymentWorkerController {
  /**
   *
   */
  constructor(private readonly processOrderPaymentWorkerService: IProcessOrderPaymentWorkerService) {
    this.processOrderPayments = this.processOrderPayments.bind(this)
  }

  /**
   *
   */
  public async processOrderPayments(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    const logContext = 'ProcessOrderPaymentWorkerController.processOrderPayments'
    console.info(`${logContext} init:`, { sqsEvent })

    const sqsBatchResponse: SQSBatchResponse = { batchItemFailures: [] }

    if (!sqsEvent || !sqsEvent.Records) {
      const error = new Error(`Expected SQSEvent but got ${sqsEvent}`)
      console.error(`${logContext} exit error:`, { error, sqsEvent })
      return sqsBatchResponse
    }

    for (const record of sqsEvent.Records) {
      try {
        await this.processOrderPaymentSingle(record)
      } catch (error) {
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
   * @throws {DuplicateEventRaisedError}
   * @throws {PaymentFailedError}
   * @throws {UnrecognizedError}
   */
  private async processOrderPaymentSingle(sqsRecord: SQSRecord): Promise<void> {
    const logContext = 'ProcessOrderPaymentWorkerController.processOrderPaymentSingle'
    console.info(`${logContext} init:`, { sqsRecord })

    try {
      const unverifiedEvent = this.parseInputEvent(sqsRecord) as IncomingOrderStockAllocatedEventInput
      const incomingOrderStockAllocatedEvent = IncomingOrderStockAllocatedEvent.validateAndBuild(unverifiedEvent)
      await this.processOrderPaymentWorkerService.processOrderPayment(incomingOrderStockAllocatedEvent)
      console.info(`${logContext} exit success:`, { incomingOrderStockAllocatedEvent, sqsRecord })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, sqsRecord })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private parseInputEvent(sqsRecord: SQSRecord): unknown {
    const logContext = 'ProcessOrderPaymentWorkerController.parseInputEvent'

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
