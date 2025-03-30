import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderStatus } from '../../model/OrderStatus'
import { IDbListOrdersClient } from '../DbListOrdersClient/DbListOrdersClient'
import { IncomingListOrdersRequest } from '../model/IncomingListOrdersRequest'
import { ListOrdersCommand, ListOrdersCommandInput } from '../model/ListOrdersCommand'
import { ListOrdersApiService, ListOrdersApiServiceOutput } from './ListOrdersApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockIncomingListOrdersRequest_ListDefault(): TypeUtilsMutable<IncomingListOrdersRequest> {
  const mockClass = IncomingListOrdersRequest.validateAndBuild({})
  return mockClass
}

//
// Mock clients
//
const mockExistingOrderData: OrderData[] = [
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
]

function buildMockDdListOrdersClient_resolves(): IDbListOrdersClient {
  return { listOrders: jest.fn().mockResolvedValue(mockExistingOrderData) }
}

function buildMockDdListOrdersClient_throws(error?: unknown): IDbListOrdersClient {
  return { listOrders: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Orders Service ListOrdersApi ListOrdersApiService tests`, () => {
  //
  // Test IncomingListOrdersRequestInput edge cases
  //
  it(`does not throw if the input ListOrdersApiServiceInput is valid`, async () => {
    const mockDdListOrdersClient = buildMockDdListOrdersClient_resolves()
    const listOrdersApiService = new ListOrdersApiService(mockDdListOrdersClient)
    const mockTestRequest = buildMockIncomingListOrdersRequest_ListDefault()
    await expect(listOrdersApiService.listOrders(mockTestRequest)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input ListOrdersApiServiceInput is undefined`, async () => {
    const mockDdListOrdersClient = buildMockDdListOrdersClient_resolves()
    const listOrdersApiService = new ListOrdersApiService(mockDdListOrdersClient)
    const mockTestRequest = undefined as never
    const resultPromise = listOrdersApiService.listOrders(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input ListOrdersApiServiceInput is null`, async () => {
    const mockDdListOrdersClient = buildMockDdListOrdersClient_resolves()
    const listOrdersApiService = new ListOrdersApiService(mockDdListOrdersClient)
    const mockTestRequest = null as never
    const resultPromise = listOrdersApiService.listOrders(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic
  //
  it(`calls DdListOrdersClient.listOrders a single time`, async () => {
    const mockDdListOrdersClient = buildMockDdListOrdersClient_resolves()
    const listOrdersApiService = new ListOrdersApiService(mockDdListOrdersClient)
    const mockTestRequest = buildMockIncomingListOrdersRequest_ListDefault()
    await listOrdersApiService.listOrders(mockTestRequest)
    expect(mockDdListOrdersClient.listOrders).toHaveBeenCalledTimes(1)
  })

  it(`calls DdListOrdersClient.listOrders with the expected input`, async () => {
    const mockDdListOrdersClient = buildMockDdListOrdersClient_resolves()
    const listOrdersApiService = new ListOrdersApiService(mockDdListOrdersClient)
    const mockTestRequest = buildMockIncomingListOrdersRequest_ListDefault()
    await listOrdersApiService.listOrders(mockTestRequest)
    const expectedListOrdersCommandInput: ListOrdersCommandInput = { ...mockTestRequest }
    const expectedListOrdersCommand = ListOrdersCommand.validateAndBuild(expectedListOrdersCommandInput)
    expect(mockDdListOrdersClient.listOrders).toHaveBeenCalledWith(expectedListOrdersCommand)
  })

  it(`throws the same Error if DdListOrdersClient.listOrders throws a native Error`, async () => {
    const mockError = new Error('mockError')
    const mockDdListOrdersClient = buildMockDdListOrdersClient_throws(mockError)
    const listOrdersApiService = new ListOrdersApiService(mockDdListOrdersClient)
    const mockTestRequest = buildMockIncomingListOrdersRequest_ListDefault()
    const resultPromise = listOrdersApiService.listOrders(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(mockError)
  })

  //
  // Test expected results
  //
  it(`returns a ListOrdersApiServiceOutput with the expected data from DdListOrdersClient.listOrders`, async () => {
    const mockDdListOrdersClient = buildMockDdListOrdersClient_resolves()
    const listOrdersApiService = new ListOrdersApiService(mockDdListOrdersClient)
    const mockTestRequest = buildMockIncomingListOrdersRequest_ListDefault()
    const result = await listOrdersApiService.listOrders(mockTestRequest)
    const expectedResult: ListOrdersApiServiceOutput = {
      orders: [
        {
          orderId: mockExistingOrderData[0].orderId,
          orderStatus: mockExistingOrderData[0].orderStatus,
          sku: mockExistingOrderData[0].sku,
          units: mockExistingOrderData[0].units,
          price: mockExistingOrderData[0].price,
          userId: mockExistingOrderData[0].userId,
          createdAt: mockExistingOrderData[0].createdAt,
          updatedAt: mockExistingOrderData[0].updatedAt,
        },
        {
          orderId: mockExistingOrderData[1].orderId,
          orderStatus: mockExistingOrderData[1].orderStatus,
          sku: mockExistingOrderData[1].sku,
          units: mockExistingOrderData[1].units,
          price: mockExistingOrderData[1].price,
          userId: mockExistingOrderData[1].userId,
          createdAt: mockExistingOrderData[1].createdAt,
          updatedAt: mockExistingOrderData[1].updatedAt,
        },
      ],
    }
    expect(result).toStrictEqual(expectedResult)
  })
})
