import { SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { InvalidArgumentsError, isTransientError } from '../../errors/AppError'
import { IncomingSkuRestockedEvent, IncomingSkuRestockedEventInput } from '../model/IncomingSkuRestockedEvent'
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

    if (!sqsEvent || !sqsEvent.Records) {
      const error = new Error(`Expected SQSEvent but got ${sqsEvent}`)
      console.error(`${logContext} exit error:`, { error, sqsEvent })
      return sqsBatchResponse
    }

    for (const record of sqsEvent.Records) {
      try {
        await this.restockSkuSingle(record)
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
   * @throws {DuplicateRestockOperationError}
   * @throws {UnrecognizedError}
   */
  private async restockSkuSingle(sqsRecord: SQSRecord): Promise<void> {
    const logContext = 'RestockSkuWorkerController.restockSkuSingle'
    console.info(`${logContext} init:`, { sqsRecord })

    try {
      const unverifiedInput = this.parseInputSqsRecord(sqsRecord)
      const incomingSkuRestockedEvent = IncomingSkuRestockedEvent.validateAndBuild(unverifiedInput)
      await this.restockSkuWorkerService.restockSku(incomingSkuRestockedEvent)
      console.info(`${logContext} exit success:`, { incomingSkuRestockedEvent, sqsRecord })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, sqsRecord })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private parseInputSqsRecord(sqsRecord: SQSRecord): IncomingSkuRestockedEventInput {
    const logContext = 'RestockSkuWorkerController.parseInputSqsRecord'

    try {
      return JSON.parse(sqsRecord.body) as IncomingSkuRestockedEventInput
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, sqsRecord })
      throw invalidArgumentsError
    }
  }
}
