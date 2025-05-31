import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { IDbListOrderPaymentsClient } from '../DbListOrderPaymentsClient/DbListOrderPaymentsClient'
import { IncomingListOrderPaymentsRequest } from '../model/IncomingListOrderPaymentsRequest'
import { ListOrderPaymentsCommand, ListOrderPaymentsCommandInput } from '../model/ListOrderPaymentsCommand'
import { ListOrderPaymentsApiService, ListOrderPaymentsApiServiceOutput } from './ListOrderPaymentsApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()

function buildMockIncomingListOrderPaymentsRequest(): TypeUtilsMutable<IncomingListOrderPaymentsRequest> {
  const mockClass = IncomingListOrderPaymentsRequest.validateAndBuild({
    sortDirection: 'asc',
    limit: 10,
  })
  return mockClass
}

const mockIncomingListOrderPaymentsRequest = buildMockIncomingListOrderPaymentsRequest()

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
const mockExistingOrderPaymentData: OrderPaymentData[] = [
  {
    orderId: 'mockOrderId-1',
    sku: 'mockSku-1',
    units: 12,
    price: 100,
    userId: 'mockUserId-1',
    createdAt: mockDate,
    updatedAt: mockDate,
    paymentId: 'mockPaymentId-1',
    paymentStatus: 'mockPaymentStatus-1' as never,
    paymentRetries: 1,
  },
  {
    orderId: 'mockOrderId-2',
    sku: 'mockSku-2',
    units: 5,
    price: 50,
    userId: 'mockUserId-2',
    createdAt: mockDate,
    updatedAt: mockDate,
    paymentId: 'mockPaymentId-2',
    paymentStatus: 'mockPaymentStatus-2' as never,
    paymentRetries: 2,
  },
]

function buildMockDbListOrderPaymentsClient_resolves(): IDbListOrderPaymentsClient {
  return { listOrderPayments: jest.fn().mockResolvedValue(mockExistingOrderPaymentData) }
}

