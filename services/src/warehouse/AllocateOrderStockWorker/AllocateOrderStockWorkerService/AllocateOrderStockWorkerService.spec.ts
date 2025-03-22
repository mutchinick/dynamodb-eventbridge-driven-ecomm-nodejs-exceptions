import { marshall } from '@aws-sdk/util-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import {
  AppError,
  DepletedStockAllocationError,
  DuplicateStockAllocationError,
  InvalidArgumentsError,
  UnrecognizedError,
} from '../../errors/AppError'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IDbAllocateOrderStockClient } from '../DbAllocateOrderStockClient/DbAllocateOrderStockClient'
import { IEsRaiseOrderStockAllocatedEventClient } from '../EsRaiseOrderStockAllocatedEventClient/EsRaiseOrderStockAllocatedEventClient'
import { IEsRaiseOrderStockDepletedEventClient } from '../EsRaiseOrderStockDepletedEventClient/EsRaiseOrderStockDepletedEventClient'
import { AllocateOrderStockCommand } from '../model/AllocateOrderStockCommand'
import { IncomingOrderCreatedEvent } from '../model/IncomingOrderCreatedEvent'
import { OrderStockAllocatedEvent } from '../model/OrderStockAllocatedEvent'
import { OrderStockDepletedEvent } from '../model/OrderStockDepletedEvent'
import { AllocateOrderStockWorkerService } from './AllocateOrderStockWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

