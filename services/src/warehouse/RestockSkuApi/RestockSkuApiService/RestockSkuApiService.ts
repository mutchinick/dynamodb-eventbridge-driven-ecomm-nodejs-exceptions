import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { AsyncResult, InvalidArgumentsError, DuplicateEventRaisedError, UnrecognizedError } from '../../errors/AppError'
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
  ) => AsyncResult<ServiceOutput, InvalidArgumentsError | UnrecognizedError>
}

export type ServiceOutput = TypeUtilsPretty<IncomingRestockSkuRequest>

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
  ): AsyncResult<ServiceOutput, InvalidArgumentsError | UnrecognizedError> {
    const logContext = 'RestockSkuApiService.restockSku'
    console.info(`${logContext} init:`, { incomingRestockSkuRequest })

    try {
      await this.raiseSkuRestockedEvent(incomingRestockSkuRequest)
      console.info(`${logContext} exit success:`, { incomingRestockSkuRequest })
      return incomingRestockSkuRequest
    } catch (error) {
      console.error(`${logContext} exit error:`, { error })
      if (error instanceof DuplicateEventRaisedError) {
        return incomingRestockSkuRequest
      }
      throw error
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
