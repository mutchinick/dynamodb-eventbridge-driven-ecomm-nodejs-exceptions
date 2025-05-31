import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderStatus } from '../../model/OrderStatus'
import { IDbListOrdersClient } from '../DbListOrdersClient/DbListOrdersClient'
import { IncomingListOrdersRequest } from '../model/IncomingListOrdersRequest'
import { ListOrdersCommand, ListOrdersCommandInput } from '../model/ListOrdersCommand'
import { ListOrdersApiService, ListOrdersApiServiceOutput } from './ListOrdersApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()

function buildMockIncomingListOrdersRequest(): TypeUtilsMutable<IncomingListOrdersRequest> {
  const mockClass = IncomingListOrdersRequest.validateAndBuild({
    sortDirection: 'asc',
    limit: 10,
  })
  return mockClass
}

const mockIncomingListOrdersRequest = buildMockIncomingListOrdersRequest()

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
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

function buildMockDbListOrdersClient_resolves(): IDbListOrdersClient {
  return { listOrders: jest.fn().mockResolvedValue(mockExistingOrderData) }
}

function buildMockDbListOrdersClient_throws(error?: unknown): IDbListOrdersClient {
  return { listOrders: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Orders Service ListOrdersApi ListOrdersApiService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingListOrdersRequestInput edge cases
   ************************************************************/
  it(`does not throw if the input IncomingListOrdersRequest is valid`, async () => {
    const mockDbListOrdersClient = buildMockDbListOrdersClient_resolves()
    const listOrdersApiService = new ListOrdersApiService(mockDbListOrdersClient)
    await expect(listOrdersApiService.listOrders(mockIncomingListOrdersRequest)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequest is undefined`, async () => {
    const mockDbListOrdersClient = buildMockDbListOrdersClient_resolves()
    const listOrdersApiService = new ListOrdersApiService(mockDbListOrdersClient)
    const mockTestRequest = undefined as never
    const resultPromise = listOrdersApiService.listOrders(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequest is null`, async () => {
    const mockDbListOrdersClient = buildMockDbListOrdersClient_resolves()
    const listOrdersApiService = new ListOrdersApiService(mockDbListOrdersClient)
    const mockTestRequest = null as never
    const resultPromise = listOrdersApiService.listOrders(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequest is not an instance of the class`, async () => {
    const mockDbListOrdersClient = buildMockDbListOrdersClient_resolves()
    const listOrdersApiService = new ListOrdersApiService(mockDbListOrdersClient)
    const mockTestRequest = { ...mockIncomingListOrdersRequest }
    const resultPromise = listOrdersApiService.listOrders(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`throws the same Error if ListOrdersCommand.validateAndBuild throws an Error`, async () => {
    const mockDbListOrdersClient = buildMockDbListOrdersClient_resolves()
    const listOrdersApiService = new ListOrdersApiService(mockDbListOrdersClient)
    const mockError = new Error('mockError')
    jest.spyOn(ListOrdersCommand, 'validateAndBuild').mockImplementationOnce(() => {
      throw mockError
    })
    await expect(listOrdersApiService.listOrders(mockIncomingListOrdersRequest)).rejects.toThrow(mockError)
  })

  it(`calls DbListOrdersClient.listOrders a single time`, async () => {
    const mockDbListOrdersClient = buildMockDbListOrdersClient_resolves()
    const listOrdersApiService = new ListOrdersApiService(mockDbListOrdersClient)
    await listOrdersApiService.listOrders(mockIncomingListOrdersRequest)
    expect(mockDbListOrdersClient.listOrders).toHaveBeenCalledTimes(1)
  })

  it(`calls DbListOrdersClient.listOrders with the expected input`, async () => {
    const mockDbListOrdersClient = buildMockDbListOrdersClient_resolves()
    const listOrdersApiService = new ListOrdersApiService(mockDbListOrdersClient)
    await listOrdersApiService.listOrders(mockIncomingListOrdersRequest)
    const expectedListOrdersCommandInput: ListOrdersCommandInput = { ...mockIncomingListOrdersRequest }
    const expectedListOrdersCommand = ListOrdersCommand.validateAndBuild(expectedListOrdersCommandInput)
    expect(mockDbListOrdersClient.listOrders).toHaveBeenCalledWith(expectedListOrdersCommand)
  })

  it(`throws the same Error if DbListOrdersClient.listOrders throws an unwrapped Error`, async () => {
    const mockError = new Error('mockError')
    const mockDbListOrdersClient = buildMockDbListOrdersClient_throws(mockError)
    const listOrdersApiService = new ListOrdersApiService(mockDbListOrdersClient)
    const resultPromise = listOrdersApiService.listOrders(mockIncomingListOrdersRequest)
    await expect(resultPromise).rejects.toThrow(mockError)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected ListOrdersApiServiceOutput if the execution path is
      successful`, async () => {
    const mockDbListOrdersClient = buildMockDbListOrdersClient_resolves()
    const listOrdersApiService = new ListOrdersApiService(mockDbListOrdersClient)
    const result = await listOrdersApiService.listOrders(mockIncomingListOrdersRequest)
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
