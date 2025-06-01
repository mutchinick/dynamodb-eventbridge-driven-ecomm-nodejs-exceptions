import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { InvalidArgumentsError, isTransientError } from '../../errors/AppError'
import { IAllocateOrderStockWorkerService } from '../AllocateOrderStockWorkerService/AllocateOrderStockWorkerService'
import { IncomingOrderCreatedEvent, IncomingOrderCreatedEventInput } from '../model/IncomingOrderCreatedEvent'

export interface IAllocateOrderStockWorkerController {
  allocateOrders: (sqsEvent: SQSEvent) => Promise<SQSBatchResponse>
}

/**
 *
 */
export class AllocateOrderStockWorkerController implements IAllocateOrderStockWorkerController {
  /**
   *
   */
  constructor(private readonly allocateOrderStockWorkerService: IAllocateOrderStockWorkerService) {
    this.allocateOrders = this.allocateOrders.bind(this)
  }

  /**
   *
   */
  public async allocateOrders(sqsEvent: SQSEvent): Promise<SQSBatchResponse> {
    const logContext = 'AllocateOrderStockWorkerController.allocateOrders'
    console.info(`${logContext} init:`, { sqsEvent })

    const sqsBatchResponse: SQSBatchResponse = { batchItemFailures: [] }

    if (!sqsEvent || !sqsEvent.Records) {
      const error = new Error(`Expected SQSEvent but got ${sqsEvent}`)
      console.error(`${logContext} exit error:`, { error, sqsEvent })
      return sqsBatchResponse
    }

    for (const record of sqsEvent.Records) {
      try {
        await this.allocateOrderSingle(record)
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
   * @throws {UnrecognizedError}
   */
  private async allocateOrderSingle(sqsRecord: SQSRecord): Promise<void> {
    const logContext = 'AllocateOrderStockWorkerController.allocateOrderSingle'
    console.info(`${logContext} init:`, { sqsRecord })

    try {
      const unverifiedEvent = this.parseInputEvent(sqsRecord) as IncomingOrderCreatedEventInput
      const incomingOrderCreatedEvent = IncomingOrderCreatedEvent.validateAndBuild(unverifiedEvent)
      await this.allocateOrderStockWorkerService.allocateOrder(incomingOrderCreatedEvent)
      console.info(`${logContext} exit success:`, { incomingOrderCreatedEvent, sqsRecord })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, sqsRecord })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private parseInputEvent(sqsRecord: SQSRecord): unknown {
    const logContext = 'AllocateOrderStockWorkerController.parseInputEvent'

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
