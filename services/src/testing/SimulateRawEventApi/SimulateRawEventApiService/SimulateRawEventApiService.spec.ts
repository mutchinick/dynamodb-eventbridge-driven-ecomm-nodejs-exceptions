import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { DuplicateEventRaisedError, InvalidArgumentsError } from '../../errors/AppError'
import { IEsRaiseRawSimulatedEventClient } from '../EsRaiseRawSimulatedEventClient/EsRaiseRawSimulatedEventClient'
import { IncomingSimulateRawEventRequest } from '../model/IncomingSimulateRawEventRequest'
import { RawSimulatedEvent, RawSimulatedEventInput } from '../model/RawSimulatedEvent'
import { SimulateRawEventApiService } from './SimulateRawEventApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()

function buildMockIncomingSimulateRawEventRequest(): TypeUtilsMutable<IncomingSimulateRawEventRequest> {
  const mockClass = IncomingSimulateRawEventRequest.validateAndBuild({
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
  })
  return mockClass
}

const mockIncomingSimulateRawEventRequest = buildMockIncomingSimulateRawEventRequest()

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
function buildMockEsRaiseRawSimulatedEventClient_resolves(): IEsRaiseRawSimulatedEventClient {
  return { raiseRawSimulatedEvent: jest.fn() }
}

function buildMockEsRaiseRawSimulatedEventClient_throws(error?: unknown): IEsRaiseRawSimulatedEventClient {
  return { raiseRawSimulatedEvent: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Testing Service SimulateRawEventApi SimulateRawEventApiService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingSimulateRawEventRequestInput edge cases
   ************************************************************/
  it(`does not throw if the input IncomingSimulateRawEventRequest is valid`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_resolves()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const resultPromise = simulateRawEventApiService.simulateRawEvent(mockIncomingSimulateRawEventRequest)
    await expect(resultPromise).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequest is undefined`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_resolves()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const mockTestRequest = undefined as never
    const resultPromise = simulateRawEventApiService.simulateRawEvent(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequest is null`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_resolves()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const mockTestRequest = null as never
    const resultPromise = simulateRawEventApiService.simulateRawEvent(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequest is not an instance of the class`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_resolves()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const mockTestRequest = { ...mockIncomingSimulateRawEventRequest }
    const resultPromise = simulateRawEventApiService.simulateRawEvent(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`throws the same Error if RawSimulatedEvent.validateAndBuild throws an Error`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_resolves()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const mockError = new Error('mockError')
    jest.spyOn(RawSimulatedEvent, 'validateAndBuild').mockImplementationOnce(() => {
      throw mockError
    })
    await expect(simulateRawEventApiService.simulateRawEvent(mockIncomingSimulateRawEventRequest)).rejects.toThrow(
      mockError,
    )
  })

  it(`calls EsRaiseRawSimulatedEventClient.simulateRawEvent a single time`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_resolves()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    await simulateRawEventApiService.simulateRawEvent(mockIncomingSimulateRawEventRequest)
    expect(mockEsRaiseRawSimulatedEventClient.raiseRawSimulatedEvent).toHaveBeenCalledTimes(1)
  })

  it(`calls EsRaiseRawSimulatedEventClient.simulateRawEvent with the expected input`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_resolves()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    await simulateRawEventApiService.simulateRawEvent(mockIncomingSimulateRawEventRequest)
    const expectedRawSimulatedEventInput: RawSimulatedEventInput = { ...mockIncomingSimulateRawEventRequest }
    const expectedRawSimulatedEvent = RawSimulatedEvent.validateAndBuild(expectedRawSimulatedEventInput)
    expect(mockEsRaiseRawSimulatedEventClient.raiseRawSimulatedEvent).toHaveBeenCalledWith(expectedRawSimulatedEvent)
  })

  it(`throws the same Error if EsRaiseRawSimulatedEventClient.simulateRawEvent throws
      an unwrapped Error`, async () => {
    const mockError = new Error('mockError')
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_throws(mockError)
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const resultPromise = simulateRawEventApiService.simulateRawEvent(mockIncomingSimulateRawEventRequest)
    await expect(resultPromise).rejects.toThrow(mockError)
  })

  it(`returns the expected SimulateRawEventApiServiceOutput if
      EsRaiseRawSimulatedEventClient.simulateRawEvent throws DuplicateEventRaisedError`, async () => {
    const mockError = DuplicateEventRaisedError.from()
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_throws(mockError)
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const result = await simulateRawEventApiService.simulateRawEvent(mockIncomingSimulateRawEventRequest)
    const expectedResult: IncomingSimulateRawEventRequest = {
      pk: mockIncomingSimulateRawEventRequest.pk,
      sk: mockIncomingSimulateRawEventRequest.sk,
      eventName: mockIncomingSimulateRawEventRequest.eventName,
      eventData: mockIncomingSimulateRawEventRequest.eventData,
      createdAt: mockIncomingSimulateRawEventRequest.createdAt,
      updatedAt: mockIncomingSimulateRawEventRequest.updatedAt,
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns a SimulateRawEventApiServiceOutput if the execution path is successful`, async () => {
    const mockEsRaiseRawSimulatedEventClient = buildMockEsRaiseRawSimulatedEventClient_resolves()
    const simulateRawEventApiService = new SimulateRawEventApiService(mockEsRaiseRawSimulatedEventClient)
    const result = await simulateRawEventApiService.simulateRawEvent(mockIncomingSimulateRawEventRequest)
    const expectedResult: IncomingSimulateRawEventRequest = {
      pk: mockIncomingSimulateRawEventRequest.pk,
      sk: mockIncomingSimulateRawEventRequest.sk,
      eventName: mockIncomingSimulateRawEventRequest.eventName,
      eventData: mockIncomingSimulateRawEventRequest.eventData,
      createdAt: mockIncomingSimulateRawEventRequest.createdAt,
      updatedAt: mockIncomingSimulateRawEventRequest.updatedAt,
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
