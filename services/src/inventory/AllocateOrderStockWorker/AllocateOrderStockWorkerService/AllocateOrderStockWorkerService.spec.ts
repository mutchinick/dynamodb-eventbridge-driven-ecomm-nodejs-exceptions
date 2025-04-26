import { marshall } from '@aws-sdk/util-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import {
  AppError,
  DepletedStockAllocationError,
  DuplicateStockAllocationError,
  InvalidArgumentsError,
} from '../../errors/AppError'
import { InventoryEventName } from '../../model/InventoryEventName'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { IDbAllocateOrderStockClient } from '../DbAllocateOrderStockClient/DbAllocateOrderStockClient'
import { IDbGetOrderAllocationClient } from '../DbGetOrderAllocationClient/DbGetOrderAllocationClient'
import { IEsRaiseOrderStockAllocatedEventClient } from '../EsRaiseOrderStockAllocatedEventClient/EsRaiseOrderStockAllocatedEventClient'
import { IEsRaiseOrderStockDepletedEventClient } from '../EsRaiseOrderStockDepletedEventClient/EsRaiseOrderStockDepletedEventClient'
import { AllocateOrderStockCommand } from '../model/AllocateOrderStockCommand'
import { GetOrderAllocationCommand } from '../model/GetOrderAllocationCommand'
import { IncomingOrderCreatedEvent } from '../model/IncomingOrderCreatedEvent'
import { OrderStockAllocatedEvent } from '../model/OrderStockAllocatedEvent'
import { OrderStockDepletedEvent } from '../model/OrderStockDepletedEvent'
import { AllocateOrderStockWorkerService } from './AllocateOrderStockWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'
const mockCreatedAt = mockDate
const mockUpdatedAt = mockDate

