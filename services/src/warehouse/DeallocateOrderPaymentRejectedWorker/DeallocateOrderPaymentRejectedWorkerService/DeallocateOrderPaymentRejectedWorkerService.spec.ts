import { marshall } from '@aws-sdk/util-dynamodb'
import { InvalidArgumentsError } from '../../errors/AppError'
import { AllocateOrderStockData } from '../../model/AllocateOrderStockData'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IDbDeallocateOrderPaymentRejectedClient } from '../DbDeallocateOrderPaymentRejectedClient/DbDeallocateOrderPaymentRejectedClient'
import { IDbGetOrderAllocationClient } from '../DbGetOrderAllocationClient/DbGetOrderAllocationClient'
import { DeallocateOrderPaymentRejectedCommand } from '../model/DeallocateOrderPaymentRejectedCommand'
import { GetOrderAllocationCommand } from '../model/GetOrderAllocationCommand'
import { IncomingOrderPaymentRejectedEvent } from '../model/IncomingOrderPaymentRejectedEvent'
import { DeallocateOrderPaymentRejectedWorkerService } from './DeallocateOrderPaymentRejectedWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.55
const mockUserId = 'mockUserId'

function buildMockExistingOrderAllocationData(): AllocateOrderStockData {
  const mockClass: AllocateOrderStockData = {
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
    createdAt: mockDate,
    updatedAt: mockDate,
    allocationStatus: 'ALLOCATED',
  }
  return mockClass
}

const mockExistingOrderAllocationData = buildMockExistingOrderAllocationData()

function buildMockGetOrderAllocationCommand(): GetOrderAllocationCommand {
  const mockClass = GetOrderAllocationCommand.validateAndBuild({
    orderId: mockOrderId,
    sku: mockSku,
  })
  return mockClass
}

const expectedGetOrderAllocationCommand = buildMockGetOrderAllocationCommand()

