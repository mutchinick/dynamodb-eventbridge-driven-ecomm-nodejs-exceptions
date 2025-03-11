// Review error handling
import { DuplicateEventRaisedError } from '../../errors/AppError'
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

const expectedValidOutput: PlaceOrderApiServiceOutput = {
  ...mockIncomingPlaceOrderRequestInput,
}

function buildMockDdbPlaceOrderEventClient_raiseEvent_resolves(): IEsRaiseOrderPlacedEventClient {
  return { raiseOrderPlacedEvent: jest.fn() }
}

function buildMockDdbPlaceOrderEventClient_raiseEvent_throws(error?: unknown): IEsRaiseOrderPlacedEventClient {
  return { raiseOrderPlacedEvent: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Orders Service PlaceOrderApi PlaceOrderApiService tests`, () => {
  //
  // Test IncomingPlaceOrderRequestInput edge cases
  //
  it(`does not throw if the input PlaceOrderApiServiceInput is valid`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    await expect(placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequestInput)).resolves.not.toThrow()
  })

  it(`throws if the input PlaceOrderApiServiceInput is undefined`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    await expect(placeOrderApiService.placeOrder(undefined)).rejects.toThrow()
  })

  it(`throws if the input PlaceOrderApiServiceInput is null`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    await expect(placeOrderApiService.placeOrder(null)).rejects.toThrow()
  })

  //
  // Test internal logic
  //
  it(`calls DdbPlaceOrderEventClient.placeOrder a single time`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequestInput)
    expect(mockDdbPlaceOrderEventClient.raiseOrderPlacedEvent).toHaveBeenCalledTimes(1)
  })

  it(`calls DdbPlaceOrderEventClient.placeOrder with the expected input`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequestInput)
    expect(mockDdbPlaceOrderEventClient.raiseOrderPlacedEvent).toHaveBeenCalledWith(expectedOrderPlacedEvent)
  })

  it(`throws if DdbPlaceOrderEventClient.placeOrder throws`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_throws()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    await expect(placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequestInput)).rejects.toThrow()
  })

  it(`returns a PlaceOrderApiServiceOutput with the expected data if 
      DdbPlaceOrderEventClient.placeOrder throws DuplicateEventRaisedError`, async () => {
    const error = DuplicateEventRaisedError.from()
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_throws(error)
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    const actualOutput = await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequestInput)
    expect(actualOutput).toStrictEqual(expectedValidOutput)
  })

  //
  // Test expected results
  //
  it(`returns a PlaceOrderApiServiceOutput with the expected data`, async () => {
    const mockDdbPlaceOrderEventClient = buildMockDdbPlaceOrderEventClient_raiseEvent_resolves()
    const placeOrderApiService = new PlaceOrderApiService(mockDdbPlaceOrderEventClient)
    const actualOutput = await placeOrderApiService.placeOrder(mockIncomingPlaceOrderRequestInput)
    expect(actualOutput).toStrictEqual(expectedValidOutput)
  })
})
