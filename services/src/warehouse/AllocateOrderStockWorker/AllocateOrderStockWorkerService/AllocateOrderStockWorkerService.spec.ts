import {
  AppError,
  DepletedStockAllocationError,
  InvalidArgumentsError,
  DuplicateStockAllocationError,
  UnrecognizedError,
} from '../../errors/AppError'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IDbAllocateOrderStockClient } from '../DbAllocateOrderStockClient/DbAllocateOrderStockClient'
import { IEsRaiseOrderStockAllocatedEventClient } from '../EsRaiseOrderStockAllocatedEventClient/EsRaiseOrderStockAllocatedEventClient'
import { IEsRaiseOrderStockDepletedEventClient } from '../EsRaiseOrderStockDepletedEventClient/EsRaiseOrderStockDepletedEventClient'
import { AllocateOrderStockCommand, AllocateOrderStockCommandInput } from '../model/AllocateOrderStockCommand'
import { IncomingOrderCreatedEvent } from '../model/IncomingOrderCreatedEvent'
import { OrderStockAllocatedEvent } from '../model/OrderStockAllocatedEvent'
import { OrderStockDepletedEvent } from '../model/OrderStockDepletedEvent'
import { AllocateOrderStockWorkerService } from './AllocateOrderStockWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

const mockIncomingOrderCreatedEvent: IncomingOrderCreatedEvent = {
  eventName: WarehouseEventName.ORDER_CREATED_EVENT,
  eventData: {
    sku: 'mockSku',
    units: 3,
    orderId: 'mockOrderId',
  },
  createdAt: mockDate,
  updatedAt: mockDate,
}

const mockValidAllocateOrderStockCommandInput: AllocateOrderStockCommandInput = {
  incomingOrderCreatedEvent: mockIncomingOrderCreatedEvent,
}

const expectedAllocateOrderStockCommand = AllocateOrderStockCommand.validateAndBuild(
  mockValidAllocateOrderStockCommandInput,
)

function buildMockDbAllocateOrderStockClient_resolves(): IDbAllocateOrderStockClient {
  return { allocateOrderStock: jest.fn() }
}

function buildMockDbAllocateOrderStockClient_throws(error: AppError): IDbAllocateOrderStockClient {
  return { allocateOrderStock: jest.fn().mockRejectedValue(error) }
}

function buildMockEsRaiseOrderStockAllocatedEventClient_resolves(): IEsRaiseOrderStockAllocatedEventClient {
  return { raiseOrderStockAllocatedEvent: jest.fn() }
}

function buildMockEsRaiseOrderStockAllocatedEventClient_throws(
  error: AppError,
): IEsRaiseOrderStockAllocatedEventClient {
  return { raiseOrderStockAllocatedEvent: jest.fn().mockRejectedValue(error) }
}

function buildMockEsRaiseOrderStockDepletedEventClient_resolves(): IEsRaiseOrderStockDepletedEventClient {
  return { raiseOrderStockDepletedEvent: jest.fn() }
}

function buildMockEsRaiseOrderStockDepletedEventClient_throws(error: AppError): IEsRaiseOrderStockDepletedEventClient {
  return { raiseOrderStockDepletedEvent: jest.fn().mockRejectedValue(error) }
}

