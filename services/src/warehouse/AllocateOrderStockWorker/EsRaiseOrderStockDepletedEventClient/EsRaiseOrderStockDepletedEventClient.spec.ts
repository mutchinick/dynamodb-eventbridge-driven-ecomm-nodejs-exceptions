import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { DuplicateEventRaisedError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { OrderStockDepletedEvent } from '../model/OrderStockDepletedEvent'
import { EsRaiseOrderStockDepletedEventClient } from './EsRaiseOrderStockDepletedEventClient'

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockEventName = WarehouseEventName.ORDER_STOCK_DEPLETED_EVENT
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'

function buildMockOrderStockDepletedEvent(): TypeUtilsMutable<OrderStockDepletedEvent> {
  const mockClass = OrderStockDepletedEvent.validateAndBuild({
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
  })
  return mockClass
}

const mockOrderStockDepletedEvent = buildMockOrderStockDepletedEvent()

function buildMockDdbCommand(): PutCommand {
  const ddbCommand = new PutCommand({
    TableName: mockEventStoreTableName,
    Item: {
      pk: `EVENTS#ORDER_ID#${mockOrderId}`,
      sk: `EVENT#${mockEventName}`,
      _tn: `EVENTS#EVENT`,
      _sn: `EVENTS`,
      eventName: mockEventName,
      eventData: {
        orderId: mockOrderId,
        sku: mockSku,
        units: mockUnits,
        price: mockPrice,
        userId: mockUserId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
      gsi1pk: `EVENTS#EVENT`,
      gsi1sk: `CREATED_AT#${mockDate}`,
    },
    ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
  })
  return ddbCommand
}

const expectedDdbCommand = buildMockDdbCommand()

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
function buildMockDdbDocClient_resolves(): DynamoDBDocumentClient {
  return { send: jest.fn() } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

describe(`Warehouse Service AllocateOrderStockApi EsRaiseOrderStockDepletedEventClient tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test OrderStockDepletedEvent edge cases
   ************************************************************/
  it(`does not throw if the input OrderStockDepletedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const resultPromise = esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockOrderStockDepletedEvent)
    await expect(resultPromise).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEvent is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as OrderStockDepletedEvent
    const resultPromise = esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEvent is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const mockTestEvent = null as OrderStockDepletedEvent
    const resultPromise = esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEvent is not an instance of the class`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const mockTestEvent = { ...mockOrderStockDepletedEvent }
    const resultPromise = esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderStockDepletedEvent.eventData edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEvent.eventData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockOrderStockDepletedEvent()
    mockTestEvent.eventData = undefined
    const resultPromise = esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEvent.eventData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockOrderStockDepletedEvent()
    mockTestEvent.eventData = null
    const resultPromise = esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockOrderStockDepletedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockOrderStockDepletedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send throws an unwrapped Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const resultPromise = esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockOrderStockDepletedEvent)
    await expect(resultPromise).rejects.toThrow(UnrecognizedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  it(`throws a non-transient DuplicateEventRaisedError if DynamoDBDocumentClient.send throws a ConditionalCheckFailedException`, async () => {
    const mockError = new ConditionalCheckFailedException({ $metadata: {}, message: 'ConditionalCheckFailed' })
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const resultPromise = esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockOrderStockDepletedEvent)
    await expect(resultPromise).rejects.toThrow(DuplicateEventRaisedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected result
   ************************************************************/
  it(`returns the expected void if the execution path is successful`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderStockDepletedEventClient = new EsRaiseOrderStockDepletedEventClient(mockDdbDocClient)
    const result = await esRaiseOrderStockDepletedEventClient.raiseOrderStockDepletedEvent(mockOrderStockDepletedEvent)
    const expectedResult = undefined as void
    expect(result).toStrictEqual(expectedResult)
  })
})
