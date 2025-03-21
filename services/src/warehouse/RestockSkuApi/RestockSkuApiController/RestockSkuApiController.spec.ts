import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { InvalidArgumentsError } from '../../errors/AppError'
import { IncomingRestockSkuRequest } from '../model/IncomingRestockSkuRequest'
import { IRestockSkuApiService, RestockSkuApiServiceOutput } from '../RestockSkuApiService/RestockSkuApiService'
import { RestockSkuApiController } from './RestockSkuApiController'

const mockSku = 'mockSku'

type MockApiEventBody = {
  sku: string
  units: number
  lotId: string
}

function buildMockApiEventBody(): MockApiEventBody {
  const mockValidRequest: MockApiEventBody = {
    sku: mockSku,
    units: 2,
    lotId: 'mockLotId',
  }
  return mockValidRequest
}

function buildMockApiEvent(incomingRestockSkuRequest: IncomingRestockSkuRequest): APIGatewayProxyEventV2 {
  const mockApiEvent = {
    body: JSON.stringify(incomingRestockSkuRequest),
  } as unknown as APIGatewayProxyEventV2
  return mockApiEvent
}

//
// Mock services
//
function buildMockRestockSkuApiService_resolves(): IRestockSkuApiService {
  const mockApiEventBody = buildMockApiEventBody()
  const mockServiceOutput: RestockSkuApiServiceOutput = mockApiEventBody
  return { restockSku: jest.fn().mockResolvedValue(mockServiceOutput) }
}

function buildMockRestockSkuApiService_throws(error?: unknown): IRestockSkuApiService {
  return { restockSku: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Warehouse Service RestockSkuApi RestockSkuApiController tests`, () => {
  //
  // Test APIGatewayProxyEventV2 edge cases
  //
  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2 is undefined`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2 is invalid`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is missing`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEvent = {} as unknown as APIGatewayProxyEventV2
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is empty`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEvent = { body: '' } as unknown as APIGatewayProxyEventV2
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.sku edge cases
  //
  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sku is missing`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.sku
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sku is undefined`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sku is null`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.sku is not a string`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sku = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.units edge cases
  //
  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.units is missing`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.units
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.units is undefined`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.units is null`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.units is not a number`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = '1' as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.units is not an integer`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.units = 2.34
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  //
  // Test APIGatewayProxyEventV2.body.lotId edge cases
  //
  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.lotId is missing`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    delete mockApiEventBody.lotId
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.lotId is undefined`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.lotId = undefined as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.lotId is null`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.lotId = null as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if the APIGatewayProxyEventV2.body.lotId is not a string`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.lotId = 123456 as never
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  //
  // Test internal logic
  //
  it(`calls RestockSkuApiService.restockSku a single time`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await restockSkuApiController.restockSku(mockApiEvent)
    expect(mockRestockSkuApiService.restockSku).toHaveBeenCalledTimes(1)
  })

  it(`calls RestockSkuApiService.restockSku with the expected input`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const expectedServiceInput = { ...mockApiEventBody }
    await restockSkuApiController.restockSku(mockApiEvent)
    expect(mockRestockSkuApiService.restockSku).toHaveBeenCalledWith(expectedServiceInput)
  })

  it(`responds with 500 Internal Server Error if RestockSkuApiService.restockSku throws`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_throws()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if RestockSkuApiService.restockSku throws and InvalidArgumentsError`, async () => {
    const mockError = InvalidArgumentsError.from()
    const mockRestockSkuApiService = buildMockRestockSkuApiService_throws(mockError)
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await restockSkuApiController.restockSku(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse).toStrictEqual(expectedResponse)
  })

  //
  // Test expected results
  //
  it(`responds with status code 202 Accepted`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    expect(actualResponse.statusCode).toStrictEqual(202)
  })

  it(`responds with the expected HttpResponse.Accepted response`, async () => {
    const mockRestockSkuApiService = buildMockRestockSkuApiService_resolves()
    const restockSkuApiController = new RestockSkuApiController(mockRestockSkuApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const actualResponse = await restockSkuApiController.restockSku(mockApiEvent)
    const expectedAcceptedResponse = HttpResponse.Accepted(mockApiEventBody)
    expect(actualResponse).toStrictEqual(expectedAcceptedResponse)
  })
})
