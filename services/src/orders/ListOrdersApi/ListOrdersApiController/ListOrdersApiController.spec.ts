import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { HttpResponse } from '../../../shared/HttpResponse'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderStatus } from '../../model/OrderStatus'
import { type SortDirection } from '../../model/SortDirection'
import { IListOrdersApiService, ListOrdersApiServiceOutput } from '../ListOrdersApiService/ListOrdersApiService'
import { IncomingListOrdersRequest } from '../model/IncomingListOrdersRequest'
import { ListOrdersApiController } from './ListOrdersApiController'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockLimit = 10
const mockSortDirection: SortDirection = 'asc'

type MockApiEventBody = {
  orderId?: string
  sortDirection?: SortDirection
  limit?: number
}

function buildMockApiEventBody(): MockApiEventBody {
  const mockValidRequest: MockApiEventBody = {
    orderId: mockOrderId,
    limit: mockLimit,
    sortDirection: mockSortDirection,
  }

  return mockValidRequest
}

function buildMockApiEvent(incomingListOrdersRequest: IncomingListOrdersRequest): APIGatewayProxyEventV2 {
  const mockApiEvent = {
    body: JSON.stringify(incomingListOrdersRequest),
  } as unknown as APIGatewayProxyEventV2
  return mockApiEvent
}

/*
 *
 *
 ************************************************************
 * Mock services
 ************************************************************/
