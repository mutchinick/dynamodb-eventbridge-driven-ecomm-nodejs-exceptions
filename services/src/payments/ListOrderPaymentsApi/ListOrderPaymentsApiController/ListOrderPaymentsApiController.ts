import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { InvalidArgumentsError } from '../../errors/AppError'
import { IListOrderPaymentsApiService } from '../ListOrderPaymentsApiService/ListOrderPaymentsApiService'
import {
  IncomingListOrderPaymentsRequest,
  IncomingListOrderPaymentsRequestInput,
} from '../model/IncomingListOrderPaymentsRequest'

export interface IListOrderPaymentsApiController {
  listOrderPayments: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

/**
 *
 */
export class ListOrderPaymentsApiController implements IListOrderPaymentsApiController {
  /**
   *
   */
  constructor(private readonly listOrderPaymentsApiService: IListOrderPaymentsApiService) {
    this.listOrderPayments = this.listOrderPayments.bind(this)
  }

  /**
   *
   */
  public async listOrderPayments(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    const logContext = 'ListOrderPaymentsApiController.listOrderPayments'
    console.info(`${logContext} init:`, { apiEvent })

    try {
      const unverifiedRequest = this.parseInputRequest(apiEvent) as IncomingListOrderPaymentsRequestInput
      const incomingListOrderPaymentsRequest = IncomingListOrderPaymentsRequest.validateAndBuild(unverifiedRequest)
      const serviceOutput = await this.listOrderPaymentsApiService.listOrderPayments(incomingListOrderPaymentsRequest)
      const successResponse = HttpResponse.OK(serviceOutput)
      console.info(`${logContext} exit success:`, { successResponse, apiEvent })
      return successResponse
    } catch (error) {
      if (error instanceof InvalidArgumentsError) {
        const badRequestError = HttpResponse.BadRequestError()
        console.error(`${logContext} exit error:`, { badRequestError, error, apiEvent })
        return badRequestError
      }

      const internalServerError = HttpResponse.InternalServerError()
      console.error(`${logContext} exit error:`, { internalServerError, error, apiEvent })
      return internalServerError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private parseInputRequest(apiEvent: APIGatewayProxyEventV2): unknown {
    const logContext = 'ListOrderPaymentsApiController.parseInputRequest'

    try {
      const unverifiedRequest = JSON.parse(apiEvent.body)
      return unverifiedRequest
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, apiEvent })
      throw invalidArgumentsError
    }
  }
}
