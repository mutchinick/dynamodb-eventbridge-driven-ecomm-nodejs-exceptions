import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { DuplicateEventRaisedError, InvalidArgumentsError } from '../../errors/AppError'
import { IEsRaiseSkuRestockedEventClient } from '../EsRaiseSkuRestockedEventClient/EsRaiseSkuRestockedEventClient'
import { IncomingRestockSkuRequest } from '../model/IncomingRestockSkuRequest'
import { SkuRestockedEvent, SkuRestockedEventInput } from '../model/SkuRestockedEvent'
import { RestockSkuApiService, RestockSkuApiServiceOutput } from './RestockSkuApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

function buildMockIncomingRestockSkuRequest(): TypeUtilsMutable<IncomingRestockSkuRequest> {
  const mockClass = IncomingRestockSkuRequest.validateAndBuild({
    sku: 'mockSku',
    units: 2,
    lotId: 'mockLotId',
  })
  return mockClass
}

const mockIncomingRestockSkuRequest = buildMockIncomingRestockSkuRequest()

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
function buildMockEsRaiseSkuRestockedEventClient_resolves(): IEsRaiseSkuRestockedEventClient {
  return { raiseSkuRestockedEvent: jest.fn() }
}

function buildMockEsRaiseSkuRestockedEventClient_throws(error?: unknown): IEsRaiseSkuRestockedEventClient {
  return { raiseSkuRestockedEvent: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Inventory Service RestockSkuApi RestockSkuApiService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingRestockSkuRequestInput edge cases
   ************************************************************/
  it(`does not throw if the input IncomingRestockSkuRequest is valid`, async () => {
    const mockEsRaiseSkuRestockedEventClient = buildMockEsRaiseSkuRestockedEventClient_resolves()
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    await expect(restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingRestockSkuRequest is undefined`, async () => {
    const mockEsRaiseSkuRestockedEventClient = buildMockEsRaiseSkuRestockedEventClient_resolves()
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    const mockTestRequest = undefined as never
    const resultPromise = restockSkuApiService.restockSku(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingRestockSkuRequest is null`, async () => {
    const mockEsRaiseSkuRestockedEventClient = buildMockEsRaiseSkuRestockedEventClient_resolves()
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    const mockTestRequest = null as never
    const resultPromise = restockSkuApiService.restockSku(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingRestockSkuRequest is not an instance of the class`, async () => {
    const mockEsRaiseSkuRestockedEventClient = buildMockEsRaiseSkuRestockedEventClient_resolves()
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    const mockTestRequest = { ...mockIncomingRestockSkuRequest }
    const resultPromise = restockSkuApiService.restockSku(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`throws the same Error if SkuRestockedEvent.validateAndBuild throws an Error`, async () => {
    const mockEsRaiseSkuRestockedEventClient = buildMockEsRaiseSkuRestockedEventClient_resolves()
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    const mockError = new Error('mockError')
    jest.spyOn(SkuRestockedEvent, 'validateAndBuild').mockImplementationOnce(() => {
      throw mockError
    })
    await expect(restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)).rejects.toThrow(mockError)
  })

  it(`calls EsRaiseSkuRestockedEventClient.restockSku a single time`, async () => {
    const mockEsRaiseSkuRestockedEventClient = buildMockEsRaiseSkuRestockedEventClient_resolves()
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    await restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)
    expect(mockEsRaiseSkuRestockedEventClient.raiseSkuRestockedEvent).toHaveBeenCalledTimes(1)
  })

  it(`calls EsRaiseSkuRestockedEventClient.restockSku with the expected input`, async () => {
    const mockEsRaiseSkuRestockedEventClient = buildMockEsRaiseSkuRestockedEventClient_resolves()
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    await restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)
    const expectedSkuRestockedEventInput: SkuRestockedEventInput = { ...mockIncomingRestockSkuRequest }
    const expectedSkuRestockedEvent = SkuRestockedEvent.validateAndBuild(expectedSkuRestockedEventInput)
    expect(mockEsRaiseSkuRestockedEventClient.raiseSkuRestockedEvent).toHaveBeenCalledWith(expectedSkuRestockedEvent)
  })

  it(`throws a the same Error if EsRaiseSkuRestockedEventClient.restockSku throws an
      unwrapped Error`, async () => {
    const mockError = new Error('mockError')
    const mockEsRaiseSkuRestockedEventClient = buildMockEsRaiseSkuRestockedEventClient_throws(mockError)
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    await expect(restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)).rejects.toThrow(mockError)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns a RestockSkuApiServiceOutput with the expected sku if
      EsRaiseSkuRestockedEventClient.restockSku throws DuplicateEventRaisedError`, async () => {
    const mockError = DuplicateEventRaisedError.from()
    const mockEsRaiseSkuRestockedEventClient = buildMockEsRaiseSkuRestockedEventClient_throws(mockError)
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    const result = await restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)
    const expectedResult: RestockSkuApiServiceOutput = {
      sku: mockIncomingRestockSkuRequest.sku,
      units: mockIncomingRestockSkuRequest.units,
      lotId: mockIncomingRestockSkuRequest.lotId,
    }
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns a RestockSkuApiServiceOutput if the execution path is successful`, async () => {
    const mockEsRaiseSkuRestockedEventClient = buildMockEsRaiseSkuRestockedEventClient_resolves()
    const restockSkuApiService = new RestockSkuApiService(mockEsRaiseSkuRestockedEventClient)
    const result = await restockSkuApiService.restockSku(mockIncomingRestockSkuRequest)
    const expectedResult: RestockSkuApiServiceOutput = {
      sku: mockIncomingRestockSkuRequest.sku,
      units: mockIncomingRestockSkuRequest.units,
      lotId: mockIncomingRestockSkuRequest.lotId,
    }
    expect(result).toStrictEqual(expectedResult)
  })
})
