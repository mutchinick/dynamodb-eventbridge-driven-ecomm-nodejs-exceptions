import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { IDbListOrderPaymentsClient } from '../DbListOrderPaymentsClient/DbListOrderPaymentsClient'
import { IncomingListOrderPaymentsRequest } from '../model/IncomingListOrderPaymentsRequest'
import { ListOrderPaymentsCommand, ListOrderPaymentsCommandInput } from '../model/ListOrderPaymentsCommand'

export interface IListOrderPaymentsApiService {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  listOrderPayments: (
    incomingListOrderPaymentsRequest: IncomingListOrderPaymentsRequest,
  ) => Promise<ListOrderPaymentsApiServiceOutput>
}

export type ListOrderPaymentsApiServiceOutput = { orderPayments: OrderPaymentData[] }

/**
 *
 */
export class ListOrderPaymentsApiService implements IListOrderPaymentsApiService {
  /**
   *
   */
  constructor(private readonly dbListOrderPaymentsClient: IDbListOrderPaymentsClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  public async listOrderPayments(
    incomingListOrderPaymentsRequest: IncomingListOrderPaymentsRequest,
  ): Promise<ListOrderPaymentsApiServiceOutput> {
    const logContext = 'ListOrderPaymentsApiService.listOrderPayments'
    console.info(`${logContext} init:`, { incomingListOrderPaymentsRequest })

    try {
      this.validateInput(incomingListOrderPaymentsRequest)
      const orderPayments = await this.queryOrderPayments(incomingListOrderPaymentsRequest)
      const serviceOutput: ListOrderPaymentsApiServiceOutput = { orderPayments }
      console.info(`${logContext} exit success:`, { serviceOutput, incomingListOrderPaymentsRequest })
      return serviceOutput
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingListOrderPaymentsRequest })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(incomingListOrderPaymentsRequest: IncomingListOrderPaymentsRequest): void {
    const logContext = 'ListOrderPaymentsApiService.validateInput'

    if (incomingListOrderPaymentsRequest instanceof IncomingListOrderPaymentsRequest === false) {
      const errorMessage = `Expected IncomingListOrderPaymentsRequest but got ${incomingListOrderPaymentsRequest}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingListOrderPaymentsRequest })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  private async queryOrderPayments(
    incomingListOrderPaymentsRequest: IncomingListOrderPaymentsRequest,
  ): Promise<OrderPaymentData[]> {
    const logContext = 'ListOrderPaymentsApiService.queryOrderPayments'
    console.info(`${logContext} init:`, { incomingListOrderPaymentsRequest })

    try {
      const { orderId, sortDirection, limit } = incomingListOrderPaymentsRequest
      const listOrderPaymentsCommandInput: ListOrderPaymentsCommandInput = { orderId, sortDirection, limit }
      const listOrderPaymentsCommand = ListOrderPaymentsCommand.validateAndBuild(listOrderPaymentsCommandInput)
      const orderPayments = await this.dbListOrderPaymentsClient.listOrderPayments(listOrderPaymentsCommand)
      console.info(`${logContext} exit success:`, {
        orderPayments,
        listOrderPaymentsCommand,
        listOrderPaymentsCommandInput,
      })
      return orderPayments
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingListOrderPaymentsRequest })
      throw error
    }
  }
}
