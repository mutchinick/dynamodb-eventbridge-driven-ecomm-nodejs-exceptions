import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import {
  DepletedStockAllocationError,
  DuplicateStockAllocationError,
  InvalidArgumentsError,
  UnrecognizedError,
} from '../../errors/AppError'
import { AllocationStatus } from '../../model/AllocationStatus'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { AllocateOrderStockCommand } from '../model/AllocateOrderStockCommand'
import { DbAllocateOrderStockClient } from './DbAllocateOrderStockClient'

const mockWarehouseName = 'mockWarehouseTableName'

process.env.WAREHOUSE_TABLE_NAME = mockWarehouseName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockEventName = WarehouseEventName.ORDER_CREATED_EVENT
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'
const mockAllocationStatus: AllocationStatus = 'ALLOCATED'

function buildMockAllocateOrderStockCommand(): TypeUtilsMutable<AllocateOrderStockCommand> {
  const mockClass = AllocateOrderStockCommand.validateAndBuild({
    incomingOrderCreatedEvent: {
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
    },
  })
  return mockClass
}

const mockAllocateOrderStockCommand = buildMockAllocateOrderStockCommand()

function buildMockDdbCommand(): TransactWriteCommand {
  const ddbCommand = new TransactWriteCommand({
    TransactItems: [
      {
        Put: {
          TableName: mockWarehouseName,
          Item: {
            pk: `WAREHOUSE#SKU#${mockSku}`,
            sk: `SKU#${mockSku}#ORDER_ID#${mockOrderId}#ALLOCATION`,
            sku: mockSku,
            orderId: mockOrderId,
            units: mockUnits,
            price: mockPrice,
            userId: mockUserId,
            allocationStatus: mockAllocationStatus,
            createdAt: mockDate,
            updatedAt: mockDate,
            _tn: `WAREHOUSE#ALLOCATION`,
            _sn: `WAREHOUSE`,
            gsi1pk: `WAREHOUSE#ALLOCATION`,
            gsi1sk: `CREATED_AT#${mockDate}`,
          },
          ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
        },
      },
      {
        Update: {
          TableName: mockWarehouseName,
          Key: {
            pk: `WAREHOUSE#SKU#${mockSku}`,
            sk: `SKU#${mockSku}`,
          },
          UpdateExpression: 'SET #units = #units - :units, #updatedAt = :updatedAt',
          ExpressionAttributeNames: {
            '#units': 'units',
            '#updatedAt': 'updatedAt',
          },
          ExpressionAttributeValues: {
            ':units': mockUnits,
            ':updatedAt': mockDate,
          },
          ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk) and #units >= :units',
        },
      },
    ],
  })
  return ddbCommand
}

const expectedDdbCommand = buildMockDdbCommand()

//
// Mock clients
//
function buildMockDdbDocClient_resolves(): DynamoDBDocumentClient {
  return { send: jest.fn() } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

describe(`Warehouse Service AllocateOrderStockWorker DbAllocateOrderStockClient tests`, () => {
  //
  // Test AllocateOrderStockCommand edge cases
  //
  it(`does not throw if the input AllocateOrderStockCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input AllocateOrderStockCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const mockValidCommand = undefined as AllocateOrderStockCommand
    const resultPromise = dbAllocateOrderStockClient.allocateOrderStock(mockValidCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input AllocateOrderStockCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const mockValidCommand = null as AllocateOrderStockCommand
    const resultPromise = dbAllocateOrderStockClient.allocateOrderStock(mockValidCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input AllocateOrderStockCommand.commandData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const mockValidCommand = buildMockAllocateOrderStockCommand()
    mockValidCommand.commandData = undefined
    const resultPromise = dbAllocateOrderStockClient.allocateOrderStock(mockValidCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input AllocateOrderStockCommand.commandData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const mockValidCommand = buildMockAllocateOrderStockCommand()
    mockValidCommand.commandData = null
    const resultPromise = dbAllocateOrderStockClient.allocateOrderStock(mockValidCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send throws an unwrapped Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const resultPromise = dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    await expect(resultPromise).rejects.toThrow(UnrecognizedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  //
  // Test transaction errors
  //
  it(`throws a non-transient DuplicateStockAllocationError if DynamoDBDocumentClient.send throws 
      a ConditionalCheckFailedException when allocating the stock`, async () => {
    const mockError: Error = new TransactionCanceledException({
      $metadata: {},
      message: 'mockError',
      CancellationReasons: [{ Code: 'ConditionalCheckFailed' }, null],
    })
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const resultPromise = dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    await expect(resultPromise).rejects.toThrow(DuplicateStockAllocationError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient DuplicateStockAllocationError if DynamoDBDocumentClient.send throws
      a ConditionalCheckFailedException when both allocating and subtracting the stock`, async () => {
    const mockError: Error = new TransactionCanceledException({
      $metadata: {},
      message: 'mockError',
      CancellationReasons: [{ Code: 'ConditionalCheckFailed' }, { Code: 'ConditionalCheckFailed' }],
    })
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    await expect(dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)).rejects.toThrow(
      DuplicateStockAllocationError,
    )
  })

  it(`throws a non-transient DepletedStockAllocationError if DynamoDBDocumentClient.send throws
      a ConditionalCheckFailedException when subtracting the sku stock`, async () => {
    const mockError: Error = new TransactionCanceledException({
      $metadata: {},
      message: 'mockError',
      CancellationReasons: [null, { Code: 'ConditionalCheckFailed' }],
    })
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
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
  it(`returns a void if all components succeed`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbAllocateOrderStockClient = new DbAllocateOrderStockClient(mockDdbDocClient)
    const result = await dbAllocateOrderStockClient.allocateOrderStock(mockAllocateOrderStockCommand)
    expect(result).not.toBeDefined()
  })
})
