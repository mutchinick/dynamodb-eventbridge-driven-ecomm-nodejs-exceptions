import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { DuplicateEventRaisedError, InvalidArgumentsError } from '../../errors/AppError'
import { IEsRaiseSkuRestockedEventClient } from '../EsRaiseSkuRestockedEventClient/EsRaiseSkuRestockedEventClient'
import { IncomingRestockSkuRequest } from '../model/IncomingRestockSkuRequest'
import { SkuRestockedEvent } from '../model/SkuRestockedEvent'

export interface IRestockSkuApiService {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  restockSku: (incomingRestockSkuRequest: IncomingRestockSkuRequest) => Promise<RestockSkuApiServiceOutput>
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
  public async restockSku(incomingRestockSkuRequest: IncomingRestockSkuRequest): Promise<RestockSkuApiServiceOutput> {
    const logContext = 'RestockSkuApiService.restockSku'
    console.info(`${logContext} init:`, { incomingRestockSkuRequest })

    try {
      this.validateIncomingRestockSkuRequest(incomingRestockSkuRequest)
      await this.raiseSkuRestockedEvent(incomingRestockSkuRequest)
      const serviceOutput: RestockSkuApiServiceOutput = { ...incomingRestockSkuRequest }
      console.info(`${logContext} exit success:`, { incomingRestockSkuRequest })
      return serviceOutput
    } catch (error) {
      if (error instanceof DuplicateEventRaisedError) {
        const serviceOutput: RestockSkuApiServiceOutput = { ...incomingRestockSkuRequest }
        console.info(`${logContext} exit success: from-error:`, { serviceOutput, error })
        return serviceOutput
      }

      console.error(`${logContext} exit error:`, { error, incomingRestockSkuRequest })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateIncomingRestockSkuRequest(incomingRestockSkuRequest: IncomingRestockSkuRequest): void {
    const logContext = 'RestockSkuApiService.validateIncomingRestockSkuRequest'

    if (incomingRestockSkuRequest instanceof IncomingRestockSkuRequest === false) {
      const invalidArgumentsError = InvalidArgumentsError.from()
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingRestockSkuRequest })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async raiseSkuRestockedEvent(incomingRestockSkuRequest: IncomingRestockSkuRequest): Promise<void> {
    const logContext = 'RestockSkuApiService.raiseSkuRestockedEvent'
    console.info(`${logContext} init:`, { incomingRestockSkuRequest })

    try {
      const skuRestockedEvent = SkuRestockedEvent.validateAndBuild(incomingRestockSkuRequest)
      await this.ddbSkuRestockedEventClient.raiseSkuRestockedEvent(skuRestockedEvent)
      console.info(`${logContext} exit success:`, { skuRestockedEvent })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingRestockSkuRequest })
      throw error
    }
  }
}
