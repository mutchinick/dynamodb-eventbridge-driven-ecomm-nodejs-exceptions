import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { InvalidArgumentsError, DuplicateEventRaisedError, UnrecognizedError } from '../../errors/AppError'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { OrderStockAllocatedEvent } from '../model/OrderStockAllocatedEvent'
import { EsRaiseOrderStockAllocatedEventClient } from './EsRaiseOrderStockAllocatedEventClient'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toUTCString()

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

const mockValidEvent: OrderStockAllocatedEvent = {
  eventName: WarehouseEventName.ORDER_STOCK_ALLOCATED_EVENT,
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

describe(`Warehouse Service AllocateOrderStockApi EsRaiseOrderStockAllocatedEventClient tests`, () => {
  //
  // Test OrderStockAllocatedEvent edge cases
  //
  it(`does not throw if the input OrderStockAllocatedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    await expect(
      esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockValidEvent),
    ).resolves.not.toThrow()
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEvent is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as OrderStockAllocatedEvent
    await expect(esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)).rejects.toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEvent is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = null as OrderStockAllocatedEvent
    await expect(esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)).rejects.toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEvent is empty`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const mockTestEvent = {} as OrderStockAllocatedEvent
    await expect(esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockTestEvent)).rejects.toThrow(
      InvalidArgumentsError,
    )
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const ddbAllocateOrderStockEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    await ddbAllocateOrderStockEventClient.raiseOrderStockAllocatedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const ddbAllocateOrderStockEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    await ddbAllocateOrderStockEventClient.raiseOrderStockAllocatedEvent(mockValidEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it(`throws an UnrecognizedError if DynamoDBDocumentClient.send throws`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const ddbAllocateOrderStockEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    await expect(ddbAllocateOrderStockEventClient.raiseOrderStockAllocatedEvent(mockValidEvent)).rejects.toThrow(
      UnrecognizedError,
    )
  })

  it(`throws a DuplicateEventRaisedError if DynamoDBDocumentClient.send throws a
      ConditionalCheckFailedException`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    await expect(esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockValidEvent)).rejects.toThrow(
      DuplicateEventRaisedError,
    )
  })

  it(`throws a non transient DuplicateEventRaisedError if DynamoDBDocumentClient.send throws a
      ConditionalCheckFailedException`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException()
    const esRaiseOrderStockAllocatedEventClient = new EsRaiseOrderStockAllocatedEventClient(mockDdbDocClient)
    const nonTransientError = DuplicateEventRaisedError.from()
    await expect(esRaiseOrderStockAllocatedEventClient.raiseOrderStockAllocatedEvent(mockValidEvent)).rejects.toThrow(
      expect.objectContaining({
        transient: nonTransientError.transient,
        name: nonTransientError.name,
      }),
    )
  })
})
