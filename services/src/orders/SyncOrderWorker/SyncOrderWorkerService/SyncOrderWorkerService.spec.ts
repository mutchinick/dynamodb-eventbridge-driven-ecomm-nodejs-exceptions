import { marshall } from '@aws-sdk/util-dynamodb'
import { InvalidArgumentsError, InvalidOperationError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { IDbCreateOrderClient } from '../DbCreateOrderClient/DbCreateOrderClient'
import { IDbGetOrderClient } from '../DbGetOrderClient/DbGetOrderClient'
import { IDbUpdateOrderClient } from '../DbUpdateOrderClient/DbUpdateOrderClient'
import { IEsRaiseOrderCreatedEventClient } from '../EsRaiseOrderCreatedEventClient/EsRaiseOrderCreatedEventClient'
import { CreateOrderCommand, CreateOrderCommandInput } from '../model/CreateOrderCommand'
import { GetOrderCommand, GetOrderCommandInput } from '../model/GetOrderCommand'
import { IncomingOrderEvent, IncomingOrderEventInput } from '../model/IncomingOrderEvent'
import { OrderCreatedEvent, OrderCreatedEventInput } from '../model/OrderCreatedEvent'
import { UpdateOrderCommand, UpdateOrderCommandInput } from '../model/UpdateOrderCommand'
import { SyncOrderWorkerService } from './SyncOrderWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

type Mutable_IncomingOrderEvent = {
  -readonly [K in keyof IncomingOrderEvent]: IncomingOrderEvent[K]
}

const mockValidExistingOrderData: OrderData = {
  orderId: 'mockOrderId',
  orderStatus: OrderStatus.ORDER_CREATED_STATUS,
  sku: 'mockSku',
  units: 2,
  price: 3.98,
  userId: 'mockUserId',
  createdAt: 'mockCreatedAt',
  updatedAt: 'mockUpdatedAt',
}

function buildMockIncomingOrderEvent(incomingOrderEventProps: IncomingOrderEvent): Mutable_IncomingOrderEvent {
  const incomingOrderEventInput: IncomingOrderEventInput = {
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
  }

  const incomingOrderEvent = IncomingOrderEvent.validateAndBuild(incomingOrderEventInput)
  const mockIncomingOrderEvent = incomingOrderEvent as Mutable_IncomingOrderEvent
  return mockIncomingOrderEvent
}

//
// Mock Clients
//
function buildMockDbGetOrderClient_resolves_OrderData(): IDbGetOrderClient {
  return { getOrder: jest.fn().mockResolvedValue(mockValidExistingOrderData) }
}

function buildMockDbGetOrderClient_throws(error?: unknown): IDbGetOrderClient {
  return { getOrder: jest.fn().mockRejectedValue(error ?? new Error()) }
}

function buildMockDbGetOrderClient_resolves_null(): IDbGetOrderClient {
  return { getOrder: jest.fn().mockResolvedValue(null) }
}

function buildMockDbCreateOrderClient_resolves(): IDbCreateOrderClient {
  return { createOrder: jest.fn().mockResolvedValue(mockValidExistingOrderData) }
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
  return { updateOrder: jest.fn().mockResolvedValue(mockValidExistingOrderData) }
}

function buildMockDbUpdateOrderClient_throws(error?: unknown): IDbUpdateOrderClient {
  return { updateOrder: jest.fn().mockRejectedValue(error ?? new Error()) }
}

const mockValidGetOrderCommandInput: GetOrderCommandInput = {
  orderId: 'mockOrderId',
}

const expectedGetOrderCommand = GetOrderCommand.validateAndBuild(mockValidGetOrderCommandInput)

describe(`Orders Service SyncOrderWorker SyncOrderWorkerService tests`, () => {
  const mockSomeIncomingOrderEventProps: IncomingOrderEvent = {
    eventName: OrderEventName.ORDER_PLACED_EVENT,
    eventData: {
      orderId: 'mockOrderId',
      sku: 'mockSku',
      units: 2,
      price: 3.98,
      userId: 'mockUserId',
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }

  //
  // Test IncomingOrderEvent edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if IncomingOrderEvent is undefined`, async () => {
    const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
    const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
    const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_throws()
    const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
    const syncOrderWorkerService = new SyncOrderWorkerService(
      mockDbGetOrderClient,
      mockDbCreateOrderClient,
      mockDbUpdateOrderClient,
      mockEsRaiseOrderCreatedEventClient,
    )
    const resultPromise = syncOrderWorkerService.syncOrder(undefined)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if IncomingOrderEvent.eventName is undefined`, async () => {
    const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
    const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
    const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_throws()
    const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
    const syncOrderWorkerService = new SyncOrderWorkerService(
      mockDbGetOrderClient,
      mockDbCreateOrderClient,
      mockDbUpdateOrderClient,
      mockEsRaiseOrderCreatedEventClient,
    )
    const mockTestEvent = buildMockIncomingOrderEvent(mockSomeIncomingOrderEventProps)
    mockTestEvent.eventName = undefined
    const resultPromise = syncOrderWorkerService.syncOrder(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if IncomingOrderEvent.eventData is undefined`, async () => {
    const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
    const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
    const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_throws()
    const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
    const syncOrderWorkerService = new SyncOrderWorkerService(
      mockDbGetOrderClient,
      mockDbCreateOrderClient,
      mockDbUpdateOrderClient,
      mockEsRaiseOrderCreatedEventClient,
    )
    const mockTestEvent = buildMockIncomingOrderEvent(mockSomeIncomingOrderEventProps)
    mockTestEvent.eventData = undefined
    const resultPromise = syncOrderWorkerService.syncOrder(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if IncomingOrderEvent.eventData.orderId is undefined`, async () => {
    const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_OrderData()
    const mockDbCreateOrderClient = buildMockDbCreateOrderClient_resolves()
    const mockDbUpdateOrderClient = buildMockDbUpdateOrderClient_throws()
    const mockEsRaiseOrderCreatedEventClient = buildMockEsRaiseOrderCreatedEventClient_resolves()
    const syncOrderWorkerService = new SyncOrderWorkerService(
      mockDbGetOrderClient,
      mockDbCreateOrderClient,
      mockDbUpdateOrderClient,
      mockEsRaiseOrderCreatedEventClient,
    )
    const mockTestEvent = buildMockIncomingOrderEvent(mockSomeIncomingOrderEventProps)
    mockTestEvent.eventData.orderId = undefined
    const resultPromise = syncOrderWorkerService.syncOrder(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // when IT IS an OrderPlacedEvent and the Order DOES NOT exist
  //
  describe(`when IT IS an OrderPlacedEvent and the Order DOES NOT exist`, () => {
    const mockValidOrderPlacedEvent = buildMockIncomingOrderEvent({
      eventName: OrderEventName.ORDER_PLACED_EVENT,
      eventData: {
        orderId: 'mockOrderId',
        sku: 'mockSku',
        units: 2,
        price: 3.98,
        userId: 'mockUserId',
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    })

    const mockValidOrderCreatedEventInput: OrderCreatedEventInput = {
      incomingEventName: OrderEventName.ORDER_PLACED_EVENT,
      orderData: mockValidExistingOrderData,
    }

    const expectedOrderCreatedEvent = OrderCreatedEvent.validateAndBuild(mockValidOrderCreatedEventInput)

    const mockValidCreateOrderCommandInput: CreateOrderCommandInput = {
      incomingOrderEvent: mockValidOrderPlacedEvent,
    }

    const expectedCreateOrderCommand = CreateOrderCommand.validateAndBuild(mockValidCreateOrderCommandInput)

    //
    // Test that it reads the Order from the database
    //
    it(`throws the same Error if GetOrderCommand.validateAndBuild throws a native Error`, async () => {
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)).rejects.toThrow(mockError)
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
      await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
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
      await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledWith(expectedGetOrderCommand)
    })

    it(`throws the same Error if DbGetOrderClient.getOrder throws a native Error`, async () => {
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)).rejects.toThrow(mockError)
    })

    //
    // Test that it creates the Order in the database
    //
    it(`throws the same Error if CreateOrderCommand.validateAndBuild throws a native Error`, async () => {
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)).rejects.toThrow(mockError)
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
      await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
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
      await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      expect(mockDbCreateOrderClient.createOrder).toHaveBeenCalledWith(expectedCreateOrderCommand)
    })

    it(`throws the same Error if DbCreateOrderClient.createOrder throws a native Error`, async () => {
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)).rejects.toThrow(mockError)
    })

    it(`throws the same Error if OrderCreatedEvent.validateAndBuild throws a native Error`, async () => {
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)).rejects.toThrow(mockError)
    })

    //
    // Test that it raises the OrderCreatedEvent
    //
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
      await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent with the expected OrderCreatedEvent`, async () => {
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
      await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledWith(expectedOrderCreatedEvent)
    })

    it(`throws the same Error if EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent throws a native Error`, async () => {
      const mockDbGetOrderClient = buildMockDbGetOrderClient_resolves_null()
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)).rejects.toThrow(mockError)
    })

    it(`returns a void if all components succeed`, async () => {
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
      const result = await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      expect(result).not.toBeDefined()
    })
  })

  //
  // when IT IS an OrderPlacedEvent and the Order DOES exist
  //
  describe(`when IT IS an OrderPlacedEvent and the Order DOES exist`, () => {
    const mockValidOrderPlacedEvent = buildMockIncomingOrderEvent({
      eventName: OrderEventName.ORDER_PLACED_EVENT,
      eventData: {
        orderId: 'mockOrderId',
        sku: 'mockSku',
        units: 2,
        price: 3.98,
        userId: 'mockUserId',
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    })

    const mockValidOrderCreatedEventInput: OrderCreatedEventInput = {
      incomingEventName: OrderEventName.ORDER_PLACED_EVENT,
      orderData: mockValidExistingOrderData,
    }

    const expectedOrderCreatedEvent = OrderCreatedEvent.validateAndBuild(mockValidOrderCreatedEventInput)

    //
    // Test that it reads the Order from the database
    //
    it(`throws the same Error if GetOrderCommand.validateAndBuild throws a native Error`, async () => {
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)).rejects.toThrow(mockError)
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
      await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
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
      await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledWith(expectedGetOrderCommand)
    })

    it(`throws the same Error if DbGetOrderClient.getOrder throws a native Error`, async () => {
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)).rejects.toThrow(mockError)
    })

    //
    // Test that it DOES NOT create the Order in the database
    //
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
      await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      expect(mockDbCreateOrderClient.createOrder).toHaveBeenCalledTimes(0)
    })

    it(`throws the same Error if OrderCreatedEvent.validateAndBuild throws a native Error`, async () => {
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)).rejects.toThrow(mockError)
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
      await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent with the expected OrderCreatedEvent`, async () => {
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
      await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledWith(expectedOrderCreatedEvent)
    })

    it(`throws the same Error if EsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent throws a native Error`, async () => {
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)).rejects.toThrow(mockError)
    })

    it(`returns a void if all components succeed`, async () => {
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
      const result = await syncOrderWorkerService.syncOrder(mockValidOrderPlacedEvent)
      expect(result).not.toBeDefined()
    })
  })

  //
  // when IT IS NOT a OrderPlacedEvent and the Order DOES exist
  //
  describe(`when IT IS NOT a OrderPlacedEvent and the Order DOES exist`, () => {
    const mockValidOrderStockAllocatedEvent = buildMockIncomingOrderEvent({
      eventName: OrderEventName.ORDER_STOCK_ALLOCATED_EVENT,
      eventData: {
        orderId: 'mockOrderId',
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    })

    const mockValidUpdateOrderCommandInput: UpdateOrderCommandInput = {
      existingOrderData: mockValidExistingOrderData,
      incomingOrderEvent: mockValidOrderStockAllocatedEvent,
    }

    const expectedUpdateOrderCommand = UpdateOrderCommand.validateAndBuild(mockValidUpdateOrderCommandInput)

    //
    // Test that it reads the Order from the database
    //
    it(`throws the same Error if GetOrderCommand.validateAndBuild throws a native Error`, async () => {
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)).rejects.toThrow(mockError)
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
      await syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)
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
      await syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledWith(expectedGetOrderCommand)
    })

    it(`throws the same Error if DbGetOrderClient.getOrder throws a native Error`, async () => {
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)).rejects.toThrow(mockError)
    })

    //
    // Test that it updates the Order in the database
    //
    it(`throws the same Error if UpdateOrderCommand.validateAndBuild throws a native Error`, async () => {
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)).rejects.toThrow(mockError)
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
      await syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)
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
      await syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)
      expect(mockDbUpdateOrderClient.updateOrder).toHaveBeenCalledWith(expectedUpdateOrderCommand)
    })

    it(`throws the same Error if DbUpdateOrderClient.updateOrder throws a native Error`, async () => {
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)).rejects.toThrow(mockError)
    })

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
      await syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledTimes(0)
    })

    it(`returns a void if all components succeed`, async () => {
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
      const result = await syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)
      expect(result).not.toBeDefined()
    })
  })

  //
  // when IT IS NOT a OrderPlacedEvent and the Order DOES NOT exist
  //
  describe(`when IT IS NOT a OrderPlacedEvent and the Order DOES NOT exist`, () => {
    const mockValidOrderStockAllocatedEvent = buildMockIncomingOrderEvent({
      eventName: OrderEventName.ORDER_STOCK_ALLOCATED_EVENT,
      eventData: {
        orderId: 'mockOrderId',
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    })

    //
    // Test that it reads the Order from the database
    //
    it(`throws the same Error if GetOrderCommand.validateAndBuild throws a native Error`, async () => {
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)).rejects.toThrow(mockError)
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)).rejects.toThrow()
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)).rejects.toThrow()
      expect(mockDbGetOrderClient.getOrder).toHaveBeenCalledWith(expectedGetOrderCommand)
    })

    it(`throws the same Error if DbGetOrderClient.getOrder throws a native Error`, async () => {
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)).rejects.toThrow(mockError)
    })

    //
    // Test that DOES NOT act on the Order
    //
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)).rejects.toThrow()
      expect(mockDbCreateOrderClient.createOrder).toHaveBeenCalledTimes(0)
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)).rejects.toThrow()
      expect(mockEsRaiseOrderCreatedEventClient.raiseOrderCreatedEvent).toHaveBeenCalledTimes(0)
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
      await expect(syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)).rejects.toThrow()
      expect(mockDbUpdateOrderClient.updateOrder).toHaveBeenCalledTimes(0)
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
      const resultPromise = syncOrderWorkerService.syncOrder(mockValidOrderStockAllocatedEvent)
      await expect(resultPromise).rejects.toThrow(InvalidOperationError)
      await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
    })
  })
})
