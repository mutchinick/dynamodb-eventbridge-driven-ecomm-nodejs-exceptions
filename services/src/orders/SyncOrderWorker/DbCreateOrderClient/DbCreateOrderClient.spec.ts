import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand, UpdateCommandOutput } from '@aws-sdk/lib-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { CreateOrderCommand } from '../model/CreateOrderCommand'
import { DbCreateOrderClient } from './DbCreateOrderClient'

const mockOrdersTableName = 'mockOrdersTableName'

process.env.ORDERS_TABLE_NAME = mockOrdersTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockIncomingEventName = OrderEventName.ORDER_PLACED_EVENT
const mockOrderId = 'mockOrderId'
const mockOrderStatus = OrderStatus.ORDER_CREATED_STATUS
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'

function buildMockCreateOrderCommand(): TypeUtilsMutable<CreateOrderCommand> {
  const mockClass = CreateOrderCommand.validateAndBuild({
    incomingOrderEvent: {
      eventName: mockIncomingEventName,
      eventData: {
        orderId: mockOrderId,
        sku: mockSku,
        units: mockUnits,
        price: mockPrice,
        userId: mockUserId,
        createdAt: mockDate,
        updatedAt: mockDate,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  })
  return mockClass
}

const mockCreateOrderCommand = buildMockCreateOrderCommand()

function buildMockDdbCommand(): UpdateCommand {
  const ddbCommand = new UpdateCommand({
    TableName: mockOrdersTableName,
    Key: {
      pk: `ORDERS#ORDER_ID#${mockOrderId}`,
      sk: `ORDER_ID#${mockOrderId}`,
    },
    UpdateExpression:
      'SET ' +
      '#orderId = :orderId, ' +
      '#orderStatus = :orderStatus, ' +
      '#sku = :sku, ' +
      '#units = :units, ' +
      '#price = :price, ' +
      '#userId = :userId, ' +
      '#createdAt = :createdAt, ' +
      '#updatedAt = :updatedAt, ' +
      '#_tn = :_tn, ' +
      '#_sn = :_sn, ' +
      '#gsi1pk = :gsi1pk, ' +
      '#gsi1sk = :gsi1sk',
    ExpressionAttributeNames: {
      '#orderId': 'orderId',
      '#orderStatus': 'orderStatus',
      '#sku': 'sku',
      '#units': 'units',
      '#price': 'price',
      '#userId': 'userId',
      '#createdAt': 'createdAt',
      '#updatedAt': 'updatedAt',
      '#_tn': '_tn',
      '#_sn': '_sn',
      '#gsi1pk': 'gsi1pk',
      '#gsi1sk': 'gsi1sk',
    },
    ExpressionAttributeValues: {
      ':orderId': mockOrderId,
      ':orderStatus': mockOrderStatus,
      ':sku': mockSku,
      ':units': mockUnits,
      ':price': mockPrice,
      ':userId': mockUserId,
      ':createdAt': mockDate,
      ':updatedAt': mockDate,
      ':_tn': `ORDERS#ORDER`,
      ':_sn': `ORDERS`,
      ':gsi1pk': `ORDERS#ORDER`,
      ':gsi1sk': `CREATED_AT#${mockDate}`,
    },
    ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
    ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
    ReturnValues: 'ALL_NEW',
  })
  return ddbCommand
}

const expectedDdbCommand = buildMockDdbCommand()

//
// Mock clients
//
const expectedCreatedOrderData: OrderData = {
  orderId: mockCreateOrderCommand.commandData.orderId,
  orderStatus: mockCreateOrderCommand.commandData.orderStatus,
  sku: mockCreateOrderCommand.commandData.sku,
  units: mockCreateOrderCommand.commandData.units,
  price: mockCreateOrderCommand.commandData.price,
  userId: mockCreateOrderCommand.commandData.userId,
  createdAt: mockCreateOrderCommand.commandData.createdAt,
  updatedAt: mockCreateOrderCommand.commandData.updatedAt,
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
    await expect(dbCreateOrderClient.createOrder(mockCreateOrderCommand)).resolves.not.toThrow()
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

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommand.commandData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const mockTestCommand = buildMockCreateOrderCommand()
    mockTestCommand.commandData = undefined
    const resultPromise = dbCreateOrderClient.createOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommand.commandData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const mockTestCommand = buildMockCreateOrderCommand()
    mockTestCommand.commandData = null
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
    await dbCreateOrderClient.createOrder(mockCreateOrderCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    await dbCreateOrderClient.createOrder(mockCreateOrderCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send throws an unwrapped Error`, async () => {
    const mockError = new Error('mockError')
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const resultPromise = dbCreateOrderClient.createOrder(mockCreateOrderCommand)
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
    const existingOrderData = await dbCreateOrderClient.createOrder(mockCreateOrderCommand)
    expect(existingOrderData).toStrictEqual(expectedExistingOrderData)
  })

  it(`returns the expected OrderData created in the database`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCreateOrderClient = new DbCreateOrderClient(mockDdbDocClient)
    const orderData = await dbCreateOrderClient.createOrder(mockCreateOrderCommand)
    expect(orderData).toStrictEqual(expectedCreatedOrderData)
  })
})