function buildMockDbListOrderPaymentsClient_throws(error?: unknown): IDbListOrderPaymentsClient {
  return { listOrderPayments: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Payments Service ListOrderPaymentsApi ListOrderPaymentsApiService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingListOrderPaymentsRequestInput edge cases
   ************************************************************/
  it(`does not throw if the input IncomingListOrderPaymentsRequest is valid`, async () => {
    const mockDbListOrderPaymentsClient = buildMockDbListOrderPaymentsClient_resolves()
    const listOrderPaymentsApiService = new ListOrderPaymentsApiService(mockDbListOrderPaymentsClient)
    await expect(
      listOrderPaymentsApiService.listOrderPayments(mockIncomingListOrderPaymentsRequest),
    ).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequest is undefined`, async () => {
    const mockDbListOrderPaymentsClient = buildMockDbListOrderPaymentsClient_resolves()
    const listOrderPaymentsApiService = new ListOrderPaymentsApiService(mockDbListOrderPaymentsClient)
    const mockTestRequest = undefined as never
    const resultPromise = listOrderPaymentsApiService.listOrderPayments(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequest is null`, async () => {
    const mockDbListOrderPaymentsClient = buildMockDbListOrderPaymentsClient_resolves()
    const listOrderPaymentsApiService = new ListOrderPaymentsApiService(mockDbListOrderPaymentsClient)
    const mockTestRequest = null as never
    const resultPromise = listOrderPaymentsApiService.listOrderPayments(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequest is not an instance of the class`, async () => {
    const mockDbListOrderPaymentsClient = buildMockDbListOrderPaymentsClient_resolves()
    const listOrderPaymentsApiService = new ListOrderPaymentsApiService(mockDbListOrderPaymentsClient)
    const mockTestRequest = { ...mockIncomingListOrderPaymentsRequest }
    const resultPromise = listOrderPaymentsApiService.listOrderPayments(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`throws the same Error if ListOrderPaymentsCommand.validateAndBuild throws an
      Error`, async () => {
    const mockDbListOrderPaymentsClient = buildMockDbListOrderPaymentsClient_resolves()
    const listOrderPaymentsApiService = new ListOrderPaymentsApiService(mockDbListOrderPaymentsClient)
    const mockError = new Error('mockError')
    jest.spyOn(ListOrderPaymentsCommand, 'validateAndBuild').mockImplementationOnce(() => {
      throw mockError
    })

    await expect(listOrderPaymentsApiService.listOrderPayments(mockIncomingListOrderPaymentsRequest)).rejects.toThrow(
      mockError,
    )
  })

  it(`calls DbListOrderPaymentsClient.listOrderPayments a single time`, async () => {
    const mockDbListOrderPaymentsClient = buildMockDbListOrderPaymentsClient_resolves()
    const listOrderPaymentsApiService = new ListOrderPaymentsApiService(mockDbListOrderPaymentsClient)
    await listOrderPaymentsApiService.listOrderPayments(mockIncomingListOrderPaymentsRequest)
    expect(mockDbListOrderPaymentsClient.listOrderPayments).toHaveBeenCalledTimes(1)
  })

  it(`calls DbListOrderPaymentsClient.listOrderPayments with the expected input`, async () => {
    const mockDbListOrderPaymentsClient = buildMockDbListOrderPaymentsClient_resolves()
    const listOrderPaymentsApiService = new ListOrderPaymentsApiService(mockDbListOrderPaymentsClient)
    await listOrderPaymentsApiService.listOrderPayments(mockIncomingListOrderPaymentsRequest)
    const expectedListOrderPaymentsCommandInput: ListOrderPaymentsCommandInput = {
      ...mockIncomingListOrderPaymentsRequest,
    }
    const expectedListOrderPaymentsCommand = ListOrderPaymentsCommand.validateAndBuild(
      expectedListOrderPaymentsCommandInput,
    )
    expect(mockDbListOrderPaymentsClient.listOrderPayments).toHaveBeenCalledWith(expectedListOrderPaymentsCommand)
  })

  it(`throws the same Error if DbListOrderPaymentsClient.listOrderPayments throws an
      unwrapped Error`, async () => {
    const mockError = new Error('mockError')
    const mockDbListOrderPaymentsClient = buildMockDbListOrderPaymentsClient_throws(mockError)
    const listOrderPaymentsApiService = new ListOrderPaymentsApiService(mockDbListOrderPaymentsClient)
    const resultPromise = listOrderPaymentsApiService.listOrderPayments(mockIncomingListOrderPaymentsRequest)
    await expect(resultPromise).rejects.toThrow(mockError)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected ListOrderPaymentsApiServiceOutput if the execution path is
      successful`, async () => {
    const mockDbListOrderPaymentsClient = buildMockDbListOrderPaymentsClient_resolves()
    const listOrderPaymentsApiService = new ListOrderPaymentsApiService(mockDbListOrderPaymentsClient)
    const result = await listOrderPaymentsApiService.listOrderPayments(mockIncomingListOrderPaymentsRequest)
    const expectedResult: ListOrderPaymentsApiServiceOutput = {
      orderPayments: [
        {
          orderId: mockExistingOrderPaymentData[0].orderId,
          sku: mockExistingOrderPaymentData[0].sku,
          units: mockExistingOrderPaymentData[0].units,
          price: mockExistingOrderPaymentData[0].price,
          userId: mockExistingOrderPaymentData[0].userId,
          createdAt: mockExistingOrderPaymentData[0].createdAt,
          updatedAt: mockExistingOrderPaymentData[0].updatedAt,
          paymentId: mockExistingOrderPaymentData[0].paymentId,
          paymentStatus: mockExistingOrderPaymentData[0].paymentStatus,
          paymentRetries: mockExistingOrderPaymentData[0].paymentRetries,
        },
        {
          orderId: mockExistingOrderPaymentData[1].orderId,
          sku: mockExistingOrderPaymentData[1].sku,
          units: mockExistingOrderPaymentData[1].units,
          price: mockExistingOrderPaymentData[1].price,
          userId: mockExistingOrderPaymentData[1].userId,
          createdAt: mockExistingOrderPaymentData[1].createdAt,
          updatedAt: mockExistingOrderPaymentData[1].updatedAt,
          paymentId: mockExistingOrderPaymentData[1].paymentId,
          paymentStatus: mockExistingOrderPaymentData[1].paymentStatus,
          paymentRetries: mockExistingOrderPaymentData[1].paymentRetries,
        },
      ],
    }
    expect(result).toStrictEqual(expectedResult)
  })
})
