import { DynamoDBDocumentClient, GetCommand, GetCommandOutput } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { GetOrderAllocationCommand } from '../model/GetOrderAllocationCommand'
import { DbGetOrderAllocationClient } from './DbGetOrderAllocationClient'

const mockWarehouseTableName = 'mockWarehouseTableName'

process.env.WAREHOUSE_TABLE_NAME = mockWarehouseTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSKu'

function buildMockGetOrderAllocationCommand(): TypeUtilsMutable<GetOrderAllocationCommand> {
  const mockClass = GetOrderAllocationCommand.validateAndBuild({
    orderId: mockOrderId,
    sku: mockSku,
  })
  return mockClass
}

const mockGetOrderAllocationCommand = buildMockGetOrderAllocationCommand()

function buildMockDdbCommand(): GetCommand {
  const ddbCommand = new GetCommand({
    TableName: mockWarehouseTableName,
    Key: {
      pk: `WAREHOUSE#SKU#${mockSku}`,
      sk: `SKU#${mockSku}#ORDER_ID#${mockOrderId}#ALLOCATION`,
    },
  })
  return ddbCommand
}

const expectedDdbCommand = buildMockDdbCommand()

//
// Mock clients
//
const mockExistingOrderData: OrderAllocationData = {
  orderId: mockGetOrderAllocationCommand.commandData.orderId,
  sku: mockGetOrderAllocationCommand.commandData.sku,
  units: 2,
  price: 5.55,
  userId: 'mockUserId',
  createdAt: mockDate,
  updatedAt: mockDate,
  allocationStatus: 'ALLOCATED',
}

function buildMockDdbDocClient_resolves_validItem(): DynamoDBDocumentClient {
  const mockDdbOutput: GetCommandOutput = {
    Item: mockExistingOrderData,
    $metadata: {},
  }
  return { send: jest.fn().mockResolvedValue(mockDdbOutput) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_resolves_nullItem(): DynamoDBDocumentClient {
  const mockDdbOutput: GetCommandOutput = {
    Item: undefined,
    $metadata: {},
  }
  return { send: jest.fn().mockResolvedValue(mockDdbOutput) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { syncOrder: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

describe(`Orders Service SyncOrderWorker DbGetOrderAllocationClient tests`, () => {
  //
  // Test GetOrderAllocationCommand edge cases
  //
  it(`does not throw if the input GetOrderAllocationCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    await expect(dbGetOrderAllocationClient.getOrderAllocation(mockGetOrderAllocationCommand)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input GetOrderAllocationCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    const mockTestCommand = undefined as never
    const resultPromise = dbGetOrderAllocationClient.getOrderAllocation(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input GetOrderAllocationCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    const mockTestCommand = null as never
    const resultPromise = dbGetOrderAllocationClient.getOrderAllocation(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderAllocationCommand.commandData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    const mockTestCommand = buildMockGetOrderAllocationCommand()
    mockTestCommand.commandData = undefined
    const resultPromise = dbGetOrderAllocationClient.getOrderAllocation(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderAllocationCommand.commandData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    const mockTestCommand = buildMockGetOrderAllocationCommand()
    mockTestCommand.commandData = null
    const resultPromise = dbGetOrderAllocationClient.getOrderAllocation(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    await dbGetOrderAllocationClient.getOrderAllocation(mockGetOrderAllocationCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    await dbGetOrderAllocationClient.getOrderAllocation(mockGetOrderAllocationCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send throws an unwrapped Error`, async () => {
    const mockError = new Error('mockError')
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    const resultPromise = dbGetOrderAllocationClient.getOrderAllocation(mockGetOrderAllocationCommand)
    await expect(resultPromise).rejects.toThrow(UnrecognizedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  //
  // Test expected results
  //
  it(`does not throw if the DynamoDBDocumentClient.send returns a null Item`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_nullItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    await expect(dbGetOrderAllocationClient.getOrderAllocation(mockGetOrderAllocationCommand)).resolves.not.toThrow()
  })

  it(`returns the expected null if DynamoDBDocumentClient.send returns a null Item`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_nullItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    const result = await dbGetOrderAllocationClient.getOrderAllocation(mockGetOrderAllocationCommand)
    const expectedResult: OrderAllocationData = null
    expect(result).toBe(expectedResult)
  })

  it(`returns the expected OrderAllocationData if DynamoDBDocumentClient.send returns an Item with data`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderAllocationClient = new DbGetOrderAllocationClient(mockDdbDocClient)
    const result = await dbGetOrderAllocationClient.getOrderAllocation(mockGetOrderAllocationCommand)
    const expectedResult: OrderAllocationData = {
      orderId: mockExistingOrderData.orderId,
      sku: mockExistingOrderData.sku,
      units: mockExistingOrderData.units,
      price: mockExistingOrderData.price,
      userId: mockExistingOrderData.userId,
      createdAt: mockExistingOrderData.createdAt,
      updatedAt: mockExistingOrderData.updatedAt,
      allocationStatus: mockExistingOrderData.allocationStatus,
    }
    expect(result).toStrictEqual(expectedResult)
  })
})
