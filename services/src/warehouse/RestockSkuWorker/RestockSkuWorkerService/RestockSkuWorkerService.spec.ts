import { InvalidArgumentsError } from '../../errors/AppError'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IDbRestockSkuClient } from '../DbRestockSkuClient/DbRestockSkuClient'
import { IncomingSkuRestockedEvent } from '../model/IncomingSkuRestockedEvent'
import { RestockSkuCommand, RestockSkuCommandInput } from '../model/RestockSkuCommand'
import { RestockSkuWorkerService } from './RestockSkuWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

const mockIncomingSkuRestockedEvent: IncomingSkuRestockedEvent = {
  eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
  eventData: {
    sku: 'mockSku',
    units: 3,
    lotId: 'mockLotId',
  },
  createdAt: mockDate,
  updatedAt: mockDate,
}

const mockValidRestockSkuCommandInput: RestockSkuCommandInput = {
  incomingSkuRestockedEvent: mockIncomingSkuRestockedEvent,
}

const expectedRestockSkuCommand = RestockSkuCommand.validateAndBuild(mockValidRestockSkuCommandInput)

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
