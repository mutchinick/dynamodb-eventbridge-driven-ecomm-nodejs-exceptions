import { DuplicateEventRaisedError, InvalidArgumentsError } from '../../errors/AppError'
import { IEsRaiseRawSimulatedEventClient } from '../EsRaiseRawSimulatedEventClient/EsRaiseRawSimulatedEventClient'
import { IncomingSimulateRawEventRequest as IncomingSimulateRawEventRequestInput } from '../model/IncomingSimulateRawEventRequest'
import { RawSimulatedEvent } from '../model/RawSimulatedEvent'
import { SimulateRawEventApiService } from './SimulateRawEventApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

const mockValidIncomingSimulateRawEventRequestInput: IncomingSimulateRawEventRequestInput = {
  pk: 'mockPk',
  sk: 'mockSk',
  eventName: 'mockEventName',
  eventData: {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
    price: 3.98,
    userId: 'mockUserId',
  },
  createdAt: mockDate,
  updatedAt: mockDate,
}

const expectedRawSimulatedEvent = RawSimulatedEvent.validateAndBuild(mockValidIncomingSimulateRawEventRequestInput)

function buildMockEsRaiseRawSimulatedEventClient_resolves(): IEsRaiseRawSimulatedEventClient {
  return { raiseRawSimulatedEvent: jest.fn() }
}

function buildMockEsRaiseRawSimulatedEventClient_throws(error?: unknown): IEsRaiseRawSimulatedEventClient {
  return { raiseRawSimulatedEvent: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Testing Service SimulateRawEventApi SimulateRawEventApiService tests`, () => {
  //
  // Test IncomingSimulateRawEventRequestInput edge cases
  //
  it(`does not throw if the input SimulateRawEventApiServiceInput is valid`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_resolves()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const resultPromise = simulateRawEventApiService.simulateRawEvent(mockValidIncomingSimulateRawEventRequestInput)
    await expect(resultPromise).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input SimulateRawEventApiServiceInput is undefined`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_resolves()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const resultPromise = simulateRawEventApiService.simulateRawEvent(undefined)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input SimulateRawEventApiServiceInput is null`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_resolves()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const resultPromise = simulateRawEventApiService.simulateRawEvent(null)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic
  //
  it(`calls EsRaiseRawSimulatedEventClient.simulateRawEvent a single time`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_resolves()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    await simulateRawEventApiService.simulateRawEvent(mockValidIncomingSimulateRawEventRequestInput)
    expect(mockEsRaiseRawSimulatedEventClient.raiseRawSimulatedEvent).toHaveBeenCalledTimes(1)
  })

  it(`calls EsRaiseRawSimulatedEventClient.simulateRawEvent with the expected input`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_resolves()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    await simulateRawEventApiService.simulateRawEvent(mockValidIncomingSimulateRawEventRequestInput)
    expect(mockEsRaiseRawSimulatedEventClient.raiseRawSimulatedEvent).toHaveBeenCalledWith(expectedRawSimulatedEvent)
  })

  it(`throws the same Error if EsRaiseRawSimulatedEventClient.simulateRawEvent throws a native Error`, async () => {
    const mockError = new Error('mockError')
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_throws(mockError)
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const resultPromise = simulateRawEventApiService.simulateRawEvent(mockValidIncomingSimulateRawEventRequestInput)
    await expect(resultPromise).rejects.toThrow(mockError)
  })

  it(`returns a SimulateRawEventApiServiceOutput with the expected data 
      if EsRaiseRawSimulatedEventClient.simulateRawEvent throws DuplicateEventRaisedError`, async () => {
    const mockError = DuplicateEventRaisedError.from()
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_throws(mockError)
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const result = await simulateRawEventApiService.simulateRawEvent(mockValidIncomingSimulateRawEventRequestInput)
    const expectedResult = mockValidIncomingSimulateRawEventRequestInput
    expect(result).toStrictEqual(expectedResult)
  })

  //
  // Test expected results
  //
  it(`returns a SimulateRawEventApiServiceOutput with the expected data`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_resolves()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const result = await simulateRawEventApiService.simulateRawEvent(mockValidIncomingSimulateRawEventRequestInput)
    const expectedResult = mockValidIncomingSimulateRawEventRequestInput
    expect(result).toStrictEqual(expectedResult)
  })
})
