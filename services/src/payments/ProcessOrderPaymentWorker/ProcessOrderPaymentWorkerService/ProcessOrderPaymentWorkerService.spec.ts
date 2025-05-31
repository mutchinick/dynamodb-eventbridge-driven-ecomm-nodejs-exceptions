import { marshall } from '@aws-sdk/util-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import {
  InvalidArgumentsError,
  PaymentAlreadyAcceptedError,
  PaymentAlreadyRejectedError,
  PaymentFailedError,
} from '../../errors/AppError'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { PaymentsEventName } from '../../model/PaymentsEventName'
import { PaymentStatus } from '../../model/PaymentStatus'
import {
  AxSubmitOrderPaymentClientOutput,
  IAxSubmitOrderPaymentClient,
} from '../AxSubmitOrderPaymentClient/AxSubmitOrderPaymentClient'
import { IDbGetOrderPaymentClient } from '../DbGetOrderPaymentClient/DbGetOrderPaymentClient'
import { IDbRecordOrderPaymentClient } from '../DbRecordOrderPaymentClient/DbRecordOrderPaymentClient'
import { IEsRaiseOrderPaymentAcceptedEventClient } from '../EsRaiseOrderPaymentAcceptedEventClient/EsRaiseOrderPaymentAcceptedEventClient'
import { IEsRaiseOrderPaymentRejectedEventClient } from '../EsRaiseOrderPaymentRejectedEventClient/EsRaiseOrderPaymentRejectedEventClient'
import { GetOrderPaymentCommand, GetOrderPaymentCommandInput } from '../model/GetOrderPaymentCommand'
import { IncomingOrderStockAllocatedEvent } from '../model/IncomingOrderStockAllocatedEvent'
import { OrderPaymentAcceptedEvent, OrderPaymentAcceptedEventInput } from '../model/OrderPaymentAcceptedEvent'
import { OrderPaymentRejectedEvent, OrderPaymentRejectedEventInput } from '../model/OrderPaymentRejectedEvent'
import { RecordOrderPaymentCommand, RecordOrderPaymentCommandInput } from '../model/RecordOrderPaymentCommand'
import { SubmitOrderPaymentCommand, SubmitOrderPaymentCommandInput } from '../model/SubmitOrderPaymentCommand'
import { MAX_ALLOWED_PAYMENT_RETRIES, ProcessOrderPaymentWorkerService } from './ProcessOrderPaymentWorkerService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'
const mockCreatedAt = mockDate
const mockUpdatedAt = mockDate
const mockPaymentId = 'mockPaymentId'

