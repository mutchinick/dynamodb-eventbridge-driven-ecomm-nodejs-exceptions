import { DynamoDBDocumentClient, GetCommand, GetCommandOutput } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderStatus } from '../../model/OrderStatus'
import { GetOrderCommand } from '../model/GetOrderCommand'
import { DbGetOrderClient } from './DbGetOrderClient'

const mockOrdersTableName = 'mockOrdersTableName'

process.env.ORDERS_TABLE_NAME = mockOrdersTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'

function buildMockGetOrderCommand(): TypeUtilsMutable<GetOrderCommand> {
  const mockClass = GetOrderCommand.validateAndBuild({
    orderId: mockOrderId,
  })
  return mockClass
}

const mockGetOrderCommand = buildMockGetOrderCommand()

function buildMockDdbCommand(): GetCommand {
  const ddbCommand = new GetCommand({
    TableName: mockOrdersTableName,
    Key: {
      pk: `ORDERS#ORDER_ID#${mockOrderId}`,
      sk: `ORDER_ID#${mockOrderId}`,
    },
  })
  return ddbCommand
}

const expectedDdbCommand = buildMockDdbCommand()

//
// Mock clients
//
const mockExistingOrderData: OrderData = {
  orderId: mockGetOrderCommand.orderData.orderId,
  orderStatus: OrderStatus.ORDER_CREATED_STATUS,
  sku: 'mockSku',
  units: 2,
  price: 5.55,
  userId: 'mockUserId',
  createdAt: mockDate,
  updatedAt: mockDate,
}

function buildMockDdbDocClient_resolves_validItem(): DynamoDBDocumentClient {
  const mockGetCommandResult: GetCommandOutput = {
    Item: mockExistingOrderData,
    $metadata: {},
  }
  return { send: jest.fn().mockResolvedValue(mockGetCommandResult) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_resolves_nullItem(): DynamoDBDocumentClient {
  const mockGetCommandResult: GetCommandOutput = {
    Item: undefined,
    $metadata: {},
  }
  return { send: jest.fn().mockResolvedValue(mockGetCommandResult) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

describe(`Orders Service SyncOrderWorker DbGetOrderClient tests`, () => {
  //
  // Test GetOrderCommand edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input GetOrderCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const mockTestCommand = undefined as never
    const resultPromise = dbGetOrderClient.getOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input GetOrderCommand.orderData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const mockTestCommand = buildMockGetOrderCommand()
    mockTestCommand.orderData = undefined
    const resultPromise = dbGetOrderClient.getOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input GetOrderCommand.orderData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const mockTestCommand = null as never
    const resultPromise = dbGetOrderClient.getOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    await dbGetOrderClient.getOrder(mockGetOrderCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    await dbGetOrderClient.getOrder(mockGetOrderCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send throws a native Error`, async () => {
    const mockError = new Error('mockError')
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const resultPromise = dbGetOrderClient.getOrder(mockGetOrderCommand)
    await expect(resultPromise).rejects.toThrow(UnrecognizedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  //
  // Test expected results
  //
  it(`does not throw if the DynamoDBDocumentClient.send returns a null Item`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_nullItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    await expect(dbGetOrderClient.getOrder(mockGetOrderCommand)).resolves.not.toThrow()
  })

  it(`returns the expected null if DynamoDBDocumentClient.send returns a null Item`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_nullItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const result = await dbGetOrderClient.getOrder(mockGetOrderCommand)
    const expectedResult: OrderData = null
    expect(result).toBe(expectedResult)
  })

  it(`returns the expected OrderData if DynamoDBDocumentClient.send returns an Item with data`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderClient = new DbGetOrderClient(mockDdbDocClient)
    const result = await dbGetOrderClient.getOrder(mockGetOrderCommand)
    const expectedResult: OrderData = {
      orderId: mockExistingOrderData.orderId,
      orderStatus: mockExistingOrderData.orderStatus,
      sku: mockExistingOrderData.sku,
      units: mockExistingOrderData.units,
      price: mockExistingOrderData.price,
      userId: mockExistingOrderData.userId,
      createdAt: mockExistingOrderData.createdAt,
      updatedAt: mockExistingOrderData.updatedAt,
    }
    expect(result).toStrictEqual(expectedResult)
  })
})
