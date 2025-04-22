import { InvalidArgumentsError } from '../../errors/AppError'
import { RestockSkuData } from '../../model/RestockSkuData'
import { IDbListSkusClient } from '../DbListSkusClient/DbListSkusClient'
import { IncomingListSkusRequest } from '../model/IncomingListSkusRequest'
import { ListSkusCommand, ListSkusCommandInput } from '../model/ListSkusCommand'

export interface IListSkusApiService {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  listSkus: (incomingListSkusRequest: IncomingListSkusRequest) => Promise<ListSkusApiServiceOutput>
}

export type ListSkusApiServiceOutput = { skus: RestockSkuData[] }

/**
 *
 */
export class ListSkusApiService implements IListSkusApiService {
  /**
   *
   */
  constructor(private readonly dbListSkusClient: IDbListSkusClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  public async listSkus(incomingListSkusRequest: IncomingListSkusRequest): Promise<ListSkusApiServiceOutput> {
    const logContext = 'ListSkusApiService.listSkus'
    console.info(`${logContext} init:`, { incomingListSkusRequest })

    try {
      this.validateInput(incomingListSkusRequest)
      const skus = await this.querySkus(incomingListSkusRequest)
      const serviceOutput: ListSkusApiServiceOutput = { skus }
      console.info(`${logContext} exit success:`, { serviceOutput, incomingListSkusRequest })
      return serviceOutput
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingListSkusRequest })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(incomingListSkusRequest: IncomingListSkusRequest): void {
    const logContext = 'ListSkusApiService.validateInput'

    if (incomingListSkusRequest instanceof IncomingListSkusRequest === false) {
      const errorMessage = `Expected IncomingListSkusRequest but got ${incomingListSkusRequest}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingListSkusRequest })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  private async querySkus(incomingListSkusRequest: IncomingListSkusRequest): Promise<RestockSkuData[]> {
    const logContext = 'ListSkusApiService.querySkus'
    console.info(`${logContext} init:`, { incomingListSkusRequest })

    try {
      const { sku, sortDirection, limit } = incomingListSkusRequest
      const listSkusCommandInput: ListSkusCommandInput = { sku, sortDirection, limit }
      const listSkusCommand = ListSkusCommand.validateAndBuild(listSkusCommandInput)
      const skus = await this.dbListSkusClient.listSkus(listSkusCommand)
      console.info(`${logContext} exit success:`, { skus, listSkusCommand, listSkusCommandInput })
      return skus
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingListSkusRequest })
      throw error
    }
  }
}