describe(`Warehouse Service AllocateOrderStockWorker AllocateOrderStockWorkerService tests`, () => {
  //
  // Test IncomingOrderCreatedEvent edge cases
  //
  it(`throws if IncomingOrderCreatedEvent is undefined`, async () => {
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
    const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
    const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
      mockDbAllocateOrderStockClient,
      mockEsRaiseOrderStockAllocatedEventClient,
      mockEsRaiseOrderStockDepletedEventClient,
    )
    await expect(allocateOrderStockWorkerService.allocateOrderStock(undefined)).rejects.toThrow()
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

  it(`throws if DbAllocateOrderStockClient.allocateOrderStock throws`, async () => {
    const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(UnrecognizedError.from())
    const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
    const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
    const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
      mockDbAllocateOrderStockClient,
      mockEsRaiseOrderStockAllocatedEventClient,
      mockEsRaiseOrderStockDepletedEventClient,
    )
    await expect(allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent)).rejects.toThrow()
  })

  //
  // When DbAllocateOrderStockClient.allocateOrderStock returns
  //
  describe(`when DbAllocateOrderStockClient.allocateOrderStock returns`, () => {
    const { eventData } = mockIncomingOrderCreatedEvent
    const orderStockAllocatedEvent = OrderStockAllocatedEvent.validateAndBuild(eventData)

    it(`throws an InvalidArgumentsError if the IncomingOrderCreatedEvent data is not valid`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_resolves()
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      const allocateOrderStockCommandInput: AllocateOrderStockCommandInput = {
        incomingOrderCreatedEvent: mockIncomingOrderCreatedEvent,
      }
      const allocateOrderStockCommand = AllocateOrderStockCommand.validateAndBuild(allocateOrderStockCommandInput)
      jest.spyOn(AllocateOrderStockCommand, 'validateAndBuild').mockReturnValue(allocateOrderStockCommand)
      const faultyIncomingOrderCreatedEvent = { ...mockIncomingOrderCreatedEvent, eventData: {} } as never
      await expect(allocateOrderStockWorkerService.allocateOrderStock(faultyIncomingOrderCreatedEvent))
        .rejects.toThrow()
        .catch((error) => error instanceof InvalidArgumentsError)
      jest.clearAllMocks()
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

    it(`throws the same error if EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent throws`, async () => {
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
  // When DbAllocateOrderStockClient.allocateOrderStock returns an DuplicateStockAllocationError Failure
  //
  describe(`when DbAllocateOrderStockClient.allocateOrderStock returns an DuplicateStockAllocationError Failure`, () => {
    const { eventData } = mockIncomingOrderCreatedEvent
    const orderStockAllocatedEvent = OrderStockAllocatedEvent.validateAndBuild(eventData)

    it(`throws an InvalidArgumentsError if the IncomingOrderCreatedEvent data is not valid`, async () => {
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
      const allocateOrderStockCommandInput: AllocateOrderStockCommandInput = {
        incomingOrderCreatedEvent: mockIncomingOrderCreatedEvent,
      }
      const allocateOrderStockCommand = AllocateOrderStockCommand.validateAndBuild(allocateOrderStockCommandInput)
      jest.spyOn(AllocateOrderStockCommand, 'validateAndBuild').mockReturnValue(allocateOrderStockCommand)
      const faultyIncomingOrderCreatedEvent = { ...mockIncomingOrderCreatedEvent, eventData: {} } as never
      await expect(
        allocateOrderStockWorkerService.allocateOrderStock(faultyIncomingOrderCreatedEvent),
      ).rejects.toBeInstanceOf(InvalidArgumentsError)
      jest.clearAllMocks()
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

    it(`throws the same error if EsRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent throws`, async () => {
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
  // When DbAllocateOrderStockClient.allocateOrderStock returns an DepletedStockAllocationError Failure
  //
  describe(`when DbAllocateOrderStockClient.allocateOrderStock returns an DepletedStockAllocationError Failure`, () => {
    const { eventData } = mockIncomingOrderCreatedEvent
    const orderStockDepletedEvent = OrderStockDepletedEvent.validateAndBuild(eventData)

    it(`throws an InvalidArgumentsError if the IncomingOrderCreatedEvent data is not valid`, async () => {
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
      const allocateOrderStockCommandInput: AllocateOrderStockCommandInput = {
        incomingOrderCreatedEvent: mockIncomingOrderCreatedEvent,
      }
      const allocateOrderStockCommand = AllocateOrderStockCommand.validateAndBuild(allocateOrderStockCommandInput)
      jest.spyOn(AllocateOrderStockCommand, 'validateAndBuild').mockReturnValue(allocateOrderStockCommand)
      const faultyIncomingOrderCreatedEvent = { ...mockIncomingOrderCreatedEvent, eventData: {} } as never
      await expect(allocateOrderStockWorkerService.allocateOrderStock(faultyIncomingOrderCreatedEvent))
        .rejects.toThrow()
        .catch((error) => error instanceof InvalidArgumentsError)
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

    it(`throws the same error if EsRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent throws`, async () => {
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
  // When DbAllocateOrderStockClient.allocateOrderStock returns an InvalidArgumentsError or UnrecognizedError Failure
  //
  describe(`when DbAllocateOrderStockClient.allocateOrderStock returns an InvalidArgumentsError or UnrecognizedError Failure`, () => {
    it(`throws an InvalidArgumentsError if DbAllocateOrderStockClient.allocateOrderStock throws an InvalidArgumentsError`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(InvalidArgumentsError.from())
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(
        allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent),
      ).rejects.toBeInstanceOf(InvalidArgumentsError)
    })

    it(`returns an UnrecognizedError Failure if DbAllocateOrderStockClient.allocateOrderStock returns an UnrecognizedError Failure`, async () => {
      const mockDbAllocateOrderStockClient = buildMockDbAllocateOrderStockClient_throws(UnrecognizedError.from())
      const mockEsRaiseOrderStockAllocatedEventClient = buildMockEsRaiseOrderStockAllocatedEventClient_resolves()
      const mockEsRaiseOrderStockDepletedEventClient = buildMockEsRaiseOrderStockDepletedEventClient_resolves()
      const allocateOrderStockWorkerService = new AllocateOrderStockWorkerService(
        mockDbAllocateOrderStockClient,
        mockEsRaiseOrderStockAllocatedEventClient,
        mockEsRaiseOrderStockDepletedEventClient,
      )
      await expect(
        allocateOrderStockWorkerService.allocateOrderStock(mockIncomingOrderCreatedEvent),
      ).rejects.toBeInstanceOf(UnrecognizedError)
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
