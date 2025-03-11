import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { DuplicateEventRaisedError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderCreatedEvent } from '../model/OrderCreatedEvent'
import { EsRaiseOrderCreatedEventClient } from './EsRaiseOrderCreatedEventClient'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

const mockValidEvent: OrderCreatedEvent = {
  eventName: 'mockEventName' as never,
  createdAt: mockDate,
  updatedAt: mockDate,
  eventData: {
    orderId: 'mockOrderId',
    orderStatus: 'mockOrderStatus' as never,
    sku: 'mockSku',
    units: 2,
    price: 3.98,
    userId: 'mockUserId',
    createdAt: mockDate,
    updatedAt: mockDate,
  },
}

const expectedDdbDocClientInput = new PutCommand({
  TableName: mockEventStoreTableName,
  Item: {
    pk: `ORDER_ID#${mockValidEvent.eventData.orderId}`,
    sk: `EVENT#${mockValidEvent.eventName}`,
    _tn: '#EVENT',
    ...mockValidEvent,
  },
  ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
})

function buildMockDdbDocClient_send_resolves(): DynamoDBDocumentClient {
  return { send: jest.fn() } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

describe(`Orders Service SyncOrderWorker EsRaiseOrderCreatedEventClient tests`, () => {
  //
  // Test OrderCreatedEvent edge cases
  //
  it(`does not throw if the input OrderCreatedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    await expect(esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockValidEvent)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderCreatedEvent is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as OrderCreatedEvent
    const resultPromise = esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderCreatedEvent is empty`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const mockTestEvent = {} as OrderCreatedEvent
    const resultPromise = esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderCreatedEvent.eventData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const mockTestEvent = { eventData: undefined } as OrderCreatedEvent
    const resultPromise = esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderCreatedEvent.eventData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const mockTestEvent = { eventData: null } as OrderCreatedEvent
    const resultPromise = esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    await esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it(`throws a transient UnrecognizedError with the original Error as cause
      if DynamoDBDocumentClient.send throws a generic Error`, async () => {
    const error = new Error('mockError')
    const mockDdbDocClient = buildMockDdbDocClient_send_throws(error)
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const expectedError = UnrecognizedError.from(error)
    const resultPromise = esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockValidEvent)
    await expect(resultPromise).rejects.toThrow(expectedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  it(`throws a non-transient DuplicateEventRaisedError if DynamoDBDocumentClient.send
      throws a ConditionalCheckFailedException`, async () => {
    const error = new ConditionalCheckFailedException({ $metadata: {}, message: '' })
    const mockDdbDocClient = buildMockDdbDocClient_send_throws(error)
    const esRaiseOrderCreatedEventClient = new EsRaiseOrderCreatedEventClient(mockDdbDocClient)
    const resultPromise = esRaiseOrderCreatedEventClient.raiseOrderCreatedEvent(mockValidEvent)
    await expect(resultPromise).rejects.toThrow(DuplicateEventRaisedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })
})
