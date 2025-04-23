import { marshall } from '@aws-sdk/util-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { InventoryEventName } from '../../model/InventoryEventName'
import { IDbRestockSkuClient } from '../DbRestockSkuClient/DbRestockSkuClient'
import { IncomingSkuRestockedEvent } from '../model/IncomingSkuRestockedEvent'
import { RestockSkuCommand } from '../model/RestockSkuCommand'
import { RestockSkuWorkerService } from './RestockSkuWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockSku = 'mockSku'
const mockUnits = 2
const mockLotId = 'mockLotId'

function buildMockIncomingSkuRestockedEvent(): TypeUtilsMutable<IncomingSkuRestockedEvent> {
  const incomingOrderEventProps: IncomingSkuRestockedEvent = {
    eventName: InventoryEventName.SKU_RESTOCKED_EVENT,
    eventData: {
      sku: mockSku,
      units: mockUnits,
      lotId: mockLotId,
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }

  // COMBAK: Work a simpler way to build/wrap/unwrap these EventBrideEvents (maybe some abstraction util?)
  const mockClass = IncomingSkuRestockedEvent.validateAndBuild({
    'detail-type': 'mockDetailType',
    account: 'mockAccount',
    id: 'mockId',
    region: 'mockRegion',
    resources: [],
    source: 'mockSource',
    time: 'mockTime',
    version: 'mockVersion',
    detail: {
      awsRegion: 'mockAwsRegion',
      eventID: 'mockEventId',
      eventName: 'INSERT',
      eventSource: 'aws:dynamodb',
      eventVersion: 'mockEventVersion',
      dynamodb: {
        NewImage: marshall(incomingOrderEventProps, { removeUndefinedValues: true }),
      },
    },
  })
  return mockClass
}

const mockIncomingSkuRestockedEvent = buildMockIncomingSkuRestockedEvent()

function buildExpectedRestockSkuCommand(): TypeUtilsMutable<RestockSkuCommand> {
  const mockClass = RestockSkuCommand.validateAndBuild({
    incomingSkuRestockedEvent: {
      eventName: mockIncomingSkuRestockedEvent.eventName,
      eventData: {
        sku: mockIncomingSkuRestockedEvent.eventData.sku,
        units: mockIncomingSkuRestockedEvent.eventData.units,
        lotId: mockIncomingSkuRestockedEvent.eventData.lotId,
      },
      createdAt: mockIncomingSkuRestockedEvent.createdAt,
      updatedAt: mockIncomingSkuRestockedEvent.updatedAt,
    },
  })
  return mockClass
}

const expectedRestockSkuCommand = buildExpectedRestockSkuCommand()

/*
 *
 *
 ************************************************************
 * Mock Clients
 ************************************************************/
function buildMockDbRestockSkuClient_resolves(): IDbRestockSkuClient {
  return { restockSku: jest.fn() }
}

function buildMockDbRestockSkuClient_throws(error?: unknown): IDbRestockSkuClient {
  return { restockSku: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Inventory Service RestockSkuWorker RestockSkuWorkerService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingSkuRestockedEvent edge cases
   ************************************************************/
  it(`does not throw if the input IncomingSkuRestockedEvent is valid`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_resolves()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    await expect(restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSkuRestockedEvent is undefined`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_resolves()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const mockTestEvent = undefined as never
    const resultPromise = restockSkuWorkerService.restockSku(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSkuRestockedEvent is null`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_resolves()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const mockTestEvent = null as never
    const resultPromise = restockSkuWorkerService.restockSku(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSkuRestockedEvent is not an instance of the class`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_resolves()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const mockTestEvent = { ...mockIncomingSkuRestockedEvent }
    const resultPromise = restockSkuWorkerService.restockSku(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`throws the same Error if RestockSkuCommand.validateAndBuild throws an Error`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_resolves()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const mockError = new Error('mockError')
    jest.spyOn(RestockSkuCommand, 'validateAndBuild').mockImplementationOnce(() => {
      throw mockError
    })
    await expect(restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)).rejects.toThrow(mockError)
  })

  it(`calls DbRestockSkuClient.restockSku a single time`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_resolves()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    expect(mockDbRestockSkuClient.restockSku).toHaveBeenCalledTimes(1)
  })

  it(`calls DbRestockSkuClient.restockSku with the expected RestockSkuCommand`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_resolves()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    expect(mockDbRestockSkuClient.restockSku).toHaveBeenCalledWith(expectedRestockSkuCommand)
  })

  it(`throws the same Error if DbRestockSkuClient.restockSku throws an Error`, async () => {
    const mockError = new Error('mockError')
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_throws(mockError)
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    await expect(restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)).rejects.toThrow(mockError)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected void if the execution path is successful`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_resolves()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const serviceOutput = await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    expect(serviceOutput).not.toBeDefined()
  })
})