function buildMockIncomingOrderStockAllocatedEvent(): TypeUtilsMutable<IncomingOrderStockAllocatedEvent> {
  const incomingOrderEventProps: IncomingOrderStockAllocatedEvent = {
    eventName: PaymentsEventName.ORDER_STOCK_ALLOCATED_EVENT,
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

  // COMBAK: Work a simpler way to build/wrap/unwrap these EventBridgeEvents (maybe some abstraction util?)
  const mockClass = IncomingOrderStockAllocatedEvent.validateAndBuild({
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

const mockIncomingOrderStockAllocatedEvent = buildMockIncomingOrderStockAllocatedEvent()

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/

function buildMockOrderPaymentData(
  paymentId: string,
  paymentStatus: PaymentStatus,
  paymentRetries: number,
): OrderPaymentData {
  return {
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
    paymentId,
    paymentStatus,
    paymentRetries,
  }
}

function buildMockDbGetOrderPaymentClient_resolves(paymentData: OrderPaymentData): IDbGetOrderPaymentClient {
  return { getOrderPayment: jest.fn().mockResolvedValue(paymentData) }
}

function buildMockDbGetOrderPaymentClient_resolves_nullItem(): IDbGetOrderPaymentClient {
  return { getOrderPayment: jest.fn().mockResolvedValue(null) }
}

function buildMockDbGetOrderPaymentClient_throws(error?: Error): IDbGetOrderPaymentClient {
  return { getOrderPayment: jest.fn().mockRejectedValue(error ?? new Error()) }
}

function buildMockAxSubmitOrderPaymentClient_resolves(
  paymentOutput?: AxSubmitOrderPaymentClientOutput,
): IAxSubmitOrderPaymentClient {
  const acceptedPaymentOutput: AxSubmitOrderPaymentClientOutput = {
    orderId: mockOrderId,
    paymentId: mockPaymentId,
    paymentStatus: 'PAYMENT_ACCEPTED',
  }
  return {
    submitOrderPayment: jest.fn().mockResolvedValue(paymentOutput ?? acceptedPaymentOutput),
  }
}

function buildMockAxSubmitOrderPaymentClient_throws(error?: Error): IAxSubmitOrderPaymentClient {
  return { submitOrderPayment: jest.fn().mockRejectedValue(error ?? new Error()) }
}

function buildMockDbRecordOrderPaymentClient_resolves(): IDbRecordOrderPaymentClient {
  return { recordOrderPayment: jest.fn() }
}

function buildMockDbRecordOrderPaymentClient_throws(error?: Error): IDbRecordOrderPaymentClient {
  return { recordOrderPayment: jest.fn().mockRejectedValue(error ?? new Error()) }
}

function buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves(): IEsRaiseOrderPaymentAcceptedEventClient {
  return { raiseOrderPaymentAcceptedEvent: jest.fn() }
}

function buildMockEsRaiseOrderPaymentAcceptedEventClient_throws(
  error?: Error,
): IEsRaiseOrderPaymentAcceptedEventClient {
  return { raiseOrderPaymentAcceptedEvent: jest.fn().mockRejectedValue(error ?? new Error()) }
}

function buildMockEsRaiseOrderPaymentRejectedEventClient_resolves(): IEsRaiseOrderPaymentRejectedEventClient {
  return { raiseOrderPaymentRejectedEvent: jest.fn() }
}

function buildMockEsRaiseOrderPaymentRejectedEventClient_throws(
  error?: Error,
): IEsRaiseOrderPaymentRejectedEventClient {
  return { raiseOrderPaymentRejectedEvent: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Payments Service ProcessOrderPaymentWorker ProcessOrderPaymentWorkerService
          tests`, () => {
  // Clear all mocks before each test.
  // There is not a lot of mocking, but some for the Commands
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /*
   *
   *
   ************************************************************
   * Test when it validates the IncomingOrderStockAllocatedEvent
   ************************************************************/
  describe(`Test when it validates the IncomingOrderStockAllocatedEvent`, () => {
    //
    it(`does not throw if the input IncomingOrderEvent is valid`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves_nullItem()
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).resolves.not.toThrow()
    })

    it(`throws a non-transient InvalidArgumentsError if the input IncomingOrderEvent is
        undefined`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves_nullItem()
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockTestEvent = undefined as never
      const resultPromise = processOrderPaymentWorkerService.processOrderPayment(mockTestEvent)
      await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
      await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
    })

    it(`throws a non-transient InvalidArgumentsError if the input IncomingOrderEvent is
        null`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves_nullItem()
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockTestEvent = null as never
      const resultPromise = processOrderPaymentWorkerService.processOrderPayment(mockTestEvent)
      await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
      await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
    })

    it(`throws a non-transient InvalidArgumentsError if the input IncomingOrderEvent is
        not an instance of the class`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves_nullItem()
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockTestEvent = { ...mockIncomingOrderStockAllocatedEvent }
      const resultPromise = processOrderPaymentWorkerService.processOrderPayment(mockTestEvent)
      await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
      await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when it reads the Payment from the database
   ************************************************************/
  describe(`Test when it reads the Payment from the database`, () => {
    it(`throws the same Error if GetOrderPaymentCommand.validateAndBuild throws an Error`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves_nullItem()
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(GetOrderPaymentCommand, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toThrow(mockError)
    })

    it(`calls DbGetOrderPaymentClient.getOrderPayment a single time`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves_nullItem()
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockDbGetOrderPaymentClient.getOrderPayment).toHaveBeenCalledTimes(1)
    })

    it(`calls DbGetOrderPaymentClient.getOrderPayment with the expected
        GetOrderPaymentCommand`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves_nullItem()
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const { orderId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockGetOrderPaymentCommandInput: GetOrderPaymentCommandInput = { orderId }
      const expectedGetOrderPaymentCommand = GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockDbGetOrderPaymentClient.getOrderPayment).toHaveBeenCalledWith(expectedGetOrderPaymentCommand)
    })

    it(`throws the same Error if DbGetOrderPaymentClient.getOrderPayment throws an Error`, async () => {
      const mockError = new Error('mockError')
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_throws(mockError)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toThrow(mockError)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when the Payment DOES exist as Failed and when it exceeds the retry limit and it rejects the Payment
   ************************************************************/
  describe(`Test when the Payment DOES exist as Failed and when it exceeds the retry limit
            and it rejects the Payment`, () => {
    // Use the same existing OrderPaymentData for all the tests in this scenario
    const mockExistingOrderPaymentData: OrderPaymentData = {
      orderId: mockOrderId,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
      createdAt: mockCreatedAt,
      updatedAt: mockUpdatedAt,
      paymentId: 'mockPaymentFailedId',
      paymentStatus: 'PAYMENT_FAILED',
      paymentRetries: MAX_ALLOWED_PAYMENT_RETRIES,
    }

    // TODO: Add tests for when the Payment already exists as Accepted or Rejected
    // It will be much easier once we migrate to a single EventStore client.

    it(`does not call AxSubmitOrderPaymentClient.submitOrderPayment when it exceeds the
        retry limit and it rejects the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockAxSubmitOrderPaymentClient.submitOrderPayment).not.toHaveBeenCalled()
    })

    /*
     *
     *
     ************************************************************
     * Test when it updates the Payment in the database
     ************************************************************/
    it(`throws the same Error if RecordOrderPaymentCommand.validateAndBuild throws an
        Error when it exceeds the retry limit and it rejects the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(RecordOrderPaymentCommand, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toThrow(mockError)
    })

    it(`calls DbRecordOrderPaymentClient.recordOrderPayment a single time when it
        exceeds the retry limit and it rejects the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).toHaveBeenCalledTimes(1)
    })

    it(`calls DbRecordOrderPaymentClient.recordOrderPayment with the expected
        RecordOrderPaymentCommand when it exceeds the retry limit and it rejects the
        Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { eventData } = mockIncomingOrderStockAllocatedEvent
      const mockRecordOrderPaymentCommandInput: RecordOrderPaymentCommandInput = {
        existingOrderPaymentData: mockExistingOrderPaymentData,
        newOrderPaymentFields: {
          orderId: eventData.orderId,
          sku: eventData.sku,
          units: eventData.units,
          price: eventData.price,
          userId: eventData.userId,
          paymentId: mockExistingOrderPaymentData.paymentId,
          paymentStatus: 'PAYMENT_REJECTED',
        },
      }
      const expectedRecordOrderPaymentCommand = RecordOrderPaymentCommand.validateAndBuild(
        mockRecordOrderPaymentCommandInput,
      )
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).toHaveBeenCalledWith(expectedRecordOrderPaymentCommand)
    })

    it(`throws the same Error if DbRecordOrderPaymentClient.recordOrderPayment throws an
        Error not accounted for when it exceeds the retry limit and it rejects the
        Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockError = new Error('mockError')
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_throws(mockError)
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toThrow(mockError)
    })

    /*
     *
     *
     ************************************************************
     * Test when it raises the Payment Rejected event
     ************************************************************/
    it(`throws the same Error if OrderPaymentRejectedEvent.validateAndBuild throws an
        Error when it exceeds the retry limit and it rejects the Payment`, async () => {
      const mockExistingOrderPaymentData = buildMockOrderPaymentData(
        undefined,
        'PAYMENT_FAILED',
        MAX_ALLOWED_PAYMENT_RETRIES,
      )
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(OrderPaymentRejectedEvent, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toThrow(mockError)
    })

    it(`calls EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent a
        single time when it exceeds the retry limit and it rejects the Payment`, async () => {
      const mockExistingOrderPaymentData = buildMockOrderPaymentData(
        undefined,
        'PAYMENT_FAILED',
        MAX_ALLOWED_PAYMENT_RETRIES,
      )
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent the
        expected OrderPaymentRejectedEvent when it exceeds the retry limit and it
        rejects the Payment`, async () => {
      const mockExistingOrderPaymentData = buildMockOrderPaymentData(
        undefined,
        'PAYMENT_FAILED',
        MAX_ALLOWED_PAYMENT_RETRIES,
      )
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { orderId, sku, units, price, userId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockOrderPaymentRejectedEventInput: OrderPaymentRejectedEventInput = {
        orderId,
        sku,
        units,
        price,
        userId,
      }
      const expectedOrderPaymentRejectedEvent = OrderPaymentRejectedEvent.validateAndBuild(
        mockOrderPaymentRejectedEventInput,
      )
      expect(mockEsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent).toHaveBeenCalledWith(
        expectedOrderPaymentRejectedEvent,
      )
    })

    it(`throws the same Error if
        EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent throws an
        Error when it exceeds the retry limit and it rejects the Payment`, async () => {
      const mockExistingOrderPaymentData = buildMockOrderPaymentData(
        undefined,
        'PAYMENT_FAILED',
        MAX_ALLOWED_PAYMENT_RETRIES,
      )
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockError = new Error('mockError')
      const mockEsRaiseOrderPaymentRejectedEventClient =
        buildMockEsRaiseOrderPaymentRejectedEventClient_throws(mockError)
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toStrictEqual(mockError)
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected void if the execution path is successful when it exceeds
        the retry limit and it rejects the Payment`, async () => {
      const mockExistingOrderPaymentData = buildMockOrderPaymentData(
        undefined,
        'PAYMENT_FAILED',
        MAX_ALLOWED_PAYMENT_RETRIES,
      )
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(result).toBeUndefined()
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when the Payment DOES NOT exist or DOES exist as Failed and it submits the Payment
   ************************************************************/
  describe.each([
    {
      paymentState: 'DOES NOT exist',
      mockExistingOrderPaymentData: null,
    },
    {
      paymentState: 'DOES exist as Failed',
      mockExistingOrderPaymentData: {
        orderId: mockOrderId,
        sku: mockSku,
        units: mockUnits,
        price: mockPrice,
        userId: mockUserId,
        createdAt: mockCreatedAt,
        updatedAt: mockUpdatedAt,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_FAILED',
        paymentRetries: 0,
      } satisfies OrderPaymentData,
    },
  ])(`Test when the Payment $paymentState and when it submits the Payment`, ({ mockExistingOrderPaymentData }) => {
    /*
     *
     *
     ************************************************************
     * Test when it submits the Payment
     ************************************************************/
    it(`throws the same Error if SubmitOrderPaymentCommand.validateAndBuild throws an
        Error when it submits the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(SubmitOrderPaymentCommand, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toThrow(mockError)
    })

    it(`calls AxSubmitOrderPaymentClient.submitOrderPayment a single time when it
        submits the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockAxSubmitOrderPaymentClient.submitOrderPayment).toHaveBeenCalledTimes(1)
    })

    it(`calls AxSubmitOrderPaymentClient.submitOrderPayment with the expected
        RecordOrderPaymentCommand when it submits the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves_nullItem()
      const submitOrderPaymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
      }
      const mockAxSubmitOrderPaymentClient =
        buildMockAxSubmitOrderPaymentClient_resolves(submitOrderPaymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { orderId, sku, units, price, userId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockSubmitOrderPaymentCommandInput: SubmitOrderPaymentCommandInput = {
        orderId,
        sku,
        units,
        price,
        userId,
        existingPaymentStatus: mockExistingOrderPaymentData?.paymentStatus,
      }
      const expectedSubmitOrderPaymentCommand = SubmitOrderPaymentCommand.validateAndBuild(
        mockSubmitOrderPaymentCommandInput,
      )
      expect(mockAxSubmitOrderPaymentClient.submitOrderPayment).toHaveBeenCalledWith(expectedSubmitOrderPaymentCommand)
    })

    it(`throws the same Error if AxSubmitOrderPaymentClient.submitOrderPayment throws an
        Error not accounted for when it submits the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockError = new Error('mockError')
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_throws(mockError)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toThrow(mockError)
    })

    /*
     *
     *
     ************************************************************
     * Test when it updates the Payment in the database
     ************************************************************/
    it(`throws the same Error if RecordOrderPaymentCommand.validateAndBuild throws an
        Error when it submits the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(RecordOrderPaymentCommand, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toThrow(mockError)
    })

    it(`calls DbRecordOrderPaymentClient.recordOrderPayment a single time when it
        submits the Payment and the new Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).toHaveBeenCalledTimes(1)
    })

    it(`calls DbRecordOrderPaymentClient.recordOrderPayment with the expected
        RecordOrderPaymentCommand when it submits the Payment and the new Payment is
        Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { orderId, sku, units, price, userId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockRecordOrderPaymentCommandInput: RecordOrderPaymentCommandInput = {
        existingOrderPaymentData: mockExistingOrderPaymentData ?? undefined,
        newOrderPaymentFields: {
          orderId,
          sku,
          units,
          price,
          userId,
          paymentId: mockPaymentId,
          paymentStatus: 'PAYMENT_ACCEPTED',
        },
      }
      const expectedRecordOrderPaymentCommand = RecordOrderPaymentCommand.validateAndBuild(
        mockRecordOrderPaymentCommandInput,
      )
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).toHaveBeenCalledWith(expectedRecordOrderPaymentCommand)
    })

    it(`calls DbRecordOrderPaymentClient.recordOrderPayment a single time when it
        submits the Payment and the new Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_REJECTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).toHaveBeenCalledTimes(1)
    })

    it(`calls DbRecordOrderPaymentClient.recordOrderPayment with the expected
        RecordOrderPaymentCommand when it submits the Payment and the new Payment is
        Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_REJECTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { orderId, sku, units, price, userId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockRecordOrderPaymentCommandInput: RecordOrderPaymentCommandInput = {
        existingOrderPaymentData: mockExistingOrderPaymentData ?? undefined,
        newOrderPaymentFields: {
          orderId,
          sku,
          units,
          price,
          userId,
          paymentId: mockPaymentId,
          paymentStatus: 'PAYMENT_REJECTED',
        },
      }
      const expectedRecordOrderPaymentCommand = RecordOrderPaymentCommand.validateAndBuild(
        mockRecordOrderPaymentCommandInput,
      )
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).toHaveBeenCalledWith(expectedRecordOrderPaymentCommand)
    })

    it(`calls DbRecordOrderPaymentClient.recordOrderPayment a single time when it
        submits the Payment and the new Payment is Failed`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockError = new Error('mockError')
      const paymentFailedError = PaymentFailedError.from(mockError, 'mockErrorMessage')
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_throws(paymentFailedError)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toThrow(paymentFailedError)
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).toHaveBeenCalledTimes(1)
    })

    it(`calls DbRecordOrderPaymentClient.recordOrderPayment with the expected
        RecordOrderPaymentCommand when it submits the Payment and the new Payment is
        Failed`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockError = new Error('mockError')
      const paymentFailedError = PaymentFailedError.from(mockError, 'mockErrorMessage')
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_throws(paymentFailedError)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toThrow(paymentFailedError)
      const { orderId, sku, units, price, userId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockRecordOrderPaymentCommandInput: RecordOrderPaymentCommandInput = {
        existingOrderPaymentData: mockExistingOrderPaymentData ?? undefined,
        newOrderPaymentFields: {
          orderId,
          sku,
          units,
          price,
          userId,
          paymentId: mockPaymentId,
          paymentStatus: 'PAYMENT_FAILED',
        },
      }
      const expectedRecordOrderPaymentCommand = RecordOrderPaymentCommand.validateAndBuild(
        mockRecordOrderPaymentCommandInput,
      )
      expectedRecordOrderPaymentCommand.commandData.paymentId = expect.any(String)
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).toHaveBeenCalledWith(expectedRecordOrderPaymentCommand)
    })

    it(`throws the same Error if DbRecordOrderPaymentClient.recordOrderPayment throws an
        Error not accounted for when it submits the Payment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockError = new Error('mockError')
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_throws(mockError)
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toThrow(mockError)
    })

    /*
     *
     *
     ************************************************************
     * Test when it raises the Accepted event
     ************************************************************/
    it(`throws the same Error if the OrderPaymentAcceptedEvent.validateAndBuild throws
        an Error when it submits the Payment and the new Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(OrderPaymentAcceptedEvent, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toThrow(mockError)
    })

    it(`calls EsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent a
        single time when it submits the Payment and the new Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent with
        the expected OrderPaymentAcceptedEvent when it submits the Payment and the new
        Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { orderId, sku, units, price, userId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockOrderPaymentAcceptedEventInput: OrderPaymentAcceptedEventInput = {
        orderId,
        sku,
        units,
        price,
        userId,
      }
      const expectedOrderPaymentAcceptedEvent = OrderPaymentAcceptedEvent.validateAndBuild(
        mockOrderPaymentAcceptedEventInput,
      )
      expect(mockEsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent).toHaveBeenCalledWith(
        expectedOrderPaymentAcceptedEvent,
      )
    })

    it(`throws the same Error if
        EsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent throws an
        Error when it submits the Payment and the new Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockError = new Error('mockError')
      const mockEsRaiseOrderPaymentAcceptedEventClient =
        buildMockEsRaiseOrderPaymentAcceptedEventClient_throws(mockError)
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toStrictEqual(mockError)
    })

    it(`does not call
        EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent when it
        submits the Payment and the new Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent).not.toHaveBeenCalled()
    })

    /*
     *
     *
     ************************************************************
     * Test when it raises the Rejected event
     ************************************************************/
    it(`throws the same Error if the OrderPaymentRejectedEvent.validateAndBuild throws
        an Error when it submits the Payment and the new Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_REJECTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const mockError = new Error('mockError')
      jest.spyOn(OrderPaymentRejectedEvent, 'validateAndBuild').mockImplementationOnce(() => {
        throw mockError
      })
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toThrow(mockError)
    })

    it(`calls EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent a
        single time when it submits the Payment and the new Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_REJECTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent with
        the expected OrderPaymentRejectedEvent when it submits the Payment and the new
        Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_REJECTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { orderId, sku, units, price, userId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockOrderPaymentRejectedEventInput: OrderPaymentRejectedEventInput = { orderId, sku, units, price, userId }
      const expectedOrderPaymentRejectedEvent = OrderPaymentRejectedEvent.validateAndBuild(
        mockOrderPaymentRejectedEventInput,
      )
      expect(mockEsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent).toHaveBeenCalledWith(
        expectedOrderPaymentRejectedEvent,
      )
    })

    it(`throws the same Error if
        EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent throws an
        Error when it submits the Payment and the new Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_REJECTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockError = new Error('mockError')
      const mockEsRaiseOrderPaymentRejectedEventClient =
        buildMockEsRaiseOrderPaymentRejectedEventClient_throws(mockError)
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toStrictEqual(mockError)
    })

    it(`does not call
        EsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent when it
        submits the Payment and the new Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_REJECTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent).not.toHaveBeenCalled()
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected void if the execution path is successful when it submits
        the Payment and the new Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_ACCEPTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(result).toBeUndefined()
    })

    it(`returns the expected void if the execution path is successful when it submits
        the Payment and the new Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const paymentClientOutput: AxSubmitOrderPaymentClientOutput = {
        orderId: mockOrderId,
        paymentId: mockPaymentId,
        paymentStatus: 'PAYMENT_REJECTED',
      }
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves(paymentClientOutput)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(result).toBeUndefined()
    })

    it(`throws the expected PaymentFailedError if the execution path is successful when
        it submits the Payment and the new Payment is Failed`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockError = new Error('mockError')
      const paymentFailedError = PaymentFailedError.from(mockError, 'mockErrorMessage')
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_throws(paymentFailedError)
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toThrow(paymentFailedError)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when the Payment DOES exist as Accepted and it DOES NOT submit the Payment
   ************************************************************/
  describe(`Test when the Payment DOES exist as Accepted and it DOES NOT submit the Payment`, () => {
    // Use the same existing OrderPaymentData for all the tests in this scenario
    const mockExistingOrderPaymentData: OrderPaymentData = {
      orderId: mockOrderId,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
      createdAt: mockCreatedAt,
      updatedAt: mockUpdatedAt,
      paymentId: mockPaymentId,
      paymentStatus: 'PAYMENT_ACCEPTED',
      paymentRetries: 1,
    }

    it(`does not call AxSubmitOrderPaymentClient.submitOrderPayment when the existing
        Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockAxSubmitOrderPaymentClient.submitOrderPayment).not.toHaveBeenCalled()
    })

    it(`does not call DbRecordOrderPaymentClient.recordOrderPayment when the existing
        Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).not.toHaveBeenCalled()
    })

    it(`calls EsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent a
        single time when the existing Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent with
        the expected OrderPaymentAcceptedEvent when the existing Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { orderId, sku, units, price, userId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockOrderPaymentAcceptedEventInput: OrderPaymentAcceptedEventInput = { orderId, sku, units, price, userId }
      const expectedOrderPaymentAcceptedEvent = OrderPaymentAcceptedEvent.validateAndBuild(
        mockOrderPaymentAcceptedEventInput,
      )
      expect(mockEsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent).toHaveBeenCalledWith(
        expectedOrderPaymentAcceptedEvent,
      )
    })

    it(`throws the same Error if
        EsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent throws an
        Error when the existing Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockError = new Error('mockError')
      const mockEsRaiseOrderPaymentAcceptedEventClient =
        buildMockEsRaiseOrderPaymentAcceptedEventClient_throws(mockError)
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toStrictEqual(mockError)
    })

    it(`does not call
        EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent when the
        existing Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent).not.toHaveBeenCalled()
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected void if the execution path is successful when the existing
        Payment is Accepted`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(result).toBeUndefined()
    })

    it(`returns the expected void if the execution path is successful when the existing
        Payment is Accepted and there is a race condition that reached
        DbRecordOrderPaymentClient.recordOrderPayment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockError = PaymentAlreadyAcceptedError.from()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_throws(mockError)
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      jest.spyOn(SubmitOrderPaymentCommand, 'validateAndBuild').mockReturnValueOnce({
        commandData: {
          orderId: mockOrderId,
          sku: mockSku,
          units: mockUnits,
          price: mockPrice,
          userId: mockUserId,
        },
        options: {},
      })
      jest.spyOn(RecordOrderPaymentCommand, 'validateAndBuild').mockReturnValueOnce({
        commandData: {
          orderId: mockOrderId,
          sku: mockSku,
          units: mockUnits,
          price: mockPrice,
          userId: mockUserId,
          createdAt: mockCreatedAt,
          updatedAt: mockUpdatedAt,
          paymentId: mockPaymentId,
          paymentStatus: 'PAYMENT_ACCEPTED',
          paymentRetries: 1,
        },
        options: {},
      })
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(result).toBeUndefined()
    })
  })

  /*
   *
   *
   ************************************************************
   * Test when the Payment DOES exist as Rejected and it DOES NOT submit the Payment
   ************************************************************/
  describe(`Test when the Payment DOES exist as Rejected and it DOES NOT submit the Payment`, () => {
    // Use the same existing OrderPaymentData for all the tests in this scenario
    const mockExistingOrderPaymentData: OrderPaymentData = {
      orderId: mockOrderId,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
      createdAt: mockCreatedAt,
      updatedAt: mockUpdatedAt,
      paymentId: mockPaymentId,
      paymentStatus: 'PAYMENT_REJECTED',
      paymentRetries: 1,
    }

    it(`does not call AxSubmitOrderPaymentClient.submitOrderPayment when the existing
        Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockAxSubmitOrderPaymentClient.submitOrderPayment).not.toHaveBeenCalled()
    })

    it(`does not call DbRecordOrderPaymentClient.recordOrderPayment when the existing
        Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockDbRecordOrderPaymentClient.recordOrderPayment).not.toHaveBeenCalled()
    })

    it(`does not call
        EsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent when the
        existing Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent).not.toHaveBeenCalled()
    })

    it(`calls EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent a
        single time when the existing Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(mockEsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent).toHaveBeenCalledTimes(1)
    })

    it(`calls EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent with
        the expected OrderPaymentRejectedEvent when the existing Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      const { orderId, sku, units, price, userId } = mockIncomingOrderStockAllocatedEvent.eventData
      const mockOrderPaymentRejectedEventInput: OrderPaymentRejectedEventInput = { orderId, sku, units, price, userId }
      const expectedOrderPaymentRejectedEvent = OrderPaymentRejectedEvent.validateAndBuild(
        mockOrderPaymentRejectedEventInput,
      )
      expect(mockEsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent).toHaveBeenCalledWith(
        expectedOrderPaymentRejectedEvent,
      )
    })

    it(`throws the same Error if
        EsRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent throws an
        Error when the existing Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockError = new Error('mockError')
      const mockEsRaiseOrderPaymentRejectedEventClient =
        buildMockEsRaiseOrderPaymentRejectedEventClient_throws(mockError)
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      await expect(
        processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent),
      ).rejects.toStrictEqual(mockError)
    })

    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected void if the execution path is successful when the existing
        Payment is Rejected`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_resolves()
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(result).toBeUndefined()
    })

    it(`returns the expected void if the execution path is successful when the existing
        Payment is Rejected and there is a race condition that reached
        DbRecordOrderPaymentClient.recordOrderPayment`, async () => {
      const mockDbGetOrderPaymentClient = buildMockDbGetOrderPaymentClient_resolves(mockExistingOrderPaymentData)
      const mockAxSubmitOrderPaymentClient = buildMockAxSubmitOrderPaymentClient_resolves()
      const mockError = PaymentAlreadyRejectedError.from()
      const mockDbRecordOrderPaymentClient = buildMockDbRecordOrderPaymentClient_throws(mockError)
      const mockEsRaiseOrderPaymentAcceptedEventClient = buildMockEsRaiseOrderPaymentAcceptedEventClient_resolves()
      const mockEsRaiseOrderPaymentRejectedEventClient = buildMockEsRaiseOrderPaymentRejectedEventClient_resolves()
      const processOrderPaymentWorkerService = new ProcessOrderPaymentWorkerService(
        mockDbGetOrderPaymentClient,
        mockAxSubmitOrderPaymentClient,
        mockDbRecordOrderPaymentClient,
        mockEsRaiseOrderPaymentAcceptedEventClient,
        mockEsRaiseOrderPaymentRejectedEventClient,
      )
      jest.spyOn(SubmitOrderPaymentCommand, 'validateAndBuild').mockReturnValueOnce({
        commandData: {
          orderId: mockOrderId,
          sku: mockSku,
          units: mockUnits,
          price: mockPrice,
          userId: mockUserId,
        },
        options: {},
      })
      jest.spyOn(RecordOrderPaymentCommand, 'validateAndBuild').mockReturnValueOnce({
        commandData: {
          orderId: mockOrderId,
          sku: mockSku,
          units: mockUnits,
          price: mockPrice,
          userId: mockUserId,
          createdAt: mockCreatedAt,
          updatedAt: mockUpdatedAt,
          paymentId: mockPaymentId,
          paymentStatus: 'PAYMENT_REJECTED',
          paymentRetries: 1,
        },
        options: {},
      })
      const result = await processOrderPaymentWorkerService.processOrderPayment(mockIncomingOrderStockAllocatedEvent)
      expect(result).toBeUndefined()
    })
  })
})
