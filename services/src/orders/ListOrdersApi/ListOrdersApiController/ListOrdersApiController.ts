import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { InvalidArgumentsError } from '../../errors/AppError'
import { IListOrdersApiService } from '../ListOrdersApiService/ListOrdersApiService'
import { IncomingListOrdersRequest, IncomingListOrdersRequestInput } from '../model/IncomingListOrdersRequest'

export interface IListOrdersApiController {
  listOrders: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

/**
 *
 */
export class ListOrdersApiController implements IListOrdersApiController {
  /**
   *
   */
  constructor(private readonly listOrdersApiService: IListOrdersApiService) {
    this.listOrders = this.listOrders.bind(this)
  }

  /**
   *
   */
  public async listOrders(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    const logContext = 'ListOrdersApiController.listOrders'
    console.info(`${logContext} init:`, { apiEvent })

    try {
      const unverifiedInput = this.parseInputApiEvent(apiEvent)
      const incomingListOrdersRequest = IncomingListOrdersRequest.validateAndBuild(unverifiedInput)
      const serviceOutput = await this.listOrdersApiService.listOrders(incomingListOrdersRequest)
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
  private parseInputApiEvent(apiEvent: APIGatewayProxyEventV2): IncomingListOrdersRequestInput {
    const logContext = 'ListOrdersApiController.parseInputApiEvent'

    try {
      return JSON.parse(apiEvent.body) as IncomingListOrdersRequestInput
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, apiEvent })
      throw invalidArgumentsError
    }
  }
}