function buildMockIncomingOrderPaymentRejectedEvent(): IncomingOrderPaymentRejectedEvent {
  const incomingOrderEventProps: IncomingOrderPaymentRejectedEvent = {
    eventName: WarehouseEventName.ORDER_PAYMENT_REJECTED_EVENT,
    eventData: {
      orderId: mockOrderId,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }

  // COMBAK: Figure a simpler way to build/wrap/unwrap these EventBrideEvents (maybe some abstraction util?)
  const mockClass = IncomingOrderPaymentRejectedEvent.validateAndBuild({
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

const mockIncomingOrderPaymentRejectedEvent = buildMockIncomingOrderPaymentRejectedEvent()

function buildExpectedDeallocateOrderPaymentRejectedCommand(): DeallocateOrderPaymentRejectedCommand {
  const mockClass = DeallocateOrderPaymentRejectedCommand.validateAndBuild({
    existingOrderAllocationData: mockExistingOrderAllocationData,
    incomingOrderPaymentRejectedEvent: mockIncomingOrderPaymentRejectedEvent,
  })
  return mockClass
}

const expectedDeallocateOrderPaymentRejectedCommand = buildExpectedDeallocateOrderPaymentRejectedCommand()

//
// Mock clients
//
function buildMockDbGetOrderAllocationClient_resolves(): IDbGetOrderAllocationClient {
  return { getOrderAllocation: jest.fn().mockResolvedValue(mockExistingOrderAllocationData) }
}

function buildMockDbGetOrderAllocationClient_throws(error?: Error): IDbGetOrderAllocationClient {
  return { getOrderAllocation: jest.fn().mockRejectedValue(error ?? new Error()) }
}

function buildMockDbDeallocateOrderPaymentRejectedClient_resolves(): IDbDeallocateOrderPaymentRejectedClient {
  return { deallocateOrderStock: jest.fn() }
}

function buildMockDbDeallocateOrderPaymentRejectedClient_throws(
  error?: Error,
): IDbDeallocateOrderPaymentRejectedClient {
  return { deallocateOrderStock: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Warehouse Service DeallocateOrderPaymentRejectedWorker DeallocateOrderPaymentRejectedWorkerService tests`, () => {
  //
  // Test IncomingOrderPaymentRejectedEvent edge cases
  //
  it(`does not throw if IncomingOrderPaymentRejectedEvent is valid`, async () => {
    const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_resolves()
    const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves()
    const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
      mockDbGetOrderAllocationClient,
      mockDbDeallocateOrderPaymentRejectedClient,
    )
    await expect(
      deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(mockIncomingOrderPaymentRejectedEvent),
    ).resolves.not.toThrow(InvalidArgumentsError)
  })

  it(`throws a non-transient InvalidArgumentsError if IncomingOrderPaymentRejectedEvent is undefined`, async () => {
    const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_resolves()
    const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves()
    const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
      mockDbGetOrderAllocationClient,
      mockDbDeallocateOrderPaymentRejectedClient,
    )
    const resultPromise = deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(undefined)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic DbGetOrderAllocationClient.getOrderAllocation
  //
  it(`calls DbGetOrderAllocationClient.getOrderAllocation a single time`, async () => {
    const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_resolves()
    const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves()
    const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
      mockDbGetOrderAllocationClient,
      mockDbDeallocateOrderPaymentRejectedClient,
    )
    await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(mockIncomingOrderPaymentRejectedEvent)
    expect(mockDbGetOrderAllocationClient.getOrderAllocation).toHaveBeenCalledTimes(1)
  })

  it(`calls DbGetOrderAllocationClient.getOrderAllocation
      with the expected DeallocateOrderPaymentRejectedCommand`, async () => {
    const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_resolves()
    const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves()
    const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
      mockDbGetOrderAllocationClient,
      mockDbDeallocateOrderPaymentRejectedClient,
    )
    await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(mockIncomingOrderPaymentRejectedEvent)
    expect(mockDbGetOrderAllocationClient.getOrderAllocation).toHaveBeenCalledWith(expectedGetOrderAllocationCommand)
  })

  it(`throws the same Error if DbGetOrderAllocationClient.getOrderAllocation
      throws an unwrapped Error`, async () => {
    const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_resolves()
    const mockError = new Error('mockError')
    const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_throws(mockError)
    const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
      mockDbGetOrderAllocationClient,
      mockDbDeallocateOrderPaymentRejectedClient,
    )
    await expect(
      deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(mockIncomingOrderPaymentRejectedEvent),
    ).rejects.toThrow(mockError)
  })

  //
  // Test internal logic DbDeallocateOrderPaymentRejectedClient.deallocateOrderStock
  //
  it(`calls DbDeallocateOrderPaymentRejectedClient.deallocateOrderStock a single time`, async () => {
    const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_resolves()
    const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves()
    const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
      mockDbGetOrderAllocationClient,
      mockDbDeallocateOrderPaymentRejectedClient,
    )
    await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(mockIncomingOrderPaymentRejectedEvent)
    expect(mockDbDeallocateOrderPaymentRejectedClient.deallocateOrderStock).toHaveBeenCalledTimes(1)
  })

  it(`calls DbDeallocateOrderPaymentRejectedClient.deallocateOrderStock
      with the expected DeallocateOrderPaymentRejectedCommand`, async () => {
    const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_resolves()
    const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves()
    const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
      mockDbGetOrderAllocationClient,
      mockDbDeallocateOrderPaymentRejectedClient,
    )
    await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(mockIncomingOrderPaymentRejectedEvent)
    expect(mockDbDeallocateOrderPaymentRejectedClient.deallocateOrderStock).toHaveBeenCalledWith(
      expectedDeallocateOrderPaymentRejectedCommand,
    )
  })

  it(`throws the same Error if DbDeallocateOrderPaymentRejectedClient.deallocateOrderStock
      throws an unwrapped Error`, async () => {
    const mockError = new Error('mockError')
    const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_throws(mockError)
    const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves()
    const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
      mockDbGetOrderAllocationClient,
      mockDbDeallocateOrderPaymentRejectedClient,
    )
    await expect(
      deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(mockIncomingOrderPaymentRejectedEvent),
    ).rejects.toThrow(mockError)
  })

  //
  // Test expected results
  //
  it(`returns void with the expected data`, async () => {
    const mockDbDeallocateOrderPaymentRejectedClient = buildMockDbDeallocateOrderPaymentRejectedClient_resolves()
    const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves()
    const deallocateOrderPaymentRejectedWorkerService = new DeallocateOrderPaymentRejectedWorkerService(
      mockDbGetOrderAllocationClient,
      mockDbDeallocateOrderPaymentRejectedClient,
    )
    const result = await deallocateOrderPaymentRejectedWorkerService.deallocateOrderStock(
      mockIncomingOrderPaymentRejectedEvent,
    )
    expect(result).toBeUndefined()
  })
})