// COMBAK: Figure a simpler way to build/wrap/unwrap these EventBrideEvents (maybe some abstraction util?)
function buildMockIncomingOrderCreatedEvent(): TypeUtilsMutable<IncomingOrderCreatedEvent> {
  const incomingOrderEventProps: IncomingOrderCreatedEvent = {
    eventName: WarehouseEventName.ORDER_CREATED_EVENT,
    eventData: {
      orderId: 'mockOrderId',
      sku: 'mockSku',
      units: 2,
      price: 10.32,
      userId: 'mockUserId',
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }

  const mockClass = IncomingOrderCreatedEvent.validateAndBuild({
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

const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent()

function buildExpectedAllocateOrderStockCommand(): TypeUtilsMutable<AllocateOrderStockCommand> {
  const mockClass = AllocateOrderStockCommand.validateAndBuild({
    incomingOrderCreatedEvent: {
      eventName: mockIncomingOrderCreatedEvent.eventName,
      eventData: {
        orderId: mockIncomingOrderCreatedEvent.eventData.orderId,
        sku: mockIncomingOrderCreatedEvent.eventData.sku,
        units: mockIncomingOrderCreatedEvent.eventData.units,
        price: mockIncomingOrderCreatedEvent.eventData.price,
        userId: mockIncomingOrderCreatedEvent.eventData.userId,
      },
      createdAt: mockIncomingOrderCreatedEvent.createdAt,
      updatedAt: mockIncomingOrderCreatedEvent.updatedAt,
    },
  })
  return mockClass
}

const expectedAllocateOrderStockCommand = buildExpectedAllocateOrderStockCommand()

//
// Mock clients
//
function buildMockDbAllocateOrderStockClient_resolves(): IDbAllocateOrderStockClient {
  return { allocateOrderStock: jest.fn() }
}

function buildMockDbAllocateOrderStockClient_throws(error?: Error): IDbAllocateOrderStockClient {
  return { allocateOrderStock: jest.fn().mockRejectedValue(error ?? new Error()) }
}

function buildMockEsRaiseOrderStockAllocatedEventClient_resolves(): IEsRaiseOrderStockAllocatedEventClient {
  return { raiseOrderStockAllocatedEvent: jest.fn() }
}

function buildMockEsRaiseOrderStockAllocatedEventClient_throws(error?: Error): IEsRaiseOrderStockAllocatedEventClient {
  return { raiseOrderStockAllocatedEvent: jest.fn().mockRejectedValue(error ?? new Error()) }
}

function buildMockEsRaiseOrderStockDepletedEventClient_resolves(): IEsRaiseOrderStockDepletedEventClient {
  return { raiseOrderStockDepletedEvent: jest.fn() }
}

function buildMockEsRaiseOrderStockDepletedEventClient_throws(error?: Error): IEsRaiseOrderStockDepletedEventClient {
  return { raiseOrderStockDepletedEvent: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Warehouse Service AllocateOrderStockWorker AllocateOrderStockWorkerService tests`, () => {
  //
  // Test IncomingOrderCreatedEvent edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if IncomingOrderCreatedEvent is undefined`, async () => {
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
    const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
    const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
      mockDbAllocateOrderStockClient,
      mockEsRaiseOrderStockAllocatedEventClient,
      mockEsRaiseOrderStockDepletedEventClient,
    )
    const resultPromise = allocateOrderStockWorkerService.allocateOrderStock(undefined)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic allocateOrderStock
  //
  it(`calls DbAllocateOrderStockClient.allocateOrderStock a single time`, async () => {
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
    const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
    const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
      mockDbAllocateOrderStockClient,
      mockEsRaiseOrderStockAllocatedEventClient,
      mockEsRaiseOrderStockDepletedEventClient,
    )
    await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
    expect(mockDbAllocateOrderStockClient.allocateOrderStock).toHaveBeenCalledTimes(1)
  })

  it(`calls DbAllocateOrderStockClient.allocateOrderStock with the expected AllocateOrderStockCommand`, async () => {
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
    const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
    const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
      mockDbAllocateOrderStockClient,
      mockEsRaiseOrderStockAllocatedEventClient,
      mockEsRaiseOrderStockDepletedEventClient,
    )
    await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
    expect(mockDbAllocateOrderStockClient.allocateOrderStock).toHaveBeenCalledWith(expectedAllocateOrderStockCommand)
  })

  it(`throws the same Error if DbAllocateOrderStockClient.allocateOrderStock throws a native Error`, async () => {
    const mockError = new Error('mockError')
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(mockError)
    const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
    const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
      mockDbAllocateOrderStockClient,
      mockEsRaiseOrderStockAllocatedEventClient,
      mockEsRaiseOrderStockDepletedEventClient,
    )
    await expect(allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)).rejects.toThrow(
      mockError,
    )
  })

  //
  // When DbAllocateOrderStockClient.allocateOrderStock returns
  //
  describe(`when DbAllocateOrderStockClient.allocateOrderStock returns`, () => {
    const { eventData } = mockIncomingOrderCreatedEvent
    const orderStockAllocatedEvent = OrderStockAllocatedEvent.validateAndBuild(eventData)

    it(`throws the same Error if the OrderStockAllocatedEvent.validateAndBuild throws`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(OrderStockAllocatedEvent, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)).rejects.toThrow(
        mockError,
      )
    })

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent a single time`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent with the expected OrderStockAllocatedEvent`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledWith(
        orderStockAllocatedEvent,
      )
    })

    it(`returns if EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent returns`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(result).toBeUndefined()
    })

    it(`throws the same Error if EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent throws a native Error`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockMessage = 'Mock message' as never
      const mockError = new Error(mockMessage) as AppError
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_throws(mockError)
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(
        allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent),
      ).rejects.toStrictEqual(mockError)
    })
  })

  //
  // When DbAllocateOrderStockClient.allocateOrderStock throws DuplicateStockAllocationError
  //
  describe(`when DbAllocateOrderStockClient.allocateOrderStock throws DuplicateStockAllocationError`, () => {
    const { eventData } = mockIncomingOrderCreatedEvent
    const orderStockAllocatedEvent = OrderStockAllocatedEvent.validateAndBuild(eventData)

    it(`throws the same Error if the OrderStockAllocatedEvent.validateAndBuild throws`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(
        DuplicateStockAllocationError.from(),
      )
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(OrderStockAllocatedEvent, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)).rejects.toThrow(
        mockError,
      )
    })

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent a single time`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(
        DuplicateStockAllocationError.from(),
      )
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent 
        with the expected OrderStockAllocatedEvent`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(
        DuplicateStockAllocationError.from(),
      )
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledWith(
        orderStockAllocatedEvent,
      )
    })

    it(`returns if EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent returns`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(
        DuplicateStockAllocationError.from(),
      )
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(result).toBeUndefined()
    })

    it(`throws the same Error if EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent throws a native Error`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(
        DuplicateStockAllocationError.from(),
      )
      const mockMessage = 'Mock message' as never
      const mockError = new Error(mockMessage) as AppError
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_throws(mockError)
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(
        allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent),
      ).rejects.toStrictEqual(mockError)
    })
  })

  //
  // When DbAllocateOrderStockClient.allocateOrderStock throws DepletedStockAllocationError
  //
  describe(`when DbAllocateOrderStockClient.allocateOrderStock throws DepletedStockAllocationError`, () => {
    const { eventData } = mockIncomingOrderCreatedEvent
    const orderStockDepletedEvent = OrderStockDepletedEvent.validateAndBuild(eventData)

    it(`throws the same Error if OrderStockDepletedEvent.validateAndBuild throws`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(
        DepletedStockAllocationError.from(),
      )
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(OrderStockDepletedEvent, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)).rejects.toThrow(
        mockError,
      )
    })

    it(`calls EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent a single time`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(
        DepletedStockAllocationError.from(),
      )
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent the expected OrderStockDepletedEvent`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(
        DepletedStockAllocationError.from(),
      )
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent).toHaveBeenCalledWith(
        orderStockDepletedEvent,
      )
    })

    it(`returns if EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent returns`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(
        DepletedStockAllocationError.from(),
      )
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(result).toBeUndefined()
    })

    it(`throws the same Error if EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent throws a native Error`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(
        DepletedStockAllocationError.from(),
      )
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockMessage = 'Mock message' as never
      const mockError = new Error(mockMessage) as AppError
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_throws(mockError)
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(
        allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent),
      ).rejects.toStrictEqual(mockError)
    })
  })

  //
  // When DbAllocateOrderStockClient.allocateOrderStock throws a native Error, InvalidArgumentsError or UnrecognizedError
  //
  describe(`when DbAllocateOrderStockClient.allocateOrderStock throws a native Error, InvalidArgumentsError or UnrecognizedError`, () => {
    it(`throws the same Error if DbAllocateOrderStockClient.allocateOrderStock throws an InvalidArgumentsError`, async () => {
      const mockError = InvalidArgumentsError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(mockError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)).rejects.toThrow(
        mockError,
      )
    })

    it(`throws the same Error if DbAllocateOrderStockClient.allocateOrderStock throws an UnrecognizedError`, async () => {
      const mockError = UnrecognizedError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(mockError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)).rejects.toThrow(
        mockError,
      )
    })

    it(`throws the same Error if DbAllocateOrderStockClient.allocateOrderStock throws a native Error`, async () => {
      const mockError = new Error('mockError')
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(mockError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)).rejects.toThrow(
        mockError,
      )
    })
  })

  //
  // Test expected results
  //
  it(`returns when all components return`, async () => {
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
    const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
    const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
      mockDbAllocateOrderStockClient,
      mockEsRaiseOrderStockAllocatedEventClient,
      mockEsRaiseOrderStockDepletedEventClient,
    )
    const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
    expect(result).toBeUndefined()
  })
})
