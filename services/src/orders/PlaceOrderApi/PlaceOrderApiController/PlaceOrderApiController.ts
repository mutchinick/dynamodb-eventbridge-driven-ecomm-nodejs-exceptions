// Review error handling
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { InvalidArgumentsError } from '../../errors/AppError'
import { IPlaceOrderApiService } from '../PlaceOrderApiService/PlaceOrderApiService'
import { IncomingPlaceOrderRequest, IncomingPlaceOrderRequestInput } from '../model/IncomingPlaceOrderRequest'

export interface IPlaceOrderApiController {
  placeOrder: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

/**
 *
 */
export class PlaceOrderApiController implements IPlaceOrderApiController {
  /**
   *
   */
  constructor(private readonly placeOrderApiService: IPlaceOrderApiService) {
    this.placeOrder = this.placeOrder.bind(this)
  }

  /**
   *
   */
  public async placeOrder(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    const logContext = 'PlaceOrderApiController.placeOrder'
    console.info(`${logContext} init:`, { apiEvent })

    try {
      const incomingPlaceOrderRequest = this.parseValidateRequest(apiEvent)
      const placeOrderOutput = await this.placeOrderApiService.placeOrder(incomingPlaceOrderRequest)
      const successResponse = HttpResponse.Accepted(placeOrderOutput)
      console.info(`${logContext} exit success:`, { successResponse })
      return successResponse
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })

      if (error instanceof InvalidArgumentsError) {
        const badRequestError = HttpResponse.BadRequestError()
        console.error(`${logContext} exit error:`, { error, badRequestError })
        return badRequestError
      }

      const internalServerError = HttpResponse.InternalServerError()
      console.error(`${logContext} exit error:`, { error, internalServerError })
      return internalServerError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private parseValidateRequest(apiEvent: APIGatewayProxyEventV2): IncomingPlaceOrderRequest {
    const logContext = 'PlaceOrderApiController.parseValidateRequest'

    try {
      const apiEventBody = apiEvent.body
      const unverifiedRequest = JSON.parse(apiEventBody) as IncomingPlaceOrderRequestInput
      const incomingPlaceOrderRequest = IncomingPlaceOrderRequest.validateAndBuild(unverifiedRequest)
      return incomingPlaceOrderRequest
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, apiEvent })
      throw invalidArgumentsError
    }
  }
}
