import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { InvalidArgumentsError } from '../../errors/AppError'
import { IRestockSkuApiService } from '../RestockSkuApiService/RestockSkuApiService'
import { IncomingRestockSkuRequest, IncomingRestockSkuRequestInput } from '../model/IncomingRestockSkuRequest'

export interface IRestockSkuApiController {
  restockSku: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

/**
 *
 */
export class RestockSkuApiController implements IRestockSkuApiController {
  /**
   *
   */
  constructor(private readonly restockSkuApiService: IRestockSkuApiService) {
    this.restockSku = this.restockSku.bind(this)
  }

  /**
   *
   */
  public async restockSku(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    const logContext = 'RestockSkuApiController.restockSku'
    console.info(`${logContext} init:`, { apiEvent })

    try {
      const incomingRestockSkuRequest = this.parseValidateRequest(apiEvent)
      const restockSkuOutput = await this.restockSkuApiService.restockSku(incomingRestockSkuRequest)
      const apiResponse = HttpResponse.Accepted(restockSkuOutput)
      console.info(`${logContext} exit success:`, { apiResponse })
      return apiResponse
    } catch (error) {
      console.error(`${logContext} error caught:`, { apiEvent })

      if (error instanceof InvalidArgumentsError) {
        const badRequestError = HttpResponse.BadRequestError()
        console.error(`${logContext} exit error:`, { badRequestError })
        return badRequestError
      }

      const internalServerError = HttpResponse.InternalServerError()
      console.error(`${logContext} exit error:`, { internalServerError })
      return internalServerError
    }
  }

  /**
   *
   */
  private parseValidateRequest(apiEvent: APIGatewayProxyEventV2): IncomingRestockSkuRequest {
    const logContext = 'RestockSkuApiController.parseValidateRequest'
    console.info(`${logContext} init:`, { apiEvent })

    try {
      const unverifiedRequest = JSON.parse(apiEvent.body) as IncomingRestockSkuRequestInput
      const incomingRestockSkuRequest = IncomingRestockSkuRequest.validateAndBuild(unverifiedRequest)
      console.info(`${logContext} exit success:`, { apiEvent })
      return incomingRestockSkuRequest
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, apiEvent })
      throw invalidArgumentsError
    }
  }
}
