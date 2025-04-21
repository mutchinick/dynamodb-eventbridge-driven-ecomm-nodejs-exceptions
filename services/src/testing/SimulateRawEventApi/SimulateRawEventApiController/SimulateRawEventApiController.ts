import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { InvalidArgumentsError } from '../../errors/AppError'
import { ISimulateRawEventApiService } from '../SimulateRawEventApiService/SimulateRawEventApiService'
import {
  IncomingSimulateRawEventRequest,
  IncomingSimulateRawEventRequestInput,
} from '../model/IncomingSimulateRawEventRequest'

export interface ISimulateRawEventApiController {
  simulateRawEvent: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

/**
 *
 */
export class SimulateRawEventApiController implements ISimulateRawEventApiController {
  /**
   *
   */
  constructor(private readonly simulateRawEventApiService: ISimulateRawEventApiService) {
    this.simulateRawEvent = this.simulateRawEvent.bind(this)
  }

  /**
   *
   */
  public async simulateRawEvent(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    const logContext = 'SimulateRawEventApiController.simulateRawEvent'
    console.info(`${logContext} init:`, { apiEvent })

    try {
      const unverifiedRequest = this.parseInputRequest(apiEvent) as IncomingSimulateRawEventRequestInput
      const incomingSimulateRawEventRequest = IncomingSimulateRawEventRequest.validateAndBuild(unverifiedRequest)
      const serviceOutput = await this.simulateRawEventApiService.simulateRawEvent(incomingSimulateRawEventRequest)
      const successResponse = HttpResponse.Accepted(serviceOutput)
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
    const logContext = 'SimulateRawEventApiController.parseInputRequest'

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
