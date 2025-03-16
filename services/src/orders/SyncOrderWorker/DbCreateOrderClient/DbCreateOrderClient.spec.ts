import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand, UpdateCommandOutput } from '@aws-sdk/lib-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderStatus } from '../../model/OrderStatus'
import { CreateOrderCommand } from '../model/CreateOrderCommand'
import { DbCreateOrderClient } from './DbCreateOrderClient'

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.ORDER_TABLE_NAME = mockEventStoreTableName

const mockDate = new Date().toISOString()

const mockValidCommand: CreateOrderCommand = {
  orderData: {
    orderId: 'mockOrderId',
    orderStatus: OrderStatus.ORDER_CREATED_STATUS,
    sku: 'mockSku',
    units: 2,
    price: 3.98,
    userId: 'mockUserId',
    createdAt: mockDate,
    updatedAt: mockDate,
  },
  options: {},
}

const expectedDdbDocClientInput = new UpdateCommand({
  TableName: mockEventStoreTableName,
  Key: {
    pk: `ORDER_ID#${mockValidCommand.orderData.orderId}`,
    sk: `ORDER_ID#${mockValidCommand.orderData.orderId}`,
  },
  UpdateExpression:
    'SET ' +
    '#_tn = :_tn, ' +
    '#orderId = :orderId, ' +
    '#orderStatus = :orderStatus, ' +
    '#sku = :sku, ' +
    '#units = :units, ' +
    '#price = :price, ' +
    '#userId = :userId, ' +
    '#createdAt = :createdAt, ' +
    '#updatedAt = :updatedAt',
  ExpressionAttributeNames: {
    '#_tn': '_tn',
    '#orderId': 'orderId',
    '#orderStatus': 'orderStatus',
    '#sku': 'sku',
    '#units': 'units',
    '#price': 'price',
    '#userId': 'userId',
    '#createdAt': 'createdAt',
    '#updatedAt': 'updatedAt',
  },
  ExpressionAttributeValues: {
    ':_tn': 'ORDERS#ORDER',
    ':orderId': mockValidCommand.orderData.orderId,
    ':orderStatus': mockValidCommand.orderData.orderStatus,
    ':sku': mockValidCommand.orderData.sku,
    ':units': mockValidCommand.orderData.units,
    ':price': mockValidCommand.orderData.price,
    ':userId': mockValidCommand.orderData.userId,
    ':createdAt': mockValidCommand.orderData.createdAt,
    ':updatedAt': mockValidCommand.orderData.updatedAt,
  },
  ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
  ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
  ReturnValues: 'ALL_NEW',
})

const expectedCreatedOrderData: OrderData = {
  orderId: mockValidCommand.orderData.orderId,
  orderStatus: mockValidCommand.orderData.orderStatus,
  sku: mockValidCommand.orderData.sku,
  units: mockValidCommand.orderData.units,
  price: mockValidCommand.orderData.price,
  userId: mockValidCommand.orderData.userId,
  createdAt: mockValidCommand.orderData.createdAt,
  updatedAt: mockValidCommand.orderData.updatedAt,
}

function buildMockDdbDocClient_resolves(): DynamoDBDocumentClient {
  const mockSendReturnValues: UpdateCommandOutput = {
    Attributes: { ...expectedCreatedOrderData },
  } as unknown as UpdateCommandOutput
  return { send: jest.fn().mockResolvedValue(mockSendReturnValues) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

const expectedExistingOrderData: OrderData = {
  orderId: 'mockOrderId-Existing',
  orderStatus: OrderStatus.ORDER_CREATED_STATUS,
  sku: 'mockOrderId-Existing',
  units: 10,
  price: 77.77,
  userId: 'mockUserId-Existing',
  createdAt: 'mockCreatedAt-Existing',
  updatedAt: 'mockUpdatedAt-Existing',
}

function buildMockDdbDocClient_throws_ConditionalCheckFailedException(): DynamoDBDocumentClient {
  const mockError = new ConditionalCheckFailedException({
    $metadata: {},
    message: '',
    Item: marshall(expectedExistingOrderData),
  })
  return { send: jest.fn().mockRejectedValue(mockError) } as unknown as DynamoDBDocumentClient
}

describe(`Orders Service SyncOrderWorker DbCreateOrderClient tests`, () => {
  //
  // Test CreateOrderCommand edge cases
  //
  it(`does not throw if the input CreateOrderCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    await expect(dbCreateOrderClient.createOrder(mockValidCommand)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const mockTestCommand = undefined as CreateOrderCommand
    const resultPromise = dbCreateOrderClient.createOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const mockTestCommand = null as CreateOrderCommand
    const resultPromise = dbCreateOrderClient.createOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommand is empty`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const mockTestCommand = {} as CreateOrderCommand
    const resultPromise = dbCreateOrderClient.createOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommand.orderData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const mockTestCommand = { orderData: undefined } as CreateOrderCommand
    const resultPromise = dbCreateOrderClient.createOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommand.orderData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const mockTestCommand = { orderData: null } as CreateOrderCommand
    const resultPromise = dbCreateOrderClient.createOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    await dbCreateOrderClient.createOrder(mockValidCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    await dbCreateOrderClient.createOrder(mockValidCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send throws a native Error`, async () => {
    const mockError = new Error('mockError')
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const resultPromise = dbCreateOrderClient.createOrder(mockValidCommand)
    await expect(resultPromise).rejects.toThrow(UnrecognizedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  //
  // Test expected results
  //
  it(`returns the expected OrderData existing in the database if DynamoDBDocumentClient.send
      throws a ConditionalCheckFailedException error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws_ConditionalCheckFailedException()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const existingOrderData = await dbCreateOrderClient.createOrder(mockValidCommand)
    expect(existingOrderData).toStrictEqual(expectedExistingOrderData)
  })

  it(`returns the expected OrderData created in the database`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const orderData = await dbCreateOrderClient.createOrder(mockValidCommand)
    expect(orderData).toStrictEqual(expectedCreatedOrderData)
  })
})