const mockServiceOutput: ListOrdersApiServiceOutput = {
  orders: [
    {
      orderId: 'mockOrderId-1',
      orderStatus: OrderStatus.ORDER_DELIVERED_STATUS,
      sku: 'mockSku-1',
      units: 12,
      price: 5.55,
      userId: 'mockUserId-1',
      createdAt: mockDate,
      updatedAt: mockDate,
    },
    {
      orderId: `mockOrderId-2`,
      orderStatus: OrderStatus.ORDER_STOCK_ALLOCATED_STATUS,
      sku: 'mockSku-2',
      units: 6,
      price: 3.22,
      userId: 'mockUserId-2',
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  ],
}

function buildMockListOrdersApiService_resolves(): IListOrdersApiService {
  return { listOrders: jest.fn().mockResolvedValue(mockServiceOutput) }
}

function buildMockListOrdersApiService_throws(error?: unknown): IListOrdersApiService {
  return { listOrders: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Orders Service ListOrdersApi ListOrdersApiController tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2 edge cases
   ************************************************************/
  it(`does not throw if the input APIGatewayProxyEventV2 is valid`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await expect(listOrdersApiController.listOrders(mockApiEvent)).resolves.not.toThrow()
  })

  it(`fails to call ListOrdersApiService.listOrders if the input
      APIGatewayProxyEventV2 is undefined`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    await listOrdersApiController.listOrders(mockApiEvent)
    expect(mockListOrdersApiService.listOrders).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is undefined`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = undefined as unknown as APIGatewayProxyEventV2
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ListOrdersApiService.listOrders if the input
      APIGatewayProxyEventV2 is invalid`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    await listOrdersApiController.listOrders(mockApiEvent)
    expect(mockListOrdersApiService.listOrders).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2 is invalid`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = 'mockInvalidValue' as unknown as APIGatewayProxyEventV2
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body edge cases
   ************************************************************/
  it(`fails to call ListOrdersApiService.listOrders if the input
      APIGatewayProxyEventV2.body is undefined`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    await listOrdersApiController.listOrders(mockApiEvent)
    expect(mockListOrdersApiService.listOrders).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is
      undefined`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = { body: undefined } as unknown as APIGatewayProxyEventV2
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ListOrdersApiService.listOrders if the input
      APIGatewayProxyEventV2.body is null`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    await listOrdersApiController.listOrders(mockApiEvent)
    expect(mockListOrdersApiService.listOrders).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is null`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = { body: null } as unknown as APIGatewayProxyEventV2
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call ListOrdersApiService.listOrders if the input
      APIGatewayProxyEventV2.body is not a valid JSON`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    await listOrdersApiController.listOrders(mockApiEvent)
    expect(mockListOrdersApiService.listOrders).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body is not a
      valid JSON`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEvent = { body: 'mockInvalidValue' } as unknown as APIGatewayProxyEventV2
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.orderId edge cases
   ************************************************************/
  it(`calls ListOrdersApiService.listOrders if the input
      APIGatewayProxyEventV2.body.orderId is undefined`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.orderId = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listOrdersApiController.listOrders(mockApiEvent)
    expect(mockListOrdersApiService.listOrders).toHaveBeenCalled()
  })

  it(`responds with 200 OK if the input APIGatewayProxyEventV2.body.orderId is
      undefined`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.orderId = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    expect(response.statusCode).toBe(200)
  })

  it(`fails to call ListOrdersApiService.listOrders if the input
      APIGatewayProxyEventV2.body.orderId is null`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.orderId = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listOrdersApiController.listOrders(mockApiEvent)
    expect(mockListOrdersApiService.listOrders).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.orderId
      is null`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.orderId = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.limit edge cases
   ************************************************************/
  it(`calls ListOrdersApiService.listOrders if the input
      APIGatewayProxyEventV2.body.limit is undefined`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listOrdersApiController.listOrders(mockApiEvent)
    expect(mockListOrdersApiService.listOrders).toHaveBeenCalled()
  })

  it(`responds with 200 OK if the input APIGatewayProxyEventV2.body.limit is undefined`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    expect(response.statusCode).toBe(200)
  })

  it(`fails to call ListOrdersApiService.listOrders if the input
      APIGatewayProxyEventV2.body.limit is null`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listOrdersApiController.listOrders(mockApiEvent)
    expect(mockListOrdersApiService.listOrders).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input APIGatewayProxyEventV2.body.limit is
      null`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.limit = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test APIGatewayProxyEventV2.body.sortDirection edge cases
   ************************************************************/
  it(`calls ListOrdersApiService.listOrders if the input
      APIGatewayProxyEventV2.body.sortDirection is undefined`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sortDirection = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listOrdersApiController.listOrders(mockApiEvent)
    expect(mockListOrdersApiService.listOrders).toHaveBeenCalled()
  })

  it(`responds with 200 OK if the input APIGatewayProxyEventV2.body.sortDirection is
      undefined`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sortDirection = undefined
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    expect(response.statusCode).toBe(200)
  })

  it(`fails to call ListOrdersApiService.listOrders if the input
      APIGatewayProxyEventV2.body.sortDirection is null`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sortDirection = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listOrdersApiController.listOrders(mockApiEvent)
    expect(mockListOrdersApiService.listOrders).not.toHaveBeenCalled()
  })

  it(`responds with 400 Bad Request if the input
      APIGatewayProxyEventV2.body.sortDirection is null`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    mockApiEventBody.sortDirection = null
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls ListOrdersApiService.listOrders a single time`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    await listOrdersApiController.listOrders(mockApiEvent)
    expect(mockListOrdersApiService.listOrders).toHaveBeenCalledTimes(1)
  })

  it(`calls ListOrdersApiService.listOrders with the expected input`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const expectedServiceInput = { ...mockApiEventBody }
    await listOrdersApiController.listOrders(mockApiEvent)
    expect(mockListOrdersApiService.listOrders).toHaveBeenCalledWith(expectedServiceInput)
  })

  it(`responds with 500 Internal Server Error if ListOrdersApiService.listOrders
       throws an Error not accounted for`, async () => {
    const mockError = new Error('mockError')
    const mockListOrdersApiService = buildMockListOrdersApiService_throws(mockError)
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 500 Internal Server Error if ListOrdersApiService.listOrders
       throws an UnrecognizedError`, async () => {
    const unrecognizedError = UnrecognizedError.from()
    const mockListOrdersApiService = buildMockListOrdersApiService_throws(unrecognizedError)
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.InternalServerError()
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`responds with 400 Bad Request if ListOrdersApiService.listOrders throws an
       InvalidArgumentsError`, async () => {
    const mockError = InvalidArgumentsError.from()
    const mockListOrdersApiService = buildMockListOrdersApiService_throws(mockError)
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.BadRequestError()
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`responds with status code 200 OK`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    expect(response.statusCode).toBe(200)
  })

  it(`responds with the expected HttpResponse.OK response`, async () => {
    const mockListOrdersApiService = buildMockListOrdersApiService_resolves()
    const listOrdersApiController = new ListOrdersApiController(mockListOrdersApiService)
    const mockApiEventBody = buildMockApiEventBody()
    const mockApiEvent = buildMockApiEvent(mockApiEventBody)
    const response = await listOrdersApiController.listOrders(mockApiEvent)
    const expectedResponse = HttpResponse.OK(mockServiceOutput)
    expect(response).toStrictEqual(expectedResponse)
  })
})
