import { DynamoDBDocumentClient, GetCommand, GetCommandOutput } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderStatus } from '../../model/OrderStatus'
import { GetOrderCommand } from '../model/GetOrderCommand'
import { DbGetOrderClient } from './DbGetOrderClient'

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

function buildMockGetOrderCommand(): TypeUtilsMutable<GetOrderCommand> {
  const mockClass = GetOrderCommand.validateAndBuild({
    orderId: 'mockOrderId',
  })
  return mockClass
}

const mockGetOrderCommand = buildMockGetOrderCommand()

const expectedDdbDocClientInput = new GetCommand({
  TableName: mockEventStoreTableName,
  Key: {
    pk: `ORDER_ID#${mockGetOrderCommand.orderData.orderId}`,
    sk: `ORDER_ID#${mockGetOrderCommand.orderData.orderId}`,
  },
})

const mockValidOrderData: OrderData = {
  orderId: mockGetOrderCommand.orderData.orderId,
  orderStatus: OrderStatus.ORDER_CREATED_STATUS,
  sku: 'mockSku',
  units: 2,
  price: 5.55,
  userId: 'mockUserId',
  createdAt: 'mockCreatedAt',
  updatedAt: 'mockUpdatedAt',
}

//
// Mock clients
//
function buildMockDdbDocClient_resolves_validItem(): DynamoDBDocumentClient {
  const mockGetCommandResult: GetCommandOutput = {
    Item: mockValidOrderData,
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
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
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
      orderId: mockValidOrderData.orderId,
      orderStatus: mockValidOrderData.orderStatus,
      sku: mockValidOrderData.sku,
      units: mockValidOrderData.units,
      price: mockValidOrderData.price,
      userId: mockValidOrderData.userId,
      createdAt: mockValidOrderData.createdAt,
      updatedAt: mockValidOrderData.updatedAt,
    }
    expect(result).toStrictEqual(expectedResult)
  })
})
