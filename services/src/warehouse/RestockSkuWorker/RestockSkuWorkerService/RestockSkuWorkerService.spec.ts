import { marshall } from '@aws-sdk/util-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IDbRestockSkuClient } from '../DbRestockSkuClient/DbRestockSkuClient'
import { IncomingSkuRestockedEvent } from '../model/IncomingSkuRestockedEvent'
import { RestockSkuCommand } from '../model/RestockSkuCommand'
import { RestockSkuWorkerService } from './RestockSkuWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

// COMBAK: Figure a simpler way to build/wrap/unwrap these EventBrideEvents (maybe some abstraction util?)
function buildMockIncomingSkuRestockedEvent(): TypeUtilsMutable<IncomingSkuRestockedEvent> {
  const incomingOrderEventProps: IncomingSkuRestockedEvent = {
    eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
    eventData: {
      sku: 'mockSku',
      units: 2,
      lotId: 'mockLotId',
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }

  const mockClass = IncomingSkuRestockedEvent.validateAndBuild({
    'detail-type': 'mockDetailType',
    id: 'mockId',
    account: 'mockAccount',
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
        NewImage: marshall(incomingOrderEventProps),
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

//
// Mock Clients
//
function buildMockDbRestockSkuClient_resolves(): IDbRestockSkuClient {
  return { restockSku: jest.fn() }
}

function buildMockDbRestockSkuClient_throws(error?: unknown): IDbRestockSkuClient {
  return { restockSku: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Warehouse Service RestockSkuWorker RestockSkuWorkerService tests`, () => {
  //
  // Test IncomingSkuRestockedEvent edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if IncomingSkuRestockedEvent is undefined`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_throws()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const resultPromise = restockSkuWorkerService.restockSku(undefined)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic
  //
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

  it(`throws the same Error if DbRestockSkuClient.restockSku throws a native Error`, async () => {
    const mockError = new Error('mockError')
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_throws(mockError)
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    await expect(restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)).rejects.toThrow(mockError)
  })

  //
  // Test expected results
  //
  it(`returns a void if all components succeed`, async () => {
    const mockDbRestockSkuClient = buildMockDbRestockSkuClient_resolves()
    const restockSkuWorkerService = new RestockSkuWorkerService(mockDbRestockSkuClient)
    const serviceOutput = await restockSkuWorkerService.restockSku(mockIncomingSkuRestockedEvent)
    expect(serviceOutput).not.toBeDefined()
  })
})
