import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { IncomingSimulateRawEventRequest } from '../model/IncomingSimulateRawEventRequest'
import { ISimulateRawEventApiService } from '../SimulateRawEventApiService/SimulateRawEventApiService'
import { SimulateRawEventApiController } from './SimulateRawEventApiController'

const mockPk = 'mockPk'
const mockSk = 'mockSk'
const mockEventName = 'mockEventName'
const mockEventData = {}
const mockCreatedAt = 'mockCreatedAt'
const mockUpdatedAt = 'mockUpdatedAt'

type MockApiEventBody = {
  pk: string
  sk: string
  eventName: string
  eventData: unknown
  createdAt: string
  updatedAt: string
}

function buildMockApiEventBody(): MockApiEventBody {
  const mockApiEventBody: MockApiEventBody = {
    pk: mockPk,
    sk: mockSk,
    eventName: mockEventName,
    eventData: mockEventData,
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
  }
  return mockApiEventBody
}

function buildMockApiEvent(incomingSimulateRawEventRequest: IncomingSimulateRawEventRequest): APIGatewayProxyEventV2 {
  const mockApiEvent = {
    body: JSON.stringify(incomingSimulateRawEventRequest),
  } as unknown as APIGatewayProxyEventV2
  return mockApiEvent
}

/*
 *
 *
 ************************************************************
 * Mock services
 ************************************************************/
function buildMockSimulateRawEventApiService_resolves(): ISimulateRawEventApiService {
  const mockServiceOutput = buildMockApiEventBody()
  return { simulateRawEvent: jest.fn().mockResolvedValue(mockServiceOutput) }
}

function buildMockSimulateRawEventApiService_throws(error?: unknown): ISimulateRawEventApiService {
  return { simulateRawEvent: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Testing Service SimulateRawEventApi SimulateRawEventApiController tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2 edge cases
   ************************************************************/
  it(`does not throw if the input APIGatewayProxyEventV2 is valid`, async () => {
    const mockListOrdersApiService = buildMockSimulateRawEventApiService_resolves()
    const listOrdersApiController = new SimulateRawEventApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await expect(listOrdersApiController.simulateRawEvent(mockApiEvent)).resolves.not.toThrow()
  })

  it(`fails to call SimulateRawEventApiService.simulateRawEvent if the input APIGatewayProxyEventV2 is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SimulateRawEventApiService.simulateRawEvent if the input APIGatewayProxyEventV2 is invalid`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is invalid`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body edge cases
   ************************************************************/
  it(`fails to call SimulateRawEventApiService.simulateRawEvent if the input APIGatewayProxyEventV2.body is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SimulateRawEventApiService.simulateRawEvent if the input APIGatewayProxyEventV2.body is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SimulateRawEventApiService.simulateRawEvent if the input APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const expectedResponse = HttpResponse.BadRequestError()
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.pk edge cases
   ************************************************************/
  it(`fails to call SimulateRawEventApiService.simulateRawEvent if the input APIGatewayProxyEventV2.body.pk is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.pk = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.pk is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.pk = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SimulateRawEventApiService.simulateRawEvent if the input APIGatewayProxyEventV2.body.pk is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.pk = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.pk is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.pk = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.sk edge cases
   ************************************************************/
  it(`fails to call SimulateRawEventApiService.simulateRawEvent if the input APIGatewayProxyEventV2.body.sk is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sk = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.sk is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sk = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SimulateRawEventApiService.simulateRawEvent if the input APIGatewayProxyEventV2.body.sk is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sk = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.sk is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sk = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.eventName edge cases
   ************************************************************/
  it(`fails to call SimulateRawEventApiService.simulateRawEvent if the input APIGatewayProxyEventV2.body.eventName is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.eventName = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.eventName is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.eventName = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SimulateRawEventApiService.simulateRawEvent if the input APIGatewayProxyEventV2.body.eventName is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.eventName = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.eventName is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.eventName = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.createdAt edge cases
   ************************************************************/
  it(`calls SimulateRawEventApiService.simulateRawEvent if the input APIGatewayProxyEventV2.body.createdAt is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.createdAt = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).toHaveBeenCalled()
  })

  it(`responds with 202 Accepted if the input APIGatewayProxyEventV2.body.createdAt is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.createdAt = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(response.statusCode).toBe(202)
  })

  it(`fails to call SimulateRawEventApiService.simulateRawEvent if the input APIGatewayProxyEventV2.body.createdAt is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.createdAt = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.createdAt is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.createdAt = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.updatedAt edge cases
   ************************************************************/
  it(`calls SimulateRawEventApiService.simulateRawEvent if the input APIGatewayProxyEventV2.body.updatedAt is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.updatedAt = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).toHaveBeenCalled()
  })

  it(`responds with 202 Accepted if the input APIGatewayProxyEventV2.body.updatedAt is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.updatedAt = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(response.statusCode).toBe(202)
  })

  it(`fails to call SimulateRawEventApiService.simulateRawEvent if the input APIGatewayProxyEventV2.body.updatedAt is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.updatedAt = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.updatedAt is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.updatedAt = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.eventData edge cases
   ************************************************************/
  it(`calls SimulateRawEventApiService.simulateRawEvent if the input APIGatewayProxyEventV2.body.eventData is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.eventData = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).toHaveBeenCalled()
  })

  it(`responds with 202 Accepted if the input APIGatewayProxyEventV2.body.eventData is undefined`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.eventData = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(response.statusCode).toBe(202)
  })

  it(`calls SimulateRawEventApiService.simulateRawEvent if the input APIGatewayProxyEventV2.body.eventData is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.eventData = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).toHaveBeenCalled()
  })

  it(`responds with 202 Accepted if the input APIGatewayProxyEventV2.body.eventData is null`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.eventData = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(response.statusCode).toBe(202)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls SimulateRawEventApiService.simulateRawEvent a single time`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).toHaveBeenCalledTimes(1)
  })

  it(`calls SimulateRawEventApiService.simulateRawEvent with the expected input`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const expectedServiceInput = { ...mockApiEventBody }
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(mockSimulateRawEventApiService.simulateRawEvent).toHaveBeenCalledWith(expectedServiceInput)
  })

  it(`responds with 500 Internal Server Error if SimulateRawEventApiService.simulateRawEvent throws an Error not accounted for`, async () => {
    const mockError = new Error('mockError')
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_throws(mockError)
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 500 Internal Server Error if SimulateRawEventApiService.simulateRawEvent throws an UnrecognizedError`, async () => {
    const unrecognizedError = UnrecognizedError.from()
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_throws(unrecognizedError)
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if SimulateRawEventApiService.simulateRawEvent throws an InvalidArgumentsError`, async () => {
    const mockError = InvalidArgumentsError.from()
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_throws(mockError)
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`responds with status code 202 Accepted`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    expect(response.statusCode).toBe(202)
  })

  it(`responds with the expected HttpResponse.Accepted response`, async () => {
    const mockSimulateRawEventApiService = buildMockSimulateRawEventApiService_resolves()
    const simulateRawEventApiController = new SimulateRawEventApiController(mockSimulateRawEventApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await simulateRawEventApiController.simulateRawEvent(mockApiEvent)
    const expectedResponse = HttpResponse.Accepted(mockApiEventBody)
    expect(response).toStrictEqual(expectedResponse)
  })
})
