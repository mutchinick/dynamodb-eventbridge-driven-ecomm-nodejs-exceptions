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
      const unverifiedInput = this.parseInputApiEvent(apiEvent)
      const incomingPlaceOrderRequest = IncomingPlaceOrderRequest.validateAndBuild(unverifiedInput)
      const placeOrderOutput = await this.placeOrderApiService.placeOrder(incomingPlaceOrderRequest)
      const successResponse = HttpResponse.Accepted(placeOrderOutput)
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
  private parseInputApiEvent(apiEvent: APIGatewayProxyEventV2): IncomingPlaceOrderRequestInput {
    const logContext = 'PlaceOrderApiController.parseInputApiEvent'

    try {
      return JSON.parse(apiEvent.body) as IncomingPlaceOrderRequestInput
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, apiEvent })
      throw invalidArgumentsError
    }
  }
}
