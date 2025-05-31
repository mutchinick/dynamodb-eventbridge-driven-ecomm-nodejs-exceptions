import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent, SQSBatchResponse, SQSEvent, SQSRecord } from 'aws-lambda'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidOperationError } from '../../errors/AppError'
import { OrderEventName } from '../../model/OrderEventName'
import { IncomingOrderEvent } from '../model/IncomingOrderEvent'
import { ISyncOrderWorkerService } from '../SyncOrderWorkerService/SyncOrderWorkerService'
import { SyncOrderWorkerController } from './SyncOrderWorkerController'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()

function buildMockIncomingOrderEvent(id: string): TypeUtilsMutable<IncomingOrderEvent> {
  const incomingOrderEvent: TypeUtilsMutable<IncomingOrderEvent> = {
    eventName: OrderEventName.ORDER_PLACED_EVENT,
    eventData: {
      orderId: `mockOrderId-${id}`,
      sku: `mockSku-${id}`,
      units: 2,
      price: 99.99,
      userId: `mockUserId-${id}`,
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return incomingOrderEvent
}

function buildMockIncomingOrderEvents(ids: string[]): TypeUtilsMutable<IncomingOrderEvent>[] {
  return ids.map((id) => buildMockIncomingOrderEvent(id))
}

type MockEventDetail = {
  awsRegion: string
  eventID: string
  eventName: 'INSERT'
  eventSource: 'aws:dynamodb'
  eventVersion: string
  dynamodb: {
    NewImage: Record<string, AttributeValue>
  }
}

// COMBAK: Work a simpler way to build/wrap/unwrap these EventBridgeEvents (maybe some abstraction util?)
function buildMockEventBridgeEvent(
  id: string,
  incomingOrderEvent: IncomingOrderEvent,
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
        NewImage: marshall(incomingOrderEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

function buildMockEventBridgeEvents(
  ids: string[],
  incomingOrderEvents: IncomingOrderEvent[],
): EventBridgeEvent<string, MockEventDetail>[] {
  return ids.map((id, index) => buildMockEventBridgeEvent(id, incomingOrderEvents[index]))
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
  mockIncomingOrderEvents: TypeUtilsMutable<IncomingOrderEvent>[]
  mockEventBridgeEvents: EventBridgeEvent<string, MockEventDetail>[]
  mockSqsRecords: SQSRecord[]
  mockSqsEvent: SQSEvent
} {
  const mockIncomingOrderEvents = buildMockIncomingOrderEvents(ids)
  const mockEventBridgeEvents = buildMockEventBridgeEvents(ids, mockIncomingOrderEvents)
  const mockSqsRecords = buildMockSqsRecords(ids, mockEventBridgeEvents)
  const mockSqsEvent = buildMockSqsEvent(mockSqsRecords)
  return {
    mockIncomingOrderEvents,
    mockEventBridgeEvents,
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
function buildMockSyncOrderWorkerService_resolves(): ISyncOrderWorkerService {
  return { syncOrder: jest.fn() }
}

function buildMockSyncOrderWorkerService_throwsOnData(error?: unknown): ISyncOrderWorkerService {
  return {
    syncOrder: jest.fn().mockImplementation((incomingOrderEvent: IncomingOrderEvent) => {
      const shouldThrow = Object.values(incomingOrderEvent.eventData).reduce(
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

describe(`Orders Service SyncOrderWorker SyncOrderWorkerController tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test SQSEvent edge cases
   ************************************************************/
  it(`does not throw if the input SQSEvent is valid`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const { mockSqsEvent } = buildMockTestObjects([])
    await expect(syncOrderWorkerController.syncOrders(mockSqsEvent)).resolves.not.toThrow()
  })

  it(`fails to call SyncOrderWorkerService.syncOrder if the input SQSEvent is
      undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsEvent = undefined as never
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsEvent = undefined as never
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SyncOrderWorkerService.syncOrder if the input SQSEvent is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsEvent = null as never
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent is
      null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsEvent = null as never
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test SQSEvent.Records edge cases
   ************************************************************/
  it(`fails to call SyncOrderWorkerService.syncOrder if the input SQSEvent records are
      missing`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsEvent = {} as never
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are missing`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsEvent = {} as never
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SyncOrderWorkerService.syncOrder if the input SQSEvent records are
      undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsEvent = buildMockSqsEvent(undefined)
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsEvent = buildMockSqsEvent(undefined)
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SyncOrderWorkerService.syncOrder if the input SQSEvent records are
      null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsEvent = buildMockSqsEvent(null)
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsEvent = buildMockSqsEvent(null)
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SyncOrderWorkerService.syncOrder if the input SQSEvent records are
      empty`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsEvent = buildMockSqsEvent([])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSEvent
      records are empty`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsEvent = buildMockSqsEvent([])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test SQSRecord.body edge cases
   ************************************************************/
  it(`fails to call SyncOrderWorkerService.syncOrder if the input SQSRecord.body is
      undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsRecord = { body: undefined } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SyncOrderWorkerService.syncOrder if the input SQSRecord.body is
      null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsRecord = { body: null } as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SyncOrderWorkerService.syncOrder if the input SQSRecord.body is
      not a valid JSON`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the input SQSRecord.body
      is not a valid JSON`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockSqsRecord = {} as unknown as SQSRecord
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    mockSqsEvent.Records[0].body = 'mockInvalidValue'
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent edge cases
   ************************************************************/
  it(`fails to call SyncOrderWorkerService.syncOrder if the input IncomingOrderEvent
      is invalid`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = 'mockInvalidValue' as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input IncomingOrderEvent is
      invalid`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = 'mockInvalidValue' as unknown as IncomingOrderEvent
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent.eventName edge cases
   ************************************************************/
  it(`fails to call SyncOrderWorkerService.syncOrder if the input
      IncomingOrderEvent.eventName is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderEvent.eventName is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SyncOrderWorkerService.syncOrder if the input
      IncomingOrderEvent.eventName is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderEvent.eventName is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent.createdAt edge cases
   ************************************************************/
  it(`fails to call SyncOrderWorkerService.syncOrder if the input
      IncomingOrderEvent.createdAt is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderEvent.createdAt is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.createdAt = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SyncOrderWorkerService.syncOrder if the input
      IncomingOrderEvent.createdAt is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.createdAt = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderEvent.createdAt is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.createdAt = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent.updatedAt edge cases
   ************************************************************/
  it(`fails to call SyncOrderWorkerService.syncOrder if the input
      IncomingOrderEvent.updatedAt is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderEvent.updatedAt is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.updatedAt = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SyncOrderWorkerService.syncOrder if the input
      IncomingOrderEvent.updatedAt is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderEvent.updatedAt is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.updatedAt = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent.eventData edge cases
   ************************************************************/
  it(`fails to call SyncOrderWorkerService.syncOrder if the input
      IncomingOrderEvent.eventData is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderEvent.eventData is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SyncOrderWorkerService.syncOrder if the input
      IncomingOrderEvent.eventData is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderEvent.eventData is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent.eventData.orderId edge cases
   ************************************************************/
  it(`fails to call SyncOrderWorkerService.syncOrder if the input
      IncomingOrderEvent.eventData.orderId is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.orderId = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderEvent.eventData.orderId is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.orderId = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SyncOrderWorkerService.syncOrder if the input
      IncomingOrderEvent.eventData.orderId is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.orderId = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderEvent.eventData.orderId is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.orderId = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent.eventData.sku edge cases
   ************************************************************/
  it(`fails to call SyncOrderWorkerService.syncOrder if the input
      IncomingOrderEvent.eventData.sku is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.sku = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderEvent.eventData.sku is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.sku = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SyncOrderWorkerService.syncOrder if the input
      IncomingOrderEvent.eventData.sku is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.sku = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderEvent.eventData.sku is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.sku = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent.eventData.units edge cases
   ************************************************************/
  it(`fails to call SyncOrderWorkerService.syncOrder if the input
      IncomingOrderEvent.eventData.units is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.units = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderEvent.eventData.units is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.units = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SyncOrderWorkerService.syncOrder if the input
      IncomingOrderEvent.eventData.units is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.units = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderEvent.eventData.units is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.units = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent.eventData.price edge cases
   ************************************************************/
  it(`fails to call SyncOrderWorkerService.syncOrder if the input
      IncomingOrderEvent.eventData.price is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.price = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderEvent.eventData.price is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.price = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SyncOrderWorkerService.syncOrder if the input
      IncomingOrderEvent.eventData.price is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.price = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderEvent.eventData.price is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.price = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingOrderEvent.eventData.userId edge cases
   ************************************************************/
  it(`fails to call SyncOrderWorkerService.syncOrder if the input
      IncomingOrderEvent.eventData.userId is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.userId = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderEvent.eventData.userId is undefined`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.userId = undefined
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`fails to call SyncOrderWorkerService.syncOrder if the input
      IncomingOrderEvent.eventData.userId is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.userId = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).not.toHaveBeenCalled()
  })

  it(`returns no SQSBatchResponse.batchItemFailures if the input
      IncomingOrderEvent.eventData.userId is null`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockId = 'AA'
    const mockIncomingOrderEvent = buildMockIncomingOrderEvent(mockId)
    mockIncomingOrderEvent.eventData.userId = null
    const mockEventBridgeEvent = buildMockEventBridgeEvent(mockId, mockIncomingOrderEvent)
    const mockSqsRecord = buildMockSqsRecord(mockId, mockEventBridgeEvent)
    const mockSqsEvent = buildMockSqsEvent([mockSqsRecord])
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls SyncOrderWorkerService.syncOrder a single time for an SQSEvent with a
      single record`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).toHaveBeenCalledTimes(1)
  })

  it(`calls SyncOrderWorkerService.syncOrder multiple times for an SQSEvent with
      multiple records`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).toHaveBeenCalledTimes(mockSqsRecords.length)
  })

  it(`calls SyncOrderWorkerService.syncOrder with the expected input`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA', 'BB', 'CC']
    const { mockIncomingOrderEvents, mockSqsEvent } = buildMockTestObjects(mockIds)
    await syncOrderWorkerController.syncOrders(mockSqsEvent)
    expect(mockSyncOrderWorkerService.syncOrder).toHaveBeenNthCalledWith(1, mockIncomingOrderEvents[0])
    expect(mockSyncOrderWorkerService.syncOrder).toHaveBeenNthCalledWith(2, mockIncomingOrderEvents[1])
    expect(mockSyncOrderWorkerService.syncOrder).toHaveBeenNthCalledWith(3, mockIncomingOrderEvents[2])
  })

  /*
   *
   *
   ************************************************************
   * Test transient/non-transient edge cases
   ************************************************************/
  it(`returns an empty SQSBatchResponse.batchItemFailures if the
      SyncOrderWorkerService does not throw`, async () => {
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_resolves()
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA', 'BB', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the
      SyncOrderWorkerService throws a non-transient Error (test 1)`, async () => {
    const nonTransientError = InvalidOperationError.nonTransient()
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_throwsOnData(nonTransientError)
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA-THROW', 'BB-THROW', 'CC']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the
      SyncOrderWorkerService throws a non-transient Error (test 2)`, async () => {
    const nonTransientError = InvalidOperationError.nonTransient()
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_throwsOnData(nonTransientError)
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA', 'BB-THROW', 'CC', 'DD', 'EE-THROW']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns an empty SQSBatchResponse.batchItemFailures if the
      SyncOrderWorkerService throws a non-transient Error (test 3)`, async () => {
    const nonTransientError = InvalidOperationError.nonTransient()
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_throwsOnData(nonTransientError)
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA', 'BB-THROW', 'CC-THROW', 'DD-THROW', 'EE-THROW']
    const { mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = { batchItemFailures: [] }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns the expected response SQSBatchResponse.batchItemFailures if the
      SyncOrderWorkerService throws a transient Error (test 1)`, async () => {
    const transientError = InvalidOperationError.transient()
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_throwsOnData(transientError)
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA-THROW', 'BB-THROW', 'CC']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns the expected response SQSBatchResponse.batchItemFailures if the
      SyncOrderWorkerService throws a transient Error (test 2)`, async () => {
    const transientError = InvalidOperationError.transient()
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_throwsOnData(transientError)
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA', 'BB-THROW', 'CC', 'DD', 'EE-THROW']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns the expected response SQSBatchResponse.batchItemFailures if the
      SyncOrderWorkerService throws a transient Error (test 3)`, async () => {
    const transientError = InvalidOperationError.transient()
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_throwsOnData(transientError)
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA', 'BB-THROW', 'CC-THROW', 'DD-THROW', 'EE-THROW']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[2].messageId },
        { itemIdentifier: mockSqsRecords[3].messageId },
        { itemIdentifier: mockSqsRecords[4].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })

  it(`returns all SQSBatchResponse.batchItemFailures if the SyncOrderWorkerService
      throws all and only transient Error`, async () => {
    const transientError = InvalidOperationError.transient()
    const mockSyncOrderWorkerService = buildMockSyncOrderWorkerService_throwsOnData(transientError)
    const syncOrderWorkerController = new SyncOrderWorkerController(mockSyncOrderWorkerService)
    const mockIds = ['AA-THROW', 'BB-THROW', 'CC-THROW']
    const { mockSqsRecords, mockSqsEvent } = buildMockTestObjects(mockIds)
    const response = await syncOrderWorkerController.syncOrders(mockSqsEvent)
    const expectedResponse: SQSBatchResponse = {
      batchItemFailures: [
        { itemIdentifier: mockSqsRecords[0].messageId },
        { itemIdentifier: mockSqsRecords[1].messageId },
        { itemIdentifier: mockSqsRecords[2].messageId },
      ],
    }
    expect(response).toStrictEqual(expectedResponse)
  })
})
