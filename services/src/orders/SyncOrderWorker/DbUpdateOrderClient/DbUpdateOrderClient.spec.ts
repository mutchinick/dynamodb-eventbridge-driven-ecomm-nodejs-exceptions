import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand, UpdateCommandOutput } from '@aws-sdk/lib-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { UpdateOrderCommand } from '../model/UpdateOrderCommand'
import { DbUpdateOrderClient } from './DbUpdateOrderClient'

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.ORDER_TABLE_NAME = mockEventStoreTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockUpdateOrderCommand(): TypeUtilsMutable<UpdateOrderCommand> {
  const mockClass = UpdateOrderCommand.validateAndBuild({
    existingOrderData: {
      orderId: 'mockOrderId',
      orderStatus: OrderStatus.ORDER_CREATED_STATUS,
      sku: 'mockSku',
      units: 4,
      price: 10.99,
      userId: 'mockUserIId',
      createdAt: mockDate,
      updatedAt: mockDate,
    },
    incomingOrderEvent: {
      eventName: OrderEventName.ORDER_STOCK_ALLOCATED_EVENT,
      eventData: {
        orderId: 'mockOrderId',
        sku: 'mockSku',
        units: 4,
        price: 10.99,
        userId: 'mockUserIId',
        createdAt: mockDate,
        updatedAt: mockDate,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  })
  return mockClass
}

const mockUpdateOrderCommand = buildMockUpdateOrderCommand()

const expectedDdbDocClientInput = new UpdateCommand({
  TableName: mockEventStoreTableName,
  Key: {
    pk: `ORDER_ID#${mockUpdateOrderCommand.orderData.orderId}`,
    sk: `ORDER_ID#${mockUpdateOrderCommand.orderData.orderId}`,
  },
  UpdateExpression: 'SET #orderStatus = :orderStatus, #updatedAt = :updatedAt',
  ExpressionAttributeNames: {
    '#orderStatus': 'orderStatus',
    '#updatedAt': 'updatedAt',
  },
  ExpressionAttributeValues: {
    ':orderStatus': mockUpdateOrderCommand.orderData.orderStatus,
    ':updatedAt': mockUpdateOrderCommand.orderData.updatedAt,
  },
  ConditionExpression: '#orderStatus <> :orderStatus',
  ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
  ReturnValues: 'ALL_NEW',
})

//
// Mock clients
//
const expectedUpdatedOrderData: OrderData = {
  orderId: mockUpdateOrderCommand.orderData.orderId,
  orderStatus: mockUpdateOrderCommand.orderData.orderStatus,
  sku: 'mockSku',
  units: 2,
  price: 3.98,
  userId: 'mockUserId',
  createdAt: 'mockCreatedAt',
  updatedAt: mockUpdateOrderCommand.orderData.updatedAt,
}

function buildMockDdbDocClient_resolves(): DynamoDBDocumentClient {
  const mockSendReturnValues: UpdateCommandOutput = {
    Attributes: { ...expectedUpdatedOrderData },
  } as unknown as UpdateCommandOutput
  return { send: jest.fn().mockResolvedValue(mockSendReturnValues) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

const expectedExistingOrderData: OrderData = {
  orderId: mockUpdateOrderCommand.orderData.orderId,
  orderStatus: mockUpdateOrderCommand.orderData.orderStatus,
  sku: 'mockSku-Existing',
  units: 2,
  price: 3.98,
  userId: 'mockUserId-Existing',
  createdAt: 'mockCreatedAt-Existing',
  updatedAt: mockUpdateOrderCommand.orderData.updatedAt,
}

function buildMockDdbDocClient_throws_ConditionalCheckFailedException(): DynamoDBDocumentClient {
  const mockError = new ConditionalCheckFailedException({
    $metadata: {},
    message: '',
    Item: marshall(expectedExistingOrderData),
  })
  return {
    send: jest.fn().mockRejectedValue(mockError),
  } as unknown as DynamoDBDocumentClient
}

describe(`Orders Service SyncOrderWorker DbUpdateOrderClient tests`, () => {
  //
  // Test UpdateOrderCommand edge cases
  //
  it(`does not throw if the input UpdateOrderCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    await expect(dbUpdateOrderClient.updateOrder(mockUpdateOrderCommand)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input UpdateOrderCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = undefined as UpdateOrderCommand
    const resultPromise = dbUpdateOrderClient.updateOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input UpdateOrderCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = null as UpdateOrderCommand
    const resultPromise = dbUpdateOrderClient.updateOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input UpdateOrderCommand.orderData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = buildMockUpdateOrderCommand()
    mockTestCommand.orderData = undefined
    const resultPromise = dbUpdateOrderClient.updateOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input UpdateOrderCommand.orderData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = buildMockUpdateOrderCommand()
    mockTestCommand.orderData = null
    const resultPromise = dbUpdateOrderClient.updateOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    await dbUpdateOrderClient.updateOrder(mockUpdateOrderCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    await dbUpdateOrderClient.updateOrder(mockUpdateOrderCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send throws a native Error`, async () => {
    const mockError = new Error('mockError')
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const resultPromise = dbUpdateOrderClient.updateOrder(mockUpdateOrderCommand)
    await expect(resultPromise).rejects.toThrow(UnrecognizedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  //
  // Test expected results
  //
  it(`returns the expected OrderData existing in the database if DynamoDBDocumentClient.send
      throws a ConditionalCheckFailedException error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws_ConditionalCheckFailedException()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const result = await dbUpdateOrderClient.updateOrder(mockUpdateOrderCommand)
    expect(result).toStrictEqual(expectedExistingOrderData)
  })

  it(`returns the expected OrderData updated in the database`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const result = await dbUpdateOrderClient.updateOrder(mockUpdateOrderCommand)
    expect(result).toStrictEqual(expectedUpdatedOrderData)
  })
})
