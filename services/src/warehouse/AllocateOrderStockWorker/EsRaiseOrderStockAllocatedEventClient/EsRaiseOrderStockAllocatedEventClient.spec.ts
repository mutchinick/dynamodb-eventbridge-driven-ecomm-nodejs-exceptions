import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { DuplicateEventRaisedError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderStockAllocatedEvent } from '../model/OrderStockAllocatedEvent'
import { EsRaiseOrderStockAllocatedEventClient } from './EsRaiseOrderStockAllocatedEventClient'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

function buildMockOrderStockAllocatedEvent(): TypeUtilsMutable<OrderStockAllocatedEvent> {
  const mockClass = OrderStockAllocatedEvent.validateAndBuild({
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
  })
  return mockClass
}

const mockOrderStockAllocatedEvent = buildMockOrderStockAllocatedEvent()

const expectedDdbDocClientInput = new PutCommand({
  TableName: mockEventStoreTableName,
  Item: {
    pk: `ORDER_ID#${mockOrderStockAllocatedEvent.eventData.orderId}`,
    sk: `EVENT#${mockOrderStockAllocatedEvent.eventName}`,
    _tn: '#EVENT',
    ...mockOrderStockAllocatedEvent,
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

describe(`Warehouse Service AllocateOrderStockApi EsRaiseOrderStockAllocatedEventClient tests`, () => {
  //
  // Test OrderStockAllocatedEvent edge cases
  //
  it(`does not throw if the input OrderStockAllocatedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const resultPromise =
      esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockOrderStockAllocatedEvent)
    await expect(resultPromise).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEvent is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as OrderStockAllocatedEvent
    const resultPromise = esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEvent is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = null as OrderStockAllocatedEvent
    const resultPromise = esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEvent.eventData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockOrderStockAllocatedEvent()
    mockTestEvent.eventData = undefined
    const resultPromise = esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEvent.eventData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockOrderStockAllocatedEvent()
    mockTestEvent.eventData = null
    const resultPromise = esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockOrderStockAllocatedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    await esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockOrderStockAllocatedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send throws a native Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const resultPromise =
      esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockOrderStockAllocatedEvent)
    await expect(resultPromise).rejects.toThrow(UnrecognizedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  it(`throws a non-transient DuplicateEventRaisedError if DynamoDBDocumentClient.send throws a
      ConditionalCheckFailedException`, async () => {
    const mockError = new ConditionalCheckFailedException({ $metadata: {}, message: 'ConditionalCheckFailed' })
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const resultPromise =
      esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockOrderStockAllocatedEvent)
    await expect(resultPromise).rejects.toThrow(DuplicateEventRaisedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })
})
