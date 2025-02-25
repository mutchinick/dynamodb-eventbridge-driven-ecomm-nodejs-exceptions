import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { InvalidArgumentsError, DuplicateEventRaisedError, UnrecognizedError } from '../../errors/AppError'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { OrderStockDepletedEvent } from '../model/OrderStockDepletedEvent'
import { EsRaiseOrderStockDepletedEventClient } from './EsRaiseOrderStockDepletedEventClient'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toUTCString()

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

const mockValidEvent: OrderStockDepletedEvent = {
  eventName: WarehouseEventName.ORDER_STOCK_DEPLETED_EVENT,
  createdAt: mockDate,
  updatedAt: mockDate,
  eventData: {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
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

function buildMockDdbDocClient_send_throws(): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(new Error()) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_throws_ConditionalCheckFailedException(): DynamoDBDocumentClient {
  const error = new ConditionalCheckFailedException({ $metadata: {}, message: 'ConditionalCheckFailed' })
  return { send: jest.fn().mockRejectedValue(error) } as unknown as DynamoDBDocumentClient
}

describe(`Warehouse Service AllocateOrderStockApi EsRaiseOrderStockDepletedEventClient tests`, () => {
  //
  // Test OrderStockDepletedEvent edge cases
  //
  it(`does not throw if the input OrderStockDepletedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    await expect(
      esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockValidEvent),
    ).resolves.not.toThrow()
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEvent is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as OrderStockDepletedEvent
    await expect(esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockTestEvent)).rejects.toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEvent is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const mockTestEvent = null as OrderStockDepletedEvent
    await expect(esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockTestEvent)).rejects.toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEvent is empty`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const mockTestEvent = {} as OrderStockDepletedEvent
    await expect(esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockTestEvent)).rejects.toThrow(
      InvalidArgumentsError,
    )
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const ddbAllocateOrderStockEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    await ddbAllocateOrderStockEventClient.raiseOrderStockDepletedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const ddbAllocateOrderStockEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    await ddbAllocateOrderStockEventClient.raiseOrderStockDepletedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it(`throws an UnrecognizedError if DynamoDBDocumentClient.send throws`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const ddbAllocateOrderStockEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    await expect(ddbAllocateOrderStockEventClient.raiseOrderStockDepletedEvent(mockValidEvent)).rejects.toThrow(
      UnrecognizedError,
    )
  })

  it(`throws a DuplicateEventRaisedError if DynamoDBDocumentClient.send throws a
      ConditionalCheckFailedException`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    await expect(esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockValidEvent)).rejects.toThrow(
      DuplicateEventRaisedError,
    )
  })

  it(`throws a non transient DuplicateEventRaisedError if DynamoDBDocumentClient.send throws a
      ConditionalCheckFailedException`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const nonTransientError = DuplicateEventRaisedError.from()
    await expect(esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockValidEvent)).rejects.toThrow(
      expect.objectContaining({
        transient: nonTransientError.transient,
        name: nonTransientError.name,
      }),
    )
  })
})
