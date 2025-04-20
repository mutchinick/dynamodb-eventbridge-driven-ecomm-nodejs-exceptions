import { marshall } from '@aws-sdk/util-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError, InvalidOperationError, UnrecognizedError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { IDbCreateOrderClient } from '../DbCreateOrderClient/DbCreateOrderClient'
import { IDbGetOrderClient } from '../DbGetOrderClient/DbGetOrderClient'
import { IDbUpdateOrderClient } from '../DbUpdateOrderClient/DbUpdateOrderClient'
import { IEsRaiseOrderCreatedEventClient } from '../EsRaiseOrderCreatedEventClient/EsRaiseOrderCreatedEventClient'
import { CreateOrderCommand, CreateOrderCommandInput } from '../model/CreateOrderCommand'
import { GetOrderCommand, GetOrderCommandInput } from '../model/GetOrderCommand'
import { IncomingOrderEvent } from '../model/IncomingOrderEvent'
import { OrderCreatedEvent, OrderCreatedEventInput } from '../model/OrderCreatedEvent'
import { UpdateOrderCommand, UpdateOrderCommandInput } from '../model/UpdateOrderCommand'
import { SyncOrderWorkerService } from './SyncOrderWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 3.98
const mockUserId = 'mockUserId'
const mockCreatedAt = mockDate
const mockUpdatedAt = mockDate

const mockOrderData: OrderData = {
  orderId: mockOrderId,
  orderStatus: OrderStatus.ORDER_CREATED_STATUS,
  sku: mockSku,
  units: mockUnits,
  price: mockPrice,
  userId: mockUserId,
  createdAt: mockCreatedAt,
  updatedAt: mockUpdatedAt,
}

