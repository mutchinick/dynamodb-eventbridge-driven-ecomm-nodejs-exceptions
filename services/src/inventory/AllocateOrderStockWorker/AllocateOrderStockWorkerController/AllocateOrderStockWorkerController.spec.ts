import { marshall } from '@aws-sdk/util-dynamodb'
import { AttributeValue, EventBridgeEvent, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidOperationError } from '../../errors/AppError'
import { InventoryEventName } from '../../model/InventoryEventName'
import { IAllocateOrderStockWorkerService } from '../AllocateOrderStockWorkerService/AllocateOrderStockWorkerService'
import { IncomingOrderCreatedEvent } from '../model/IncomingOrderCreatedEvent'
import { AllocateOrderStockWorkerController } from './AllocateOrderStockWorkerController'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockIncomingOrderCreatedEvent(id: string): TypeUtilsMutable<IncomingOrderCreatedEvent> {
  const incomingOrderCreatedEvent: TypeUtilsMutable<IncomingOrderCreatedEvent> = {
    eventName: InventoryEventName.ORDER_CREATED_EVENT,
    eventData: {
      orderId: `mockOrderId-${id}`,
      sku: `mockSku-${id}`,
      units: 2,
      price: 10.33,
      userId: `mockUserId-${id}`,
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return incomingOrderCreatedEvent
}

function buildMockIncomingOrderCreatedEvents(ids: string[]): TypeUtilsMutable<IncomingOrderCreatedEvent>[] {
  return ids.map((id) => buildMockIncomingOrderCreatedEvent(id))
}

type MockEventDetail = {
  awsRegion: string
  eventID: string
  eventName: 'INSERT'
  eventSource: 'aws:dynamodb'
  eventVersion: string
  dynamodb: {
    NewImage: AttributeValue | Record<string, AttributeValue>
  }
}

// COMBAK: Work a simpler way to build/wrap/unwrap these EventBrideEvents (maybe some abstraction util?)
function buildMockEventBrideEvent(
  id: string,
  incomingOrderCreatedEvent: IncomingOrderCreatedEvent,
): EventBridgeEvent<string, MockEventDetail> {
  const mockEventBridgeEvent: EventBridgeEvent<string, MockEventDetail> = {
    'detail-type': 'mockDetailType',
    account: 'mockAccount',
    id: `mockId-${id}`,
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
        NewImage: marshall(incomingOrderCreatedEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

function buildMockEventBrideEvents(
  ids: string[],
  incomingOrderCreatedEvents: IncomingOrderCreatedEvent[],
): EventBridgeEvent<string, MockEventDetail>[] {
  return ids.map((id, index) => buildMockEventBrideEvent(id, incomingOrderCreatedEvents[index]))
}

function buildMockSqsRecord(id: string, eventBridgeEvent: EventBridgeEvent<string, MockEventDetail>): SQSRecord {
  return {
    messageId: `mockMessageId-${id}`,
    body: JSON.stringify(eventBridgeEvent),
  } as unknown as SQSRecord
}

function buildMockSqsRecords(
  ids: string[],
  eventBridgeEvents: EventBridgeEvent<string, MockEventDetail>[],
): SQSRecord[] {
  return ids.map((id, index) => buildMockSqsRecord(id, eventBridgeEvents[index]))
}

function buildMockSqsEvent(sqsRecords: SQSRecord[]): SQSEvent {
  return { Records: sqsRecords }
}

function buildMockTestObjects(ids: string[]): {
  mockIncomingOrderCreatedEvents: TypeUtilsMutable<IncomingOrderCreatedEvent>[]
  mockEventBrideEvents: EventBridgeEvent<string, MockEventDetail>[]
  mockSqsRecords: SQSRecord[]
  mockSqsEvent: SQSEvent
} {
  const mockIncomingOrderCreatedEvents = buildMockIncomingOrderCreatedEvents(ids)
  const mockEventBrideEvents = buildMockEventBrideEvents(ids, mockIncomingOrderCreatedEvents)
  const mockSqsRecords = buildMockSqsRecords(ids, mockEventBrideEvents)
  const mockSqsEvent = buildMockSqsEvent(mockSqsRecords)
  return {
    mockIncomingOrderCreatedEvents,
    mockEventBrideEvents,
    mockSqsRecords,
    mockSqsEvent,
  }
}

/*
 *
 *
 ************************************************************
 * Mock services
 ************************************************************/
function buildMockAllocateOrderStockWorkerService_resolves(): IAllocateOrderStockWorkerService {
  return { allocateOrderStock: jest.fn() }
}

function buildMockAllocateOrderStockWorkerService_throwsOnData(error?: unknown): IAllocateOrderStockWorkerService {
  return {
    allocateOrderStock: jest.fn().mockImplementation((incomingOrderCreatedEvent: IncomingOrderCreatedEvent) => {
      const shouldThrow = Object.values(incomingOrderCreatedEvent.eventData).reduce(
        (acc, cur) => (acc = acc || String(cur).endsWith('-THROW')),
        false,
      )
      if (shouldThrow) {
        return Promise.reject(error)
      }
      return Promise.resolve()
    }),
  }
}

describe(`Inventory Service AllocateOrderStockWorker AllocateOrderStockWorkerController
          tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test SQSEvent edge cases
   ************************************************************/
  it(`does not throw the input SQSEvent is valid`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const { mockSqsEvent } = buildMockTestObjects([])
    await expect(allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)).resolves.not.toThrow()
  })

  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      SQSEvent is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsEvent = undefined as never
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsEvent = undefined as never
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      SQSEvent is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsEvent = null as never
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsEvent = null as never
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test SQSEvent.Records edge cases
   ************************************************************/
  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      SQSEvent records are missing`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsEvent = {} as never
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are missing`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsEvent = {} as never
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      SQSEvent records are undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(undefined)
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(undefined)
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      SQSEvent records are null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(null)
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent(null)
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      SQSEvent records are empty`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent([])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are empty`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsEvent = buildMockSqsEvent([])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test SQSRecord.body edge cases
   ************************************************************/
  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      SQSRecord.body is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      SQSRecord.body is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      SQSRecord.body is not a valid JSON`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is not a valid JSON`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent edge cases
   ************************************************************/
  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent is invalid`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = 'mockInvalidValue' as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent is invalid`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = 'mockInvalidValue' as unknown as IncomingOrderCreatedEvent
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent.eventName edge cases
   ************************************************************/
  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent.eventName is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent.eventName is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent.eventName is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent.eventName is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent.createdAt edge cases
   ************************************************************/
  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent.createdAt is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent.createdAt is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent.createdAt is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.createdAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent.createdAt is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.createdAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent.updatedAt edge cases
   ************************************************************/
  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent.updatedAt is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent.updatedAt is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent.updatedAt is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent.updatedAt is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent.eventData edge cases
   ************************************************************/
  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent.eventData is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent.eventData is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent.eventData is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent.eventData is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent.eventData.orderId edge cases
   ************************************************************/
  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent.eventData.orderId is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.orderId = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent.eventData.orderId is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.orderId = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent.eventData.orderId is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.orderId = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent.eventData.orderId is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.orderId = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent.eventData.sku edge cases
   ************************************************************/
  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent.eventData.sku is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.sku = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent.eventData.sku is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.sku = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent.eventData.sku is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.sku = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent.eventData.sku is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.sku = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent.eventData.units edge cases
   ************************************************************/
  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent.eventData.units is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.units = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent.eventData.units is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.units = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent.eventData.units is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.units = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent.eventData.units is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.units = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent.eventData.price edge cases
   ************************************************************/
  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent.eventData.price is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.price = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent.eventData.price is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.price = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent.eventData.price is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.price = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent.eventData.price is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.price = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderCreatedEvent.eventData.userId edge cases
   ************************************************************/
  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent.eventData.userId is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.userId = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent.eventData.userId is undefined`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.userId = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`fails to call AllocateOrderStockWorkerService.allocateOrderStock if the input
      IncomingOrderCreatedEvent.eventData.userId is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.userId = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderCreatedEvent.eventData.userId is null`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockId = 'AA'
    const mockIncomingOrderCreatedEvent = buildMockIncomingOrderCreatedEvent(mockId)
    mockIncomingOrderCreatedEvent.eventData.userId = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockId, mockIncomingOrderCreatedEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls AllocateOrderStockWorkerService.allocateOrderStock a single time for an
      SQSEvent with a single record`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).toHaveBeenCalledTimes(1)
  })

  it(`calls AllocateOrderStockWorkerService.allocateOrderStock multiple times for an
      SQSEvent with multiple records`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).toHaveBeenCalledTimes(mockSqsRecords.length)
  })

  it(`calls AllocateOrderStockWorkerService.allocateOrderStock with the
      expectedResponse input`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockIncomingOrderCreatedEvents, mockSqsEvent } = buildMockTestObjects(mockIds)
    await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).toHaveBeenNthCalledWith(
      1,
      mockIncomingOrderCreatedEvents[0],
    )
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).toHaveBeenNthCalledWith(
      2,
      mockIncomingOrderCreatedEvents[1],
    )
    expect(mockAllocateOrderStockWorkerService.allocateOrderStock).toHaveBeenNthCalledWith(
      3,
      mockIncomingOrderCreatedEvents[2],
    )
  })

  /*
   *
   *
   ************************************************************
   * Test transient/non-transient edge cases
   ************************************************************/
  it(`returns an empty SQSBatchResponse.batchItemFailures if the
      AllocateOrderStockWorkerService does not throw`, async () => {
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_resolves()
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the
      AllocateOrderStockWorkerService throws a non-transient Error (test 1)`, async () => {
    const nonTransientError = InvalidOperationError.nonTransient()
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_throwsOnData(nonTransientError)
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA-THROW', 'BB-THROW', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the
      AllocateOrderStockWorkerService throws a non-transient Error (test 2)`, async () => {
    const nonTransientError = InvalidOperationError.nonTransient()
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_throwsOnData(nonTransientError)
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA', 'BB-THROW', 'CC', 'DD', 'EE-THROW']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the
      AllocateOrderStockWorkerService throws a non-transient Error (test 3)`, async () => {
    const nonTransientError = InvalidOperationError.nonTransient()
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_throwsOnData(nonTransientError)
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA', 'BB-THROW', 'CC-THROW', 'DD-THROW', 'EE-THROW']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`returns the expected response SQSBatchResponse.batchItemFailures if the
      AllocateOrderStockWorkerService throws a transient Error (test 1)`, async () => {
    const transientError = InvalidOperationError.transient()
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_throwsOnData(transientError)
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA-THROW', 'BB-THROW', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
      ],
    }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`returns the expected response SQSBatchResponse.batchItemFailures if the
      AllocateOrderStockWorkerService throws a transient Error (test 2)`, async () => {
    const transientError = InvalidOperationError.transient()
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_throwsOnData(transientError)
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA', 'BB-THROW', 'CC', 'DD', 'EE-THROW']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`returns the expected response SQSBatchResponse.batchItemFailures if the
      AllocateOrderStockWorkerService throws a transient Error (test 3)`, async () => {
    const transientError = InvalidOperationError.transient()
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_throwsOnData(transientError)
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA', 'BB-THROW', 'CC-THROW', 'DD-THROW', 'EE-THROW']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[2].messageId },
        { itemIdentifier: mockSqsRecords[3].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(result).toStrictEqual(expectedResponse)
  })

  it(`returns all SQSBatchResponse.batchItemFailures if the
      AllocateOrderStockWorkerService throws all and only transient Error`, async () => {
    const transientError = InvalidOperationError.transient()
    const mockAllocateOrderStockWorkerService = buildMockAllocateOrderStockWorkerService_throwsOnData(transientError)
    const allocateOrderStockWorkerController = new AllocateOrderStockWorkerController(
      mockAllocateOrderStockWorkerService,
    )
    const mockIds = ['AA-THROW', 'BB-THROW', 'CC-THROW']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const result = await allocateOrderStockWorkerController.allocateOrdersStock(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[2].messageId },
      ],
    }
    expect(result).toStrictEqual(expectedResponse)
  })
})
