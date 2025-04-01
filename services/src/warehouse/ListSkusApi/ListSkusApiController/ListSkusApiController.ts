import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { InvalidArgumentsError } from '../../errors/AppError'
import { IListSkusApiService } from '../ListSkusApiService/ListSkusApiService'
import { IncomingListSkusRequest, IncomingListSkusRequestInput } from '../model/IncomingListSkusRequest'

export interface IListSkusApiController {
  listSkus: (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
}

/**
 *
 */
export class ListSkusApiController implements IListSkusApiController {
  /**
   *
   */
  constructor(private readonly listSkusApiService: IListSkusApiService) {
    this.listSkus = this.listSkus.bind(this)
  }

  /**
   *
   */
  public async listSkus(apiEvent: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    const logContext = 'ListSkusApiController.listSkus'
    console.info(`${logContext} init:`, { apiEvent })

    try {
      const unverifiedInput = this.parseInputApiEvent(apiEvent)
      const incomingListSkusRequest = IncomingListSkusRequest.validateAndBuild(unverifiedInput)
      const serviceOutput = await this.listSkusApiService.listSkus(incomingListSkusRequest)
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
  private parseInputApiEvent(apiEvent: APIGatewayProxyEventV2): IncomingListSkusRequestInput {
    const logContext = 'ListSkusApiController.parseInputApiEvent'

    try {
      return JSON.parse(apiEvent.body) as IncomingListSkusRequestInput
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, apiEvent })
      throw invalidArgumentsError
    }
  }
}