// COMBAK: Work a simpler way to build/wrap/unwrap these EventBrideEvents (maybe some abstraction util?)
function buildMockIncomingOrderEvent(
  incomingOrderEventProps: IncomingOrderEvent,
): TypeUtilsMutable<IncomingOrderEvent> {
  const mockClass = IncomingOrderEvent.validateAndBuild({
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

/*
 *
 *
 ************************************************************
 * Mock Clients
 ************************************************************/
function buildMockDbGetOrderClient_resolves_OrderData(): IDbGetOrderClient {
  return { getOrder: jest.fn().mockResolvedValue(mockOrderData) }
}

function buildMockDbGetOrderClient_throws(error?: unknown): IDbGetOrderClient {
  return { getOrder: jest.fn().mockRejectedValue(error ?? new Error()) }
}

function buildMockDbGetOrderClient_resolves_null(): IDbGetOrderClient {
  return { getOrder: jest.fn().mockResolvedValue(null) }
}

function buildMockDbCreateOrderClient_resolves(): IDbCreateOrderClient {
  return { createOrder: jest.fn().mockResolvedValue(mockOrderData) }
}

function buildMockDbCreateOrderClient_throws(error?: unknown): IDbCreateOrderClient {
  return { createOrder: jest.fn().mockRejectedValue(error ?? new Error()) }
}

function buildMockEsRaiseOrderCreatedEventClient_resolves(): IEsRaiseOrderCreatedEventClient {
  return { raiseOrderCreatedEvent: jest.fn() }
}

function buildMockEsRaiseOrderCreatedEventClient_throws(error?: unknown): IEsRaiseOrderCreatedEventClient {
  return { raiseOrderCreatedEvent: jest.fn().mockRejectedValue(error ?? new Error()) }
}

function buildMockDbUpdateOrderClient_resolves(): IDbUpdateOrderClient {
  return { updateOrder: jest.fn().mockResolvedValue(mockOrderData) }
}

function buildMockDbUpdateOrderClient_throws(error?: unknown): IDbUpdateOrderClient {
  return { updateOrder: jest.fn().mockRejectedValue(error ?? new Error()) }
}

const mockGetOrderCommandInput: GetOrderCommandInput = {
  orderId: 'mockOrderId',
}

const expectedGetOrderCommand = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)

describe(`Orders Service SyncOrderWorker SyncOrderWorkerService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test when it validates the IncomingOrderEvent
   ************************************************************/
  describe(`Test when it validates the IncomingOrderEvent`, () => {
    const mockTestIncomingOrderEventProps: IncomingOrderEvent = {
      // The cancellation event is applicable to any order status, so it's safe for testing
      eventName: OrderEventName.ORDER_CANCELED_EVENT,
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

    it(`does not throw if the input IncomingOrderEvent is valid`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockTestEvent = buildMockIncomingOrderEvent(mockTestIncomingOrderEventProps)
      expect(syncOrderWorkerService.syncOrder(mockTestEvent)).resolves.not.toThrow()
    })

    it(`throws a non-transient InvalidArgumentsError if the input IncomingOrderEvent is
        undefined`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockTestEvent = undefined as never
      const resultPromise = syncOrderWorkerService.syncOrder(mockTestEvent)
      await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
      await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
    })

    it(`throws a non-transient InvalidArgumentsError if the input IncomingOrderEvent is
        null`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockTestEvent = null as never
      const resultPromise = syncOrderWorkerService.syncOrder(mockTestEvent)
      await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
      await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
    })

    it(`throws a non-transient InvalidArgumentsError if the input
        IncomingOrderEvent.eventName is undefined`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockTestEvent = buildMockIncomingOrderEvent(mockTestIncomingOrderEventProps)
      mockTestEvent.eventName = undefined
      const resultPromise = syncOrderWorkerService.syncOrder(mockTestEvent)
      await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
      await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
    })

    it(`throws a non-transient InvalidArgumentsError if the input
        IncomingOrderEvent.eventData is undefined`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockTestEvent = buildMockIncomingOrderEvent(mockTestIncomingOrderEventProps)
      mockTestEvent.eventData = undefined
      const resultPromise = syncOrderWorkerService.syncOrder(mockTestEvent)
      await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
      await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
    })

    it(`throws a non-transient InvalidArgumentsError if the input
        IncomingOrderEvent.eventData.orderId is undefined`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockTestEvent = buildMockIncomingOrderEvent(mockTestIncomingOrderEventProps)
      mockTestEvent.eventData.orderId = undefined
      const resultPromise = syncOrderWorkerService.syncOrder(mockTestEvent)
      await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
      await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
    })

    it(`throws a non-transient InvalidArgumentsError if the input IncomingOrderEvent is
        not an instance of the class`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockEvent = buildMockIncomingOrderEvent(mockTestIncomingOrderEventProps)
      const mockTestEvent = { ...mockEvent }
      const resultPromise = syncOrderWorkerService.syncOrder(mockTestEvent)
      await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
      await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when IT IS an OrderPlacedEvent and the Order DOES NOT exist
   ************************************************************/
  describe(`Test when IT IS an OrderPlacedEvent and the Order DOES NOT exist`, () => {
    const mockOrderPlacedEvent = buildMockIncomingOrderEvent({
      eventName: OrderEventName.ORDER_PLACED_EVENT,
      eventData: {
        orderId: mockOrderId,
        sku: mockSku,
        units: mockUnits,
        price: mockPrice,
        userId: mockUserId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    })

    /*
     *
     *
     ************************************************************
     * Test that it reads the Order from the database
     ************************************************************/
    it(`throws the same Error if GetOrderCommand.validateAndBuild throws an Error`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(GetOrderCommand, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)).rejects.toThrow(mockError)
    })

    it(`calls DbGetOrderClient.getOrder a single time`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledTimes(1)
    })

    it(`calls DbGetOrderClient.getOrder with the expected GetOrderCommand`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledWith(expectedGetOrderCommand)
    })

    it(`throws the same Error if DbGetOrderClient.getOrder throws an Error`, async () => {
      const mockError = new Error('mockError')
      const mockDbGetOrderClient = buildMockDbGetOrderClient_throws(mockError)
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await expect(syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)).rejects.toThrow(mockError)
    })

    /*
     *
     *
     ************************************************************
     * Test that it creates the Order in the database
     ************************************************************/
    it(`throws the same Error if CreateOrderCommand.validateAndBuild throws an Error`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(CreateOrderCommand, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)).rejects.toThrow(mockError)
    })

    it(`calls DbCreateOrderClient.createOrder a single time`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(mockDbCreateOrderClient.createOrder).toHaveBeenCalledTimes(1)
    })

    it(`calls DbCreateOrderClient.createOrder with the expected CreateOrderCommand`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      const mockCreateOrderCommandInput: CreateOrderCommandInput = {
        incomingOrderEvent: mockOrderPlacedEvent,
      }
      const expectedCreateOrderCommand = CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
      expect(mockDbCreateOrderClient.createOrder).toHaveBeenCalledWith(expectedCreateOrderCommand)
    })

    it(`throws the same Error if DbCreateOrderClient.createOrder throws an Error`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_null()
      const mockError = new Error('mockError')
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_throws(mockError)
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await expect(syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)).rejects.toThrow(mockError)
    })

    /*
     *
     *
     ************************************************************
     * Test that it raises the Order Created Event
     ************************************************************/
    it(`throws the same Error if OrderCreatedEvent.validateAndBuild throws an Error`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(OrderCreatedEvent, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)).rejects.toThrow(mockError)
    })

    it(`calls EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent a single time`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent with the expected
        OrderCreatedEvent`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      const mockOrderCreatedEventInput: OrderCreatedEventInput = {
        incomingEventName: OrderEventName.ORDER_PLACED_EVENT,
        orderData: mockOrderData,
      }
      const expectedOrderCreatedEvent = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledWith(expectedOrderCreatedEvent)
    })

    it(`throws the same Error if EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent
        throws an Error`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockError = new Error('mockError')
      const mockUnrecognizedError = UnrecognizedError.from(mockError)
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_throws(mockUnrecognizedError)
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await expect(syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)).rejects.toThrow(mockUnrecognizedError)
    })

    /*
     *
     *
     ************************************************************
     * Test that it DOES NOT update the Order in the database
     ************************************************************/
    it(`does not call DbUpdateOrderClient.updateOrder`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(mockDbUpdateOrderClient.updateOrder).not.toHaveBeenCalled()
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected void if the execution path is successful`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const result = await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(result).not.toBeDefined()
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when IT IS an OrderPlacedEvent and the Order DOES exist
   ************************************************************/
  describe(`Test when IT IS an OrderPlacedEvent and the Order DOES exist`, () => {
    const mockOrderPlacedEvent = buildMockIncomingOrderEvent({
      eventName: OrderEventName.ORDER_PLACED_EVENT,
      eventData: {
        orderId: mockOrderId,
        sku: mockSku,
        units: mockUnits,
        price: mockPrice,
        userId: mockUserId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    })

    /*
     *
     *
     ************************************************************
     * Test that it reads the Order from the database
     ************************************************************/
    it(`throws the same Error if GetOrderCommand.validateAndBuild throws an Error`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(GetOrderCommand, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)).rejects.toThrow(mockError)
    })

    it(`calls DbGetOrderClient.getOrder a single time`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledTimes(1)
    })

    it(`calls DbGetOrderClient.getOrder with the expected GetOrderCommand`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledWith(expectedGetOrderCommand)
    })

    it(`throws the same Error if DbGetOrderClient.getOrder throws an Error`, async () => {
      const mockError = new Error('mockError')
      const mockDbGetOrderClient = buildMockDbGetOrderClient_throws(mockError)
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await expect(syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)).rejects.toThrow(mockError)
    })

    /*
     *
     *
     ************************************************************
     * Test that it raises the Order Created Event
     ************************************************************/
    it(`throws the same Error if OrderCreatedEvent.validateAndBuild throws an Error`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(OrderCreatedEvent, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)).rejects.toThrow(mockError)
    })

    it(`calls EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent a single time`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent with the expected
        OrderCreatedEvent`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      const mockOrderCreatedEventInput: OrderCreatedEventInput = {
        incomingEventName: OrderEventName.ORDER_PLACED_EVENT,
        orderData: mockOrderData,
      }
      const expectedOrderCreatedEvent = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledWith(expectedOrderCreatedEvent)
    })

    it(`throws the same Error if EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent
        throws an Error`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockError = new Error('mockError')
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_throws(mockError)
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await expect(syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)).rejects.toThrow(mockError)
    })

    /*
     *
     *
     ************************************************************
     * Test that it DOES NOT create the Order in the database
     ************************************************************/
    it(`does not call DbCreateOrderClient.createOrder`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(mockDbCreateOrderClient.createOrder).not.toHaveBeenCalled()
    })

    /*
     *
     *
     ************************************************************
     * Test that it DOES NOT update the Order in the database
     ************************************************************/
    it(`does not call DbUpdateOrderClient.updateOrder`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(mockDbUpdateOrderClient.updateOrder).not.toHaveBeenCalled()
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected void if the execution path is successful`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const result = await syncOrderWorkerService.syncOrder(mockOrderPlacedEvent)
      expect(result).not.toBeDefined()
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when IT IS NOT a OrderPlacedEvent and the Order DOES exist
   ************************************************************/
  describe(`Test when IT IS NOT a OrderPlacedEvent and the Order DOES exist`, () => {
    const mockOrderStockAllocatedEvent = buildMockIncomingOrderEvent({
      eventName: OrderEventName.ORDER_STOCK_ALLOCATED_EVENT,
      eventData: {
        orderId: mockOrderId,
        sku: mockSku,
        units: mockUnits,
        price: mockPrice,
        userId: mockUserId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    })

    /*
     *
     *
     ************************************************************
     * Test that it reads the Order from the database
     ************************************************************/
    it(`throws the same Error if GetOrderCommand.validateAndBuild throws an Error`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(GetOrderCommand, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)).rejects.toThrow(mockError)
    })

    it(`calls DbGetOrderClient.getOrder a single time`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledTimes(1)
    })

    it(`calls DbGetOrderClient.getOrder with the expected GetOrderCommand`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledWith(expectedGetOrderCommand)
    })

    it(`throws the same Error if DbGetOrderClient.getOrder throws an Error`, async () => {
      const mockError = new Error('mockError')
      const mockDbGetOrderClient = buildMockDbGetOrderClient_throws(mockError)
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await expect(syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)).rejects.toThrow(mockError)
    })

    /*
     *
     *
     ************************************************************
     * Test that it updates the Order in the database
     ************************************************************/
    it(`throws the same Error if UpdateOrderCommand.validateAndBuild throws an Error`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(UpdateOrderCommand, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)).rejects.toThrow(mockError)
    })

    it(`calls DbUpdateOrderClient.updateOrder a single time`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      expect(mockDbUpdateOrderClient.updateOrder).toHaveBeenCalledTimes(1)
    })

    it(`calls DbUpdateOrderClient.updateOrder with the expected UpdateOrderCommand`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      const mockUpdateOrderCommandInput: UpdateOrderCommandInput = {
        existingOrderData: mockOrderData,
        incomingOrderEvent: mockOrderStockAllocatedEvent,
      }
      const expectedUpdateOrderCommand = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
      expect(mockDbUpdateOrderClient.updateOrder).toHaveBeenCalledWith(expectedUpdateOrderCommand)
    })

    it(`throws the same Error if DbUpdateOrderClient.updateOrder throws an Error`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockError = new Error('mockError')
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_throws(mockError)
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await expect(syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)).rejects.toThrow(mockError)
    })

    /*
     *
     *
     ************************************************************
     * Test that it DOES NOT create the Order in the database
     ************************************************************/
    it(`does not call DbCreateOrderClient.createOrder`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      expect(mockDbCreateOrderClient.createOrder).not.toHaveBeenCalled()
    })

    /*
     *
     *
     ************************************************************
     * Test that it DOES NOT raise the Order Created Event
     ************************************************************/
    it(`does not call EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).not.toHaveBeenCalled()
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected void if the execution path is successful`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const result = await syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      expect(result).not.toBeDefined()
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when IT IS NOT a OrderPlacedEvent and the Order DOES NOT exist
   ************************************************************/
  describe(`Test when IT IS NOT a OrderPlacedEvent and the Order DOES NOT exist`, () => {
    const mockOrderStockAllocatedEvent = buildMockIncomingOrderEvent({
      eventName: OrderEventName.ORDER_STOCK_ALLOCATED_EVENT,
      eventData: {
        orderId: mockOrderId,
        sku: mockSku,
        units: mockUnits,
        price: mockPrice,
        userId: mockUserId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    })

    it(`does not call DbCreateOrderClient.createOrder`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await expect(syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)).rejects.toThrow()
      expect(mockDbCreateOrderClient.createOrder).not.toHaveBeenCalled()
    })

    it(`does not call EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await expect(syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)).rejects.toThrow()
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).not.toHaveBeenCalled()
    })

    it(`does not call DbUpdateOrderClient.updateOrder`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      await expect(syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)).rejects.toThrow()
      expect(mockDbUpdateOrderClient.updateOrder).not.toHaveBeenCalled()
    })

    it(`returns a non-transient InvalidOperationError`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_null()
      const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
      const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_resolves()
      const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
      const syncOrderWorkerService = new SyncOrderWorkerService(
        mockDbGetOrderClient,
        mockDbCreateOrderClient,
        mockDbUpdateOrderClient,
        mockEsRaiseOrderCreatedEventClient,
      )
      const resultPromise = syncOrderWorkerService.syncOrder(mockOrderStockAllocatedEvent)
      await expect(resultPromise).rejects.toThrow(InvalidOperationError)
      await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
    })
  })
})
