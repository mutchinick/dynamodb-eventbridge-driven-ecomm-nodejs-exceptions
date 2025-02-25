import { InvalidArgumentsError, DuplicateEventRaisedError, UnrecognizedError } from '../../errors/AppError'
import { IEsRaiseSkuRestockedEventClient } from '../EsRaiseSkuRestockedEventClient/EsRaiseSkuRestockedEventClient'
import { IncomingRestockSkuRequest as IncomingRestockSkuRequestInput } from '../model/IncomingRestockSkuRequest'
import { SkuRestockedEvent } from '../model/SkuRestockedEvent'
import { RestockSkuApiService, ServiceOutput } from './RestockSkuApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockValidIncomingRestockSkuRequestInput: IncomingRestockSkuRequestInput = {
  sku: 'mockSku',
  units: 2,
  lotId: 'mockLotId',
}

const expectedSkuRestockedEvent = SkuRestockedEvent.validateAndBuild(mockValidIncomingRestockSkuRequestInput)

const expectedValidOutput: ServiceOutput = {
  ...mockValidIncomingRestockSkuRequestInput,
}

function buildMockDdbRestockSkuEventClient_raiseEvent_resolves(): IEsRaiseSkuRestockedEventClient {
  return { raiseSkuRestockedEvent: jest.fn() }
}

function buildMockDdbRestockSkuEventClient_raiseEvent_throws(): IEsRaiseSkuRestockedEventClient {
  const error = UnrecognizedError.from()
  return { raiseSkuRestockedEvent: jest.fn().mockRejectedValue(error) }
}

function buildMockDdbRestockSkuEventClient_raiseEvent_throws_DuplicateEventRaisedError(): IEsRaiseSkuRestockedEventClient {
  const error = DuplicateEventRaisedError.from()
  return { raiseSkuRestockedEvent: jest.fn().mockRejectedValue(error) }
}

describe(`Warehouse Service RestockSkuApi RestockSkuApiService tests`, () => {
  //
  // Test IncomingRestockSkuRequestInput edge cases
  //
  it(`does not throw if the input RestockSkuApiServiceInput is valid`, async () => {
    const mockDdbRestockSkuEventClient = buildMockDdbRestockSkuEventClient_raiseEvent_resolves()
    const restockSkuApiService = new RestockSkuApiService(mockDdbRestockSkuEventClient)
    await expect(restockSkuApiService.restockSku(mockValidIncomingRestockSkuRequestInput)).resolves.not.toThrow()
  })

  it(`throws an InvalidArgumentsError if the input RestockSkuApiServiceInput is undefined`, async () => {
    const mockDdbRestockSkuEventClient = buildMockDdbRestockSkuEventClient_raiseEvent_resolves()
    const restockSkuApiService = new RestockSkuApiService(mockDdbRestockSkuEventClient)
    await expect(restockSkuApiService.restockSku(undefined)).rejects.toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input RestockSkuApiServiceInput is null`, async () => {
    const mockDdbRestockSkuEventClient = buildMockDdbRestockSkuEventClient_raiseEvent_resolves()
    const restockSkuApiService = new RestockSkuApiService(mockDdbRestockSkuEventClient)
    await expect(restockSkuApiService.restockSku(null)).rejects.toThrow(InvalidArgumentsError)
  })

  //
  // Test internal logic
  //
  it(`calls DdbRestockSkuEventClient.restockSku a single time`, async () => {
    const mockDdbRestockSkuEventClient = buildMockDdbRestockSkuEventClient_raiseEvent_resolves()
    const restockSkuApiService = new RestockSkuApiService(mockDdbRestockSkuEventClient)
    await restockSkuApiService.restockSku(mockValidIncomingRestockSkuRequestInput)
    expect(mockDdbRestockSkuEventClient.raiseSkuRestockedEvent).toHaveBeenCalledTimes(1)
  })

  it(`calls DdbRestockSkuEventClient.restockSku with the expected input`, async () => {
    const mockDdbRestockSkuEventClient = buildMockDdbRestockSkuEventClient_raiseEvent_resolves()
    const restockSkuApiService = new RestockSkuApiService(mockDdbRestockSkuEventClient)
    await restockSkuApiService.restockSku(mockValidIncomingRestockSkuRequestInput)
    expect(mockDdbRestockSkuEventClient.raiseSkuRestockedEvent).toHaveBeenCalledWith(expectedSkuRestockedEvent)
  })

  it(`throws an Error if DdbRestockSkuEventClient.restockSku throws`, async () => {
    const mockDdbRestockSkuEventClient = buildMockDdbRestockSkuEventClient_raiseEvent_throws()
    const restockSkuApiService = new RestockSkuApiService(mockDdbRestockSkuEventClient)
    await expect(restockSkuApiService.restockSku(mockValidIncomingRestockSkuRequestInput)).rejects.toThrow()
  })

  it(`returns a RestockSkuApiServiceOutput with the expected sku if DdbRestockSkuEventClient.restockSku 
      throws DuplicateEventRaisedError`, async () => {
    const mockDdbRestockSkuEventClient = buildMockDdbRestockSkuEventClient_raiseEvent_throws_DuplicateEventRaisedError()
    const restockSkuApiService = new RestockSkuApiService(mockDdbRestockSkuEventClient)
    const actualOutput = await restockSkuApiService.restockSku(mockValidIncomingRestockSkuRequestInput)
    expect(actualOutput).toStrictEqual(expectedValidOutput)
  })

  //
  // Test expected results
  //
  it(`returns a RestockSkuApiServiceOutput with the expected sku`, async () => {
    const mockDdbRestockSkuEventClient = buildMockDdbRestockSkuEventClient_raiseEvent_resolves()
    const restockSkuApiService = new RestockSkuApiService(mockDdbRestockSkuEventClient)
    const actualOutput = await restockSkuApiService.restockSku(mockValidIncomingRestockSkuRequestInput)
    expect(actualOutput).toStrictEqual(expectedValidOutput)
  })
})
