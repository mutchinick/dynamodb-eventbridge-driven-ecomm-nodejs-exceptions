import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { DuplicateEventRaisedError, InvalidArgumentsError } from '../../errors/AppError'
import { IEsRaiseOrderPlacedEventClient } from '../EsRaiseOrderPlacedEventClient/EsRaiseOrderPlacedEventClient'
import { IncomingPlaceOrderRequest } from '../model/IncomingPlaceOrderRequest'
import { OrderPlacedEvent, OrderPlacedEventInput } from '../model/OrderPlacedEvent'
import { PlaceOrderApiService, PlaceOrderApiServiceOutput } from './PlaceOrderApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

function buildMockIncomingPlaceOrderRequest(): TypeUtilsMutable<IncomingPlaceOrderRequest> {
  const mockClass = IncomingPlaceOrderRequest.validateAndBuild({
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
    price: 3.98,
    userId: 'mockUserId',
  })
  return mockClass
}

const mockIncomingPlaceOrderRequest = buildMockIncomingPlaceOrderRequest()

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
function buildMockEsRaiseOrderPlacedEventClient_resolves(): IEsRaiseOrderPlacedEventClient {
  return { raiseOrderPlacedEvent: jest.fn() }
}

function buildMockEsRaiseOrderPlacedEventClient_throws(error?: unknown): IEsRaiseOrderPlacedEventClient {
  return { raiseOrderPlacedEvent: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Orders Service PlaceOrderApi PlaceOrderApiService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingPlaceOrderRequestInput edge cases
   ************************************************************/
  it(`does not throw if the input IncomingPlaceOrderRequest is valid`, async () => {
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    await expect(placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequest is undefined`, async () => {
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    const mockTestRequest = undefined as never
    const resultPromise = placeOrderApiService.placeOrder(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequest is null`, async () => {
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    const mockTestRequest = null as never
    const resultPromise = placeOrderApiService.placeOrder(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequest is not an instance of the class`, async () => {
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    const mockTestRequest = { ...mockIncomingPlaceOrderRequest }
    const resultPromise = placeOrderApiService.placeOrder(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`throws the same Error if OrderPlacedEvent.validateAndBuild throws an Error`, async () => {
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    const mockError = new Error('mockError')
    jest.spyOn(OrderPlacedEvent, 'validateAndBuild').mockImplementationOnce(() => {
      throw mockError
    })
    await expect(placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)).rejects.toThrow(mockError)
  })

  it(`calls EsRaiseOrderPlacedEventClient.placeOrder a single time`, async () => {
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    expect(mockEsRaiseOrderPlacedEventClient.raiseOrderPlacedEvent).toHaveBeenCalledTimes(1)
  })

  it(`calls EsRaiseOrderPlacedEventClient.placeOrder with the expected input`, async () => {
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    const expectedOrderPlacedEventInput: OrderPlacedEventInput = { ...mockIncomingPlaceOrderRequest }
    const expectedOrderPlacedEvent = OrderPlacedEvent.validateAndBuild(expectedOrderPlacedEventInput)
    expect(mockEsRaiseOrderPlacedEventClient.raiseOrderPlacedEvent).toHaveBeenCalledWith(expectedOrderPlacedEvent)
  })

  it(`throws the same Error if EsRaiseOrderPlacedEventClient.placeOrder throws an
      unwrapped Error`, async () => {
    const mockError = new Error('mockError')
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_throws(mockError)
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    const resultPromise = placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    await expect(resultPromise).rejects.toThrow(mockError)
  })
  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected PlaceOrderApiServiceOutput if
      EsRaiseOrderPlacedEventClient.placeOrder throws DuplicateEventRaisedError`, async () => {
    const mockError = DuplicateEventRaisedError.from()
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_throws(mockError)
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    const result = await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    const expectedResult: PlaceOrderApiServiceOutput = {
      orderId: mockIncomingPlaceOrderRequest.orderId,
      sku: mockIncomingPlaceOrderRequest.sku,
      units: mockIncomingPlaceOrderRequest.units,
      price: mockIncomingPlaceOrderRequest.price,
      userId: mockIncomingPlaceOrderRequest.userId,
    }
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected PlaceOrderApiServiceOutput if the execution path is
      successful`, async () => {
    const mockEsRaiseOrderPlacedEventClient = buildMockEsRaiseOrderPlacedEventClient_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockEsRaiseOrderPlacedEventClient)
    const result = await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequest)
    const expectedResult: PlaceOrderApiServiceOutput = {
      orderId: mockIncomingPlaceOrderRequest.orderId,
      sku: mockIncomingPlaceOrderRequest.sku,
      units: mockIncomingPlaceOrderRequest.units,
      price: mockIncomingPlaceOrderRequest.price,
      userId: mockIncomingPlaceOrderRequest.userId,
    }
    expect(result).toStrictEqual(expectedResult)
  })
})
