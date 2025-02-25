import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import {
  InvalidArgumentsError,
  DepletedStockAllocationError,
  DuplicateStockAllocationError,
  UnrecognizedError,
} from '../../errors/AppError'
import { AllocateOrderStockCommand } from '../model/AllocateOrderStockCommand'
import { DbAllocateOrderStockClient } from './DbAllocateOrderStockClient'

const mockWarehouseTableName = 'mockWarehouseTableName'

process.env.WAREHOUSE_TABLE_NAME = mockWarehouseTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

const mockAllocateOrderStockCommand: AllocateOrderStockCommand = {
  allocateOrderStockData: {
    sku: 'mockSku',
    units: 3,
    orderId: 'mockOrderId',
    createdAt: mockDate,
    updatedAt: mockDate,
  },
}

const { sku, units, orderId, createdAt, updatedAt } = mockAllocateOrderStockCommand.allocateOrderStockData
const status = 'ALLOCATED'

const expectedTransactWriteCommand = new TransactWriteCommand({
  TransactItems: [
    {
      Put: {
        TableName: mockWarehouseTableName,
        Item: {
          pk: `SKU_ID#${sku}#ORDER_ID#${orderId}#STOCK_ALLOCATION`,
          sk: `SKU_ID#${sku}#ORDER_ID#${orderId}#STOCK_ALLOCATION`,
          sku,
          units,
          orderId,
          status,
          createdAt,
          updatedAt,
          _tn: 'WAREHOUSE#STOCK_ALLOCATION',
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      },
    },
    {
      Update: {
        TableName: mockWarehouseTableName,
        Key: {
          pk: `SKU#${sku}`,
          sk: `SKU#${sku}`,
        },
        UpdateExpression:
          `SET ` +
          `#sku = :sku, ` +
          `#units = #units - :units, ` +
          `#createdAt = if_not_exists(#createdAt, :createdAt), ` +
          `#updatedAt = :updatedAt, ` +
          `#_tn = :_tn`,
        ExpressionAttributeNames: {
          '#sku': 'sku',
          '#units': 'units',
          '#createdAt': 'createdAt',
          '#updatedAt': 'updatedAt',
          '#_tn': '_tn',
        },
        ExpressionAttributeValues: {
          ':sku': sku,
          ':units': units,
          ':createdAt': createdAt,
          ':updatedAt': updatedAt,
          ':_tn': 'WAREHOUSE#SKU',
        },
        ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk) and #units >= :units',
      },
    },
  ],
})

function buildMockDdbDocClient_send_resolves(): DynamoDBDocumentClient {
  return { send: jest.fn() } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_throws(): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(new Error()) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Duplicate(): DynamoDBDocumentClient {
  const error: Error = new TransactionCanceledException({
    $metadata: {},
    message: '',
    CancellationReasons: [{ Code: 'ConditionalCheckFailed' }, null],
  })
  return {
    send: jest.fn().mockRejectedValue(error),
  } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Duplicate_Depleted(): DynamoDBDocumentClient {
  const error: Error = new TransactionCanceledException({
    $metadata: {},
    message: '',
    CancellationReasons: [{ Code: 'ConditionalCheckFailed' }, { Code: 'ConditionalCheckFailed' }],
  })
  return {
    send: jest.fn().mockRejectedValue(error),
  } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Depleted(): DynamoDBDocumentClient {
  const error: Error = new TransactionCanceledException({
    $metadata: {},
    message: '',
    CancellationReasons: [null, { Code: 'ConditionalCheckFailed' }],
  })
  return {
    send: jest.fn().mockRejectedValue(error),
  } as unknown as DynamoDBDocumentClient
}

describe(`Warehouse Service AllocateOrderStockWorker DbAllocateOrderStockClient tests`, () => {
  //
  // Test AllocateOrderStockCommand edge cases
  //
  it(`does not throw if the input AllocateOrderStockCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).resolves.not.toThrow()
  })

  it(`throws an InvalidArgumentsError if the input AllocateOrderStockCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const mockAllocateOrderStockCommand = undefined as AllocateOrderStockCommand
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input AllocateOrderStockCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const mockAllocateOrderStockCommand = null as AllocateOrderStockCommand
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input AllocateOrderStockCommand is empty`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const mockAllocateOrderStockCommand = {} as AllocateOrderStockCommand
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input AllocateOrderStockCommand.allocateOrderStockData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const mockAllocateOrderStockCommand = { allocateOrderStockData: undefined } as AllocateOrderStockCommand
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input AllocateOrderStockCommand.allocateOrderStockData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const mockAllocateOrderStockCommand = { allocateOrderStockData: null } as AllocateOrderStockCommand
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow(
      InvalidArgumentsError,
    )
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedTransactWriteCommand.input }),
    )
  })

  it(`throws an UnrecognizedError if DynamoDBDocumentClient.send throws`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow(
      UnrecognizedError,
    )
  })

  //
  // Test transaction errors
  //
  it(`throws an DuplicateStockAllocationError if DynamoDBDocumentClient.send throws 
      a ConditionalCheckFailedException error when allocating the stock`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Duplicate()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow(
      DuplicateStockAllocationError,
    )
  })

  it(`throws an non transient DuplicateStockAllocationError if DynamoDBDocumentClient.send throws 
      a ConditionalCheckFailedException error when allocating the stock`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Duplicate()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const nonTransientError = DuplicateStockAllocationError.from()
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow(
      expect.objectContaining({
        transient: nonTransientError.transient,
        name: nonTransientError.name,
      }),
    )
  })

  it(`throws an DuplicateStockAllocationError if DynamoDBDocumentClient.send throws
      a ConditionalCheckFailedException error when both allocating and subtracting the stock`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Duplicate_Depleted()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow(
      DuplicateStockAllocationError,
    )
  })

  it(`throws an DuplicateStockAllocationError if DynamoDBDocumentClient.send throws
      a ConditionalCheckFailedException error when both allocating and subtracting the stock`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Duplicate_Depleted()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const nonTransientError = DuplicateStockAllocationError.from()
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow(
      expect.objectContaining({
        transient: nonTransientError.transient,
        name: nonTransientError.name,
      }),
    )
  })

  it(`throws a DepletedStockAllocationError if DynamoDBDocumentClient.send throws
      a ConditionalCheckFailedException error when subtracting the sku stock`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Depleted()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow(
      DepletedStockAllocationError,
    )
  })

  it(`throws a non transient DepletedStockAllocationError if DynamoDBDocumentClient.send throws
      a ConditionalCheckFailedException error when subtracting the sku stock`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException_Depleted()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const nonTransientError = DepletedStockAllocationError.from()
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow(
      expect.objectContaining({
        transient: nonTransientError.transient,
        name: nonTransientError.name,
      }),
    )
  })

  //
  // Test expected results
  //
  it(`returns a void promise`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const result = await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    expect(result).not.toBeDefined()
  })
})
