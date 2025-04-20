import { marshall } from '@aws-sdk/util-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import {
  AppError,
  DepletedStockAllocationError,
  DuplicateStockAllocationError,
  InvalidArgumentsError,
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

  // COMBAK: Work a simpler way to build/wrap/unwrap these EventBrideEvents (maybe some abstraction util?)
  const mockClass = IncomingOrderCreatedEvent.validateAndBuild({
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

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
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
  /*
   *
   *
   ************************************************************
   * Test when it validates the IncomingOrderCreatedEvent
   ************************************************************/
  describe(`Test when it validates the IncomingOrderCreatedEvent`, () => {
    it(`does not throw if the input IncomingOrderEvent is valid`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(
        allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent),
      ).resolves.not.toThrow()
    })

    it(`throws a non-transient InvalidArgumentsError if the input IncomingOrderEvent is undefined`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockTestEvent = undefined as never
      const resultPromise = allocateOrderStockWorkerService.allocateOrderStock(mockTestEvent)
      await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
      await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
    })

    it(`throws a non-transient InvalidArgumentsError if the input IncomingOrderEvent is null`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockTestEvent = null as never
      const resultPromise = allocateOrderStockWorkerService.allocateOrderStock(mockTestEvent)
      await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
      await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
    })

    it(`throws a non-transient InvalidArgumentsError if the input IncomingOrderEvent is not an instance of the class`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockTestEvent = { ...mockIncomingOrderCreatedEvent }
      const resultPromise = allocateOrderStockWorkerService.allocateOrderStock(mockTestEvent)
      await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
      await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when it creates the Allocation
   ************************************************************/
  describe(`Test when it creates the Allocation`, () => {
    it(`throws the same Error if AllocateOrderStockCommand.validateAndBuild throws an Error`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(AllocateOrderStockCommand, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)).rejects.toThrow(
        mockError,
      )
    })

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

    it(`throws the same Error if DbAllocateOrderStockClient.allocateOrderStock throws an Error not accounted for`, async () => {
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

  /*
   *
   *
   ************************************************************
   * Test when the Allocation DID NOT exist and is created
   ************************************************************/
  describe(`Test when the Allocation DID NOT exist and is created`, () => {
    it(`throws the same Error if the OrderStockAllocatedEvent.validateAndBuild throws an Error`, async () => {
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
      const { eventData } = mockIncomingOrderCreatedEvent
      const expectedOrderStockAllocatedEvent = OrderStockAllocatedEvent.validateAndBuild(eventData)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledWith(
        expectedOrderStockAllocatedEvent,
      )
    })

    it(`throws the same Error if EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent throws an Error`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockError = new Error('mockError')
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

    it(`returns the expected void if the execution path is successful`, async () => {
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

  /*
   *
   *
   ************************************************************
   * Test when the Allocation DID already exist
   ************************************************************/
  describe(`Test when the Allocation DID already exist`, () => {
    it(`does not throw if DbAllocateOrderStockClient.allocateOrderStock throws a DuplicateStockAllocationError`, async () => {
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(
        allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent),
      ).resolves.not.toThrow()
    })

    it(`throws the same Error if the OrderStockAllocatedEvent.validateAndBuild throws an Error`, async () => {
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
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
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
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
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      const { eventData } = mockIncomingOrderCreatedEvent
      const expectedOrderStockAllocatedEvent = OrderStockAllocatedEvent.validateAndBuild(eventData)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledWith(
        expectedOrderStockAllocatedEvent,
      )
    })

    it(`throws the same Error if EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent throws an Error`, async () => {
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
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

    it(`returns the expected void if the execution path is successful`, async () => {
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
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

  /*
   *
   *
   ************************************************************
   * Test when the stock for the Allocation is not enough or depleted
   ************************************************************/
  describe(`Test when the stock for the Allocation is not enough or depleted`, () => {
    it(`does not throw if DbAllocateOrderStockClient.allocateOrderStock throws a DepletedStockAllocationError`, async () => {
      const depletionError = DepletedStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(depletionError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(
        allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent),
      ).resolves.not.toThrow()
    })

    it(`throws the same Error if OrderStockDepletedEvent.validateAndBuild throws an Error`, async () => {
      const depletionError = DepletedStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(depletionError)
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
      const depletionError = DepletedStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(depletionError)
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
      const depletionError = DepletedStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(depletionError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      const { eventData } = mockIncomingOrderCreatedEvent
      const expectedOrderStockDepletedEvent = OrderStockDepletedEvent.validateAndBuild(eventData)
      expect(mockEsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent).toHaveBeenCalledWith(
        expectedOrderStockDepletedEvent,
      )
    })

    it(`throws the same Error if EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent throws an Error`, async () => {
      const depletionError = DepletedStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(depletionError)
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

    it(`returns the expected void if the execution path is successful`, async () => {
      const depletionError = DepletedStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(depletionError)
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
})
