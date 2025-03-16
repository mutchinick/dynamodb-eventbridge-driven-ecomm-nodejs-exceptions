import { DuplicateEventRaisedError, InvalidArgumentsError } from '../../errors/AppError'
import { IEsRaiseOrderPlacedEventClient } from '../EsRaiseOrderPlacedEventClient/EsRaiseOrderPlacedEventClient'
import { IncomingPlaceOrderRequest } from '../model/IncomingPlaceOrderRequest'
import { OrderPlacedEvent } from '../model/OrderPlacedEvent'
import { PlaceOrderApiService, PlaceOrderApiServiceOutput } from './PlaceOrderApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockIncomingPlaceOrderRequestInput = IncomingPlaceOrderRequest.validateAndBuild({
  orderId: 'mockOrderId',
  sku: 'mockSku',
  units: 2,
  price: 3.98,
  userId: 'mockUserId',
})

const expectedOrderPlacedEvent = OrderPlacedEvent.validateAndBuild(mockIncomingPlaceOrderRequestInput)

function buildMockDdbPlaceOrderEventClient_resolves(): IEsRaiseOrderPlacedEventClient {
  return { raiseOrderPlacedEvent: jest.fn() }
}

function buildMockDdbPlaceOrderEventClient_throws(error?: unknown): IEsRaiseOrderPlacedEventClient {
  return { raiseOrderPlacedEvent: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Orders Service PlaceOrderApi PlaceOrderApiService tests`, () => {
  //
  // Test IncomingPlaceOrderRequestInput edge cases
  //
  it(`does not throw if the input PlaceOrderApiServiceInput is valid`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    await expect(placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequestInput)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input PlaceOrderApiServiceInput is undefined`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    const mockTestRequest = undefined as never
    const resultPromise = placeOrderApiService.placeOrder(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input PlaceOrderApiServiceInput is null`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    const mockTestRequest = null as never
    const resultPromise = placeOrderApiService.placeOrder(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic
  //
  it(`calls DdbPlaceOrderEventClient.placeOrder a single time`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequestInput)
    expect(mockDdbPlaceOrderEventClient.raiseOrderPlacedEvent).toHaveBeenCalledTimes(1)
  })

  it(`calls DdbPlaceOrderEventClient.placeOrder with the expected input`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequestInput)
    expect(mockDdbPlaceOrderEventClient.raiseOrderPlacedEvent).toHaveBeenCalledWith(expectedOrderPlacedEvent)
  })

  it(`throws the same Error if DdbPlaceOrderEventClient.placeOrder throws a native Error`, async () => {
    const mockError = new Error('mockError')
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_throws(mockError)
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    const resultPromise = placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequestInput)
    await expect(resultPromise).rejects.toThrow(mockError)
  })

  it(`returns a PlaceOrderApiServiceOutput with the expected data if 
      DdbPlaceOrderEventClient.placeOrder throws DuplicateEventRaisedError`, async () => {
    const mockError = DuplicateEventRaisedError.from()
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_throws(mockError)
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    const result = await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequestInput)
    const expectedResult: PlaceOrderApiServiceOutput = { ...mockIncomingPlaceOrderRequestInput }
    expect(result).toStrictEqual(expectedResult)
  })

  //
  // Test expected results
  //
  it(`returns a PlaceOrderApiServiceOutput with the expected data`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    const result = await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequestInput)
    const expectedResult: PlaceOrderApiServiceOutput = { ...mockIncomingPlaceOrderRequestInput }
    expect(result).toStrictEqual(expectedResult)
  })
})
