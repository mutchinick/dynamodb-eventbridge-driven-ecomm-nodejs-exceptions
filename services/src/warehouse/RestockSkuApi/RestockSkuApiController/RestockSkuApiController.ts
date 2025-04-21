import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { InvalidArgumentsError } from '../../errors/AppError'
import { IRestockSkuApiService } from '../RestockSkuApiService/RestockSkuApiService'
import { IncomingRestockSkuRequest, IncomingRestockSkuRequestInput } from '../model/IncomingRestockSkuRequest'

export interface IRestockSkuApiController {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
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
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  public async restockSku(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    const logContext = 'RestockSkuApiController.restockSku'
    console.info(`${logContext} init:`, { apiEvent })

    try {
      const unverifiedRequest = this.parseInputRequest(apiEvent) as IncomingRestockSkuRequestInput
      const incomingRestockSkuRequest = IncomingRestockSkuRequest.validateAndBuild(unverifiedRequest)
      const restockSkuOutput = await this.restockSkuApiService.restockSku(incomingRestockSkuRequest)
      const successResponse = HttpResponse.Accepted(restockSkuOutput)
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
    const logContext = 'RestockSkuApiController.parseInputRequest'

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
