import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { IDbListOrdersClient } from '../DbListOrdersClient/DbListOrdersClient'
import { IncomingListOrdersRequest } from '../model/IncomingListOrdersRequest'
import { ListOrdersCommand } from '../model/ListOrdersCommand'

export interface IListOrdersApiService {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  listOrders: (incomingListOrdersRequest: IncomingListOrdersRequest) => Promise<ListOrdersApiServiceOutput>
}

export type ListOrdersApiServiceOutput = { orders: OrderData[] }

/**
 *
 */
export class ListOrdersApiService implements IListOrdersApiService {
  /**
   *
   */
  constructor(private readonly dbListOrdersClient: IDbListOrdersClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  public async listOrders(incomingListOrdersRequest: IncomingListOrdersRequest): Promise<ListOrdersApiServiceOutput> {
    const logContext = 'ListOrdersApiService.listOrders'
    console.info(`${logContext} init:`, { incomingListOrdersRequest })

    try {
      this.validateInput(incomingListOrdersRequest)
      const orders = await this.queryDatabase(incomingListOrdersRequest)
      const serviceOutput: ListOrdersApiServiceOutput = { orders }
      console.info(`${logContext} exit success:`, { serviceOutput, incomingListOrdersRequest })
      return serviceOutput
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingListOrdersRequest })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(incomingListOrdersRequest: IncomingListOrdersRequest): void {
    const logContext = 'ListOrdersApiService.validateInput'

    if (incomingListOrdersRequest instanceof IncomingListOrdersRequest === false) {
      const errorMessage = `Expected IncomingListOrdersRequest but got ${incomingListOrdersRequest}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingListOrdersRequest })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  private async queryDatabase(incomingListOrdersRequest: IncomingListOrdersRequest): Promise<OrderData[]> {
    const logContext = 'ListOrdersApiService.queryDatabase'
    console.info(`${logContext} init:`, { incomingListOrdersRequest })

    try {
      const listOrdersCommand = ListOrdersCommand.validateAndBuild(incomingListOrdersRequest)
      const orders = await this.dbListOrdersClient.listOrders(listOrdersCommand)
      console.info(`${logContext} exit success:`, { orders, listOrdersCommand, incomingListOrdersRequest })
      return orders
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingListOrdersRequest })
      throw error
    }
  }
}
