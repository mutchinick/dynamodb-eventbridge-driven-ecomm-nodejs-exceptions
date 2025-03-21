import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { DuplicateEventRaisedError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderPlacedEvent } from '../model/OrderPlacedEvent'
import { EsRaiseOrderPlacedEventClient } from './EsRaiseOrderPlacedEventClient'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

function buildMockOrderPlacedEvent(): TypeUtilsMutable<OrderPlacedEvent> {
  const mockClass = OrderPlacedEvent.validateAndBuild({
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
    price: 3.98,
    userId: 'mockUserId',
  })
  return mockClass
}

const mockOrderPlacedEvent = buildMockOrderPlacedEvent()

const expectedDdbDocClientInput = new PutCommand({
  TableName: mockEventStoreTableName,
  Item: {
    pk: `ORDER_ID#${mockOrderPlacedEvent.eventData.orderId}`,
    sk: `EVENT#${mockOrderPlacedEvent.eventName}`,
    _tn: '#EVENT',
    ...mockOrderPlacedEvent,
  },
  ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
})

//
// Mock clients
//
function buildMockDdbDocClient_resolves(): DynamoDBDocumentClient {
  return { send: jest.fn() } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

describe(`Orders Service PlaceOrderApi EsRaiseOrderPlacedEventClient tests`, () => {
  //
  // Test OrderPlacedEvent edge cases
  //
  it(`does not throw if the input OrderPlacedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    await expect(esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockOrderPlacedEvent)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderPlacedEvent is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as OrderPlacedEvent
    const resultPromise = esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderPlacedEvent is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    const mockTestEvent = null as OrderPlacedEvent
    const resultPromise = esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderPlacedEvent.eventData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockOrderPlacedEvent()
    mockTestEvent.eventData = undefined
    const resultPromise = esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderPlacedEvent.eventData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockOrderPlacedEvent()
    mockTestEvent.eventData = null
    const resultPromise = esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    await esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockOrderPlacedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    await esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockOrderPlacedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send
      throws a native Error`, async () => {
    const mockError = new Error('mockError')
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    const resultPromise = esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockOrderPlacedEvent)
    await expect(resultPromise).rejects.toThrow(UnrecognizedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  it(`throws a non-transient DuplicateEventRaisedError if DynamoDBDocumentClient.send
      throws a ConditionalCheckFailedException`, async () => {
    const mockError = new ConditionalCheckFailedException({ $metadata: {}, message: '' })
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    const resultPromise = esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockOrderPlacedEvent)
    await expect(resultPromise).rejects.toThrow(DuplicateEventRaisedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })
})
