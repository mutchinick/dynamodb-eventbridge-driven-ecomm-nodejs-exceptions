import { marshall } from '@aws-sdk/util-dynamodb'
import { InvalidArgumentsError } from '../../errors/AppError'
import { InventoryEventName } from '../../model/InventoryEventName'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { IDbCompleteOrderPaymentAcceptedClient } from '../DbCompleteOrderPaymentAcceptedClient/DbCompleteOrderPaymentAcceptedClient'
import { IDbGetOrderAllocationClient } from '../DbGetOrderAllocationClient/DbGetOrderAllocationClient'
import { CompleteOrderPaymentAcceptedCommand } from '../model/CompleteOrderPaymentAcceptedCommand'
import { GetOrderAllocationCommand } from '../model/GetOrderAllocationCommand'
import { IncomingOrderPaymentAcceptedEvent } from '../model/IncomingOrderPaymentAcceptedEvent'
import { CompleteOrderPaymentAcceptedWorkerService } from './CompleteOrderPaymentAcceptedWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.55
const mockUserId = 'mockUserId'

function buildMockExistingOrderAllocationData(): OrderAllocationData {
  const mockClass: OrderAllocationData = {
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

function buildMockIncomingOrderPaymentAcceptedEvent(): IncomingOrderPaymentAcceptedEvent {
  const incomingOrderEventProps: IncomingOrderPaymentAcceptedEvent = {
    eventName: InventoryEventName.ORDER_PAYMENT_ACCEPTED_EVENT,
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

  // COMBAK: Work a simpler way to build/wrap/unwrap these EventBridgeEvents (maybe some abstraction util?)
  const mockClass = IncomingOrderPaymentAcceptedEvent.validateAndBuild({
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

const mockIncomingOrderPaymentAcceptedEvent = buildMockIncomingOrderPaymentAcceptedEvent()

function buildExpectedCompleteOrderPaymentAcceptedCommand(): CompleteOrderPaymentAcceptedCommand {
  const mockClass = CompleteOrderPaymentAcceptedCommand.validateAndBuild({
    existingOrderAllocationData: mockExistingOrderAllocationData,
    incomingOrderPaymentAcceptedEvent: mockIncomingOrderPaymentAcceptedEvent,
  })
  return mockClass
}

const expectedCompleteOrderPaymentAcceptedCommand = buildExpectedCompleteOrderPaymentAcceptedCommand()

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
function buildMockDbGetOrderAllocationClient_resolves_OrderAllocation(): IDbGetOrderAllocationClient {
  return { getOrderAllocation: jest.fn().mockResolvedValue(mockExistingOrderAllocationData) }
}

function buildMockDbGetOrderAllocationClient_resolves_nullItem(): IDbGetOrderAllocationClient {
  return { getOrderAllocation: jest.fn().mockResolvedValue(null) }
}

function buildMockDbGetOrderAllocationClient_throws(error?: Error): IDbGetOrderAllocationClient {
  return { getOrderAllocation: jest.fn().mockRejectedValue(error ?? new Error()) }
}

function buildMockDbCompleteOrderPaymentAcceptedClient_resolves(): IDbCompleteOrderPaymentAcceptedClient {
  return { completeOrder: jest.fn() }
}

function buildMockDbCompleteOrderPaymentAcceptedClient_throws(error?: Error): IDbCompleteOrderPaymentAcceptedClient {
  return { completeOrder: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Inventory Service CompleteOrderPaymentAcceptedWorker
          CompleteOrderPaymentAcceptedWorkerService tests`, () => {
  // Clear all mocks before each test.
  // There is not a lot of mocking, but some for the Commands
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderPaymentAcceptedEvent edge cases
   ************************************************************/
  describe(`Test IncomingOrderPaymentAcceptedEvent edge cases`, () => {
    it(`does not throw if the input IncomingOrderPaymentAcceptedEvent is valid`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_resolves()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      await expect(
        completeOrderPaymentAcceptedWorkerService.completeOrder(mockIncomingOrderPaymentAcceptedEvent),
      ).resolves.not.toThrow()
    })

    it(`throws a non-transient InvalidArgumentsError if the input
        IncomingOrderPaymentAcceptedEvent is undefined`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_resolves()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const mockTestEvent = undefined as never
      const resultPromise = completeOrderPaymentAcceptedWorkerService.completeOrder(mockTestEvent)
      await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
      await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
    })

    it(`throws a non-transient InvalidArgumentsError if the input
        IncomingOrderPaymentAcceptedEvent is null`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_resolves()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const mockTestEvent = null as never
      const resultPromise = completeOrderPaymentAcceptedWorkerService.completeOrder(mockTestEvent)
      await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
      await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
    })

    it(`throws a non-transient InvalidArgumentsError if the input
        IncomingOrderPaymentAcceptedEvent is not an instance of the class`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_resolves()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const mockTestEvent = { ...mockIncomingOrderPaymentAcceptedEvent }
      const resultPromise = completeOrderPaymentAcceptedWorkerService.completeOrder(mockTestEvent)
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
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_resolves()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(GetOrderAllocationCommand, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(
        completeOrderPaymentAcceptedWorkerService.completeOrder(mockIncomingOrderPaymentAcceptedEvent),
      ).rejects.toThrow(mockError)
    })

    it(`calls DbGetOrderAllocationClient.getOrderAllocation a single time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_resolves()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      await completeOrderPaymentAcceptedWorkerService.completeOrder(mockIncomingOrderPaymentAcceptedEvent)
      expect(mockDbGetOrderAllocationClient.getOrderAllocation).toHaveBeenCalledTimes(1)
    })

    it(`calls DbGetOrderAllocationClient.getOrderAllocation with the expected
        CompleteOrderPaymentAcceptedCommand`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_resolves()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      await completeOrderPaymentAcceptedWorkerService.completeOrder(mockIncomingOrderPaymentAcceptedEvent)
      expect(mockDbGetOrderAllocationClient.getOrderAllocation).toHaveBeenCalledWith(expectedGetOrderAllocationCommand)
    })

    it(`throws the same Error if DbGetOrderAllocationClient.getOrderAllocation throws an
        Error`, async () => {
      const mockError = new Error('mockError')
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_throws(mockError)
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_resolves()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      await expect(
        completeOrderPaymentAcceptedWorkerService.completeOrder(mockIncomingOrderPaymentAcceptedEvent),
      ).rejects.toThrow(mockError)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when the Allocation DOES exist and it completes it
   ************************************************************/
  describe(`Test when the Allocation DOES exist and it completes it`, () => {
    /*
     *
     *
     ************************************************************
     * Test when it completes the Allocation from the database
     ************************************************************/
    it(`throws the same Error if CompleteOrderPaymentAcceptedCommand.validateAndBuild
        throws an Error`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_resolves()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(CompleteOrderPaymentAcceptedCommand, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(
        completeOrderPaymentAcceptedWorkerService.completeOrder(mockIncomingOrderPaymentAcceptedEvent),
      ).rejects.toThrow(mockError)
    })

    it(`calls DbCompleteOrderPaymentAcceptedClient.completeOrder a single time`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_resolves()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      await completeOrderPaymentAcceptedWorkerService.completeOrder(mockIncomingOrderPaymentAcceptedEvent)
      expect(mockDbCompleteOrderPaymentAcceptedClient.completeOrder).toHaveBeenCalledTimes(1)
    })

    it(`calls DbCompleteOrderPaymentAcceptedClient.completeOrder with the expected
        CompleteOrderPaymentAcceptedCommand`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_resolves()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      await completeOrderPaymentAcceptedWorkerService.completeOrder(mockIncomingOrderPaymentAcceptedEvent)
      expect(mockDbCompleteOrderPaymentAcceptedClient.completeOrder).toHaveBeenCalledWith(
        expectedCompleteOrderPaymentAcceptedCommand,
      )
    })

    it(`throws the same Error if DbCompleteOrderPaymentAcceptedClient.completeOrder
        throws an Error`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const mockError = new Error('mockError')
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_throws(mockError)
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      await expect(
        completeOrderPaymentAcceptedWorkerService.completeOrder(mockIncomingOrderPaymentAcceptedEvent),
      ).rejects.toThrow(mockError)
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected void if the execution path is successful`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_OrderAllocation()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_resolves()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const result = await completeOrderPaymentAcceptedWorkerService.completeOrder(
        mockIncomingOrderPaymentAcceptedEvent,
      )
      expect(result).toBeUndefined()
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when the Allocation DOES NOT exist and it skips the completion
   ************************************************************/
  describe(`Test when the Allocation DOES NOT exist and it skips the completion`, () => {
    /*
     *
     *
     ************************************************************
     * Test that it skips the completion
     ************************************************************/
    it(`does not call CompleteOrderPaymentAcceptedCommand.validateAndBuild`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_resolves()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const spy = jest.spyOn(CompleteOrderPaymentAcceptedCommand, 'validateAndBuild')
      await completeOrderPaymentAcceptedWorkerService.completeOrder(mockIncomingOrderPaymentAcceptedEvent)
      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
    })

    it(`does not call DbCompleteOrderPaymentAcceptedClient.completeOrder`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_resolves()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      await completeOrderPaymentAcceptedWorkerService.completeOrder(mockIncomingOrderPaymentAcceptedEvent)
      expect(mockDbCompleteOrderPaymentAcceptedClient.completeOrder).not.toHaveBeenCalled()
    })

    it(`does not throw if DbCompleteOrderPaymentAcceptedClient.completeOrder throws an
        Error`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_throws()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      await expect(
        completeOrderPaymentAcceptedWorkerService.completeOrder(mockIncomingOrderPaymentAcceptedEvent),
      ).resolves.not.toThrow()
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected void if the execution path is successful`, async () => {
      const mockDbGetOrderAllocationClient = buildMockDbGetOrderAllocationClient_resolves_nullItem()
      const mockDbCompleteOrderPaymentAcceptedClient = buildMockDbCompleteOrderPaymentAcceptedClient_resolves()
      const completeOrderPaymentAcceptedWorkerService = new CompleteOrderPaymentAcceptedWorkerService(
        mockDbGetOrderAllocationClient,
        mockDbCompleteOrderPaymentAcceptedClient,
      )
      const result = await completeOrderPaymentAcceptedWorkerService.completeOrder(
        mockIncomingOrderPaymentAcceptedEvent,
      )
      expect(result).toBeUndefined()
    })
  })
})
