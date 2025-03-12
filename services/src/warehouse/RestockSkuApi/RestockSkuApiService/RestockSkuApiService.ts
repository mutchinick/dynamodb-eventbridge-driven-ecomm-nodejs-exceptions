import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { AsyncResult, DuplicateEventRaisedError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { IEsRaiseSkuRestockedEventClient } from '../EsRaiseSkuRestockedEventClient/EsRaiseSkuRestockedEventClient'
import { IncomingRestockSkuRequest } from '../model/IncomingRestockSkuRequest'
import { SkuRestockedEvent } from '../model/SkuRestockedEvent'

export interface IRestockSkuApiService {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  restockSku: (
    incomingRestockSkuRequest: IncomingRestockSkuRequest,
  ) => AsyncResult<RestockSkuApiServiceOutput, InvalidArgumentsError | UnrecognizedError>
}

export type RestockSkuApiServiceOutput = TypeUtilsPretty<IncomingRestockSkuRequest>

/**
 *
 */
export class RestockSkuApiService implements IRestockSkuApiService {
  /**
   *
   */
  constructor(private readonly ddbSkuRestockedEventClient: IEsRaiseSkuRestockedEventClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  public async restockSku(
    incomingRestockSkuRequest: IncomingRestockSkuRequest,
  ): AsyncResult<RestockSkuApiServiceOutput, InvalidArgumentsError | UnrecognizedError> {
    const logContext = 'RestockSkuApiService.restockSku'
    console.info(`${logContext} init:`, { incomingRestockSkuRequest })

    try {
      this.validateIncomingRestockSkuRequest(incomingRestockSkuRequest)
      await this.raiseSkuRestockedEvent(incomingRestockSkuRequest)
      const serviceOutput: RestockSkuApiServiceOutput = { ...incomingRestockSkuRequest }
      console.info(`${logContext} exit success:`, { incomingRestockSkuRequest })
      return serviceOutput
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })

      if (error instanceof DuplicateEventRaisedError) {
        const serviceOutput: RestockSkuApiServiceOutput = { ...incomingRestockSkuRequest }
        console.info(`${logContext} exit success: from-error:`, { error, serviceOutput })
        return serviceOutput
      }

      console.error(`${logContext} exit error:`, { error })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateIncomingRestockSkuRequest(incomingRestockSkuRequest: IncomingRestockSkuRequest): void {
    if (incomingRestockSkuRequest instanceof IncomingRestockSkuRequest === false) {
      throw InvalidArgumentsError.from()
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async raiseSkuRestockedEvent(
    incomingRestockSkuRequest: IncomingRestockSkuRequest,
  ): AsyncResult<void, InvalidArgumentsError | DuplicateEventRaisedError | UnrecognizedError> {
    const skuRestockedEvent = SkuRestockedEvent.validateAndBuild(incomingRestockSkuRequest)
    await this.ddbSkuRestockedEventClient.raiseSkuRestockedEvent(skuRestockedEvent)
  }
}
