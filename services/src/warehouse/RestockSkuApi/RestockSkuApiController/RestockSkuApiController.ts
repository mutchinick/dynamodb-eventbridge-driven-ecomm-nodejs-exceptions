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
      const incomingRestockSkuRequest = this.parseValidateRequest(apiEvent.body)
      const restockSkuOutput = await this.restockSkuApiService.restockSku(incomingRestockSkuRequest)
      const apiResponse = HttpResponse.Accepted(restockSkuOutput)
      console.info(`${logContext} exit success:`, { apiResponse })
      return apiResponse
    } catch (error) {
      console.error('RestockSkuApiController.restockSku error:', { error })

      // If InvalidArgumentsError we return Bad Request
      if (error instanceof InvalidArgumentsError) {
        return HttpResponse.BadRequestError()
      }

      return HttpResponse.InternalServerError()
    }
  }

  /**
   *
   */
  private parseValidateRequest(bodyText: string): IncomingRestockSkuRequest {
    const logContext = 'RestockSkuApiController.parseValidateRequest'
    console.info(`${logContext} init:`, { bodyText })

    try {
      const unverifiedRequest = JSON.parse(bodyText) as IncomingRestockSkuRequestInput
      const incomingRestockSkuRequest = IncomingRestockSkuRequest.validateAndBuild(unverifiedRequest)
      console.info(`${logContext} exit success:`, { bodyText })
      return incomingRestockSkuRequest
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, bodyText })
      throw invalidArgumentsError
    }
  }
}