function buildMockIncomingOrderCreatedEvent(): TypeUtilsMutable<IncomingOrderCreatedEvent> {
  const incomingOrderEventProps: IncomingOrderCreatedEvent = {
    eventName: InventoryEventName.ORDER_CREATED_EVENT,
    eventData: {
      orderId: mockOrderId,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
    },
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
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

function buildMockGetOrderAllocationCommand(): GetOrderAllocationCommand {
  const mockClass = GetOrderAllocationCommand.validateAndBuild({
    orderId: mockOrderId,
    sku: mockSku,
  })
  return mockClass
}

const expectedGetOrderAllocationCommand = buildMockGetOrderAllocationCommand()

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
const existingOrderAllocationData: OrderAllocationData = {
  orderId: mockOrderId,
  sku: mockSku,
  units: mockUnits,
  price: mockPrice,
  userId: mockUserId,
  createdAt: mockCreatedAt,
  updatedAt: mockUpdatedAt,
  allocationStatus: 'ALLOCATED',
}

function buildMockDbGetOrderAllocationClient_resolves_OrderAllocation(): IDbGetOrderAllocationClient {
  return { getOrderAllocation: jest.fn().mockResolvedValue(existingOrderAllocationData) }
}

function buildMockDbGetOrderAllocationClient_resolves_nullItem(): IDbGetOrderAllocationClient {
  return { getOrderAllocation: jest.fn().mockResolvedValue(null) }
}

function buildMockDbGetOrderAllocationClient_throws(error?: Error): IDbGetOrderAllocationClient {
  return { getOrderAllocation: jest.fn().mockRejectedValue(error ?? new Error()) }
}

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

describe(`Inventory Service AllocateOrderStockWorker AllocateOrderStockWorkerService tests`, () => {
  // Clear all mocks before each test.
  // There is not a lot of mocking, but some for the Commands
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /*
   *
   *
   ************************************************************
   * Test when it validates the IncomingOrderCreatedEvent
   ************************************************************/
  describe(`Test when it validates the IncomingOrderCreatedEvent`, () => {
    it(`does not throw if the input IncomingOrderEvent is valid`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(
        allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent),
      ).resolves.not.toThrow()
    })

    it(`throws a non-transient InvalidArgumentsError if the input IncomingOrderEvent is
        undefined`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockTestEvent = undefined as never
      const resultPromise = allocateOrderStockWorkerService.allocateOrderStock(mockTestEvent)
      await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
      await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
    })

    it(`throws a non-transient InvalidArgumentsError if the input IncomingOrderEvent is
        null`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockTestEvent = null as never
      const resultPromise = allocateOrderStockWorkerService.allocateOrderStock(mockTestEvent)
      await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
      await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
    })

    it(`throws a non-transient InvalidArgumentsError if the input IncomingOrderEvent is
        not an instance of the class`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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
   * Test when it reads the Allocation from the database
   ************************************************************/
  describe(`Test when it reads the Allocation from the database`, () => {
    it(`throws the same Error if GetOrderAllocationCommand.validateAndBuild throws an
        Error`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(GetOrderAllocationCommand, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)).rejects.toThrow(
        mockError,
      )
    })

    it(`calls DbGetOrderAllocationClient.getOrderAllocation a single time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockDbGetOrderAllocationClient.getOrderAllocation).toHaveBeenCalledTimes(1)
    })

    it(`calls DbGetOrderAllocationClient.getOrderAllocation with the expected
        AllocateOrderCreatedCommand`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockDbGetOrderAllocationClient.getOrderAllocation).toHaveBeenCalledWith(expectedGetOrderAllocationCommand)
    })

    it(`throws the same Error if DbGetOrderAllocationClient.getOrderAllocation throws an
        Error`, async () => {
      const mockError = new Error('mockError')
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_throws(mockError)
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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
   * Test when the Allocation DOES NOT exist and it creates it and raises the Allocation event
   ************************************************************/
  describe(`Test when the Allocation DOES NOT exist and it creates it and raises the
            Allocation event`, () => {
    /*
     *
     *
     ************************************************************
     * Test when it creates the Allocation in the database
     ************************************************************/
    it(`throws the same Error if AllocateOrderStockCommand.validateAndBuild throws an
        Error`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockDbAllocateOrderStockClient.allocateOrderStock).toHaveBeenCalledTimes(1)
    })

    it(`calls DbAllocateOrderStockClient.allocateOrderStock with the expected
        AllocateOrderStockCommand`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockDbAllocateOrderStockClient.allocateOrderStock).toHaveBeenCalledWith(expectedAllocateOrderStockCommand)
    })

    it(`throws the same Error if DbAllocateOrderStockClient.allocateOrderStock throws an
        Error not accounted for`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockError = new Error('mockError')
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(mockError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)).rejects.toThrow(
        mockError,
      )
    })

    /*
     *
     *
     ************************************************************
     * Test when it raises the Allocation event
     ************************************************************/
    it(`throws the same Error if the OrderStockAllocatedEvent.validateAndBuild throws an
        Error`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent a
        single time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent with
        the expected OrderStockAllocatedEvent`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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

    it(`throws the same Error if
        EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent throws an
        Error`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockError = new Error('mockError')
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_throws(mockError)
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(
        allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent),
      ).rejects.toStrictEqual(mockError)
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected void if the execution path is successful`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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
   * Test when the Allocation DOES exist and it only raises the Allocation event
   ************************************************************/
  describe(`Test when the Allocation DOES exist and it only raises the Allocation event`, () => {
    /*
     *
     *
     ************************************************************
     * Test that it skips creating the Allocation
     ************************************************************/
    it(`does not call AllocateOrderStockCommand.validateAndBuild`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const spy = jest.spyOn(AllocateOrderStockCommand, 'validateAndBuild')
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
    })

    it(`does not call DbAllocateOrderStockClient.allocateOrderStock`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockDbAllocateOrderStockClient.allocateOrderStock).not.toHaveBeenCalled()
    })

    it(`does not throw if DbAllocateOrderStockClient.allocateOrderStock throws an Error`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(
        allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent),
      ).resolves.not.toThrow()
    })

    /*
     *
     *
     ************************************************************
     * Test when it raises the Allocation event
     ************************************************************/
    it(`throws the same Error if the OrderStockAllocatedEvent.validateAndBuild throws an
        Error`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent a
        single time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent with
        the expected OrderStockAllocatedEvent`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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

    it(`throws the same Error if
        EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent throws an
        Error`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
      const mockMessage = 'Mock message' as never
      const mockError = new Error(mockMessage) as AppError
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_throws(mockError)
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(
        allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent),
      ).rejects.toStrictEqual(mockError)
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected void if the execution path is successful`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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
   * Test when the Allocation DOES NOT exist and there is not enough stock
   ************************************************************/
  describe(`Test when the Allocation DOES NOT exist and there is not enough stock`, () => {
    /*
     *
     *
     ************************************************************
     * Test when it creates the Allocation but there is not enough stock
     ************************************************************/
    it(`throws the same Error if AllocateOrderStockCommand.validateAndBuild throws an
        Error`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const depletionError = DepletedStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(depletionError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const depletionError = DepletedStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(depletionError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockDbAllocateOrderStockClient.allocateOrderStock).toHaveBeenCalledTimes(1)
    })

    it(`calls DbAllocateOrderStockClient.allocateOrderStock with the expected
        AllocateOrderStockCommand`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const depletionError = DepletedStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(depletionError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockDbAllocateOrderStockClient.allocateOrderStock).toHaveBeenCalledWith(expectedAllocateOrderStockCommand)
    })

    it(`does not throw if DbAllocateOrderStockClient.allocateOrderStock throws a
        DepletedStockAllocationError`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const depletionError = DepletedStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(depletionError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(
        allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent),
      ).resolves.not.toThrow()
    })

    /*
     *
     *
     ************************************************************
     * Test when it raises the Allocation Depleted event
     ************************************************************/
    it(`throws the same Error if OrderStockDepletedEvent.validateAndBuild throws an
        Error`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const depletionError = DepletedStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(depletionError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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

    it(`calls EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent a single
        time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const depletionError = DepletedStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(depletionError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent the
        expected OrderStockDepletedEvent`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const depletionError = DepletedStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(depletionError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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

    it(`throws the same Error if
        EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent throws an
        Error`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const depletionError = DepletedStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(depletionError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockMessage = 'Mock message' as never
      const mockError = new Error(mockMessage) as AppError
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_throws(mockError)
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(
        allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent),
      ).rejects.toStrictEqual(mockError)
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected void if the execution path is successful`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const depletionError = DepletedStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(depletionError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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
   * Test when the Allocation DOES NOT exist WHEN READ but was created by another instance/race condition
   ************************************************************/
  describe(`Test when the Allocation DOES NOT exist WHEN READ but was created by another
            instance/race condition`, () => {
    /*
     *
     *
     ************************************************************
     * Test when it tries to create the Allocation but it already exists
     ************************************************************/
    it(`throws the same Error if AllocateOrderStockCommand.validateAndBuild throws an
        Error`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockDbAllocateOrderStockClient.allocateOrderStock).toHaveBeenCalledTimes(1)
    })

    it(`calls DbAllocateOrderStockClient.allocateOrderStock with the expected
        AllocateOrderStockCommand`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockDbAllocateOrderStockClient.allocateOrderStock).toHaveBeenCalledWith(expectedAllocateOrderStockCommand)
    })

    it(`does not throw if DbAllocateOrderStockClient.allocateOrderStock throws a
        DuplicateStockAllocationError`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(
        allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent),
      ).resolves.not.toThrow()
    })

    /*
     *
     *
     ************************************************************
     * Test when it raises the Allocation event
     ************************************************************/
    it(`throws the same Error if the OrderStockAllocatedEvent.validateAndBuild throws an
        Error`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent a
        single time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(mockEsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent with
        the expected OrderStockAllocatedEvent`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
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

    it(`throws the same Error if
        EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent throws an
        Error`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
      const mockMessage = 'Mock message' as never
      const mockError = new Error(mockMessage) as AppError
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_throws(mockError)
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(
        allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent),
      ).rejects.toStrictEqual(mockError)
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected void if the execution path is successful`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const duplicationError = DuplicateStockAllocationError.from()
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(duplicationError)
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const result = await allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)
      expect(result).toBeUndefined()
    })
  })
})
