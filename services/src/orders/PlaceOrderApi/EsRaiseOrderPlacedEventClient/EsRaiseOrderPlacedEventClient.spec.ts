// Review error handling
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { DuplicateEventRaisedError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderPlacedEvent } from '../model/OrderPlacedEvent'
import { EsRaiseOrderPlacedEventClient } from './EsRaiseOrderPlacedEventClient'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toUTCString()

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

const mockValidEvent: OrderPlacedEvent = {
  eventName: OrderEventName.ORDER_PLACED_EVENT,
  createdAt: mockDate,
  updatedAt: mockDate,
  eventData: {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
    price: 3.98,
    userId: 'mockUserId',
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

describe(`Orders Service PlaceOrderApi EsRaiseOrderPlacedEventClient tests`, () => {
  //
  // Test OrderPlacedEvent edge cases
  //
  it(`does not throw if the input OrderPlacedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    await expect(esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockValidEvent)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderPlacedEvent is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as OrderPlacedEvent
    const resultPromise = esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderPlacedEvent is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    const mockTestEvent = null as OrderPlacedEvent
    const resultPromise = esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderPlacedEvent is empty`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    const mockTestEvent = {} as OrderPlacedEvent
    const resultPromise = esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const ddbPlaceOrderEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    await ddbPlaceOrderEventClient.raiseOrderPlacedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const ddbPlaceOrderEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    await ddbPlaceOrderEventClient.raiseOrderPlacedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send
      throws a generic Error`, async () => {
    const error = new Error('')
    const mockDdbDocClient = buildMockDdbDocClient_send_throws(error)
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    const resultPromise = esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockValidEvent)
    await expect(resultPromise).rejects.toThrow(UnrecognizedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  it(`throws a non-transient DuplicateEventRaisedError if DynamoDBDocumentClient.send
      throws a ConditionalCheckFailedException`, async () => {
    const error = new ConditionalCheckFailedException({ $metadata: {}, message: '' })
    const mockDdbDocClient = buildMockDdbDocClient_send_throws(error)
    const esRaiseOrderPlacedEventClient = new EsRaiseOrderPlacedEventClient(mockDdbDocClient)
    const resultPromise = esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(mockValidEvent)
    await expect(resultPromise).rejects.toThrow(DuplicateEventRaisedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })
})
