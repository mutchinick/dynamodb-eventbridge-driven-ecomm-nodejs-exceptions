import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand, UpdateCommandOutput } from '@aws-sdk/lib-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderStatus } from '../../model/OrderStatus'
import { UpdateOrderCommand } from '../model/UpdateOrderCommand'
import { DbUpdateOrderClient } from './DbUpdateOrderClient'

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.ORDER_TABLE_NAME = mockEventStoreTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

const mockValidCommand: UpdateOrderCommand = {
  orderData: {
    orderId: 'mockOrderId',
    orderStatus: OrderStatus.ORDER_CREATED_STATUS,
    updatedAt: mockDate,
  },
}

const expectedDdbDocClientInput = new UpdateCommand({
  TableName: mockEventStoreTableName,
  Key: {
    pk: `ORDER_ID#${mockValidCommand.orderData.orderId}`,
    sk: `ORDER_ID#${mockValidCommand.orderData.orderId}`,
  },
  UpdateExpression: 'SET #orderStatus = :orderStatus, #updatedAt = :updatedAt',
  ExpressionAttributeNames: {
    '#orderStatus': 'orderStatus',
    '#updatedAt': 'updatedAt',
  },
  ExpressionAttributeValues: {
    ':orderStatus': mockValidCommand.orderData.orderStatus,
    ':updatedAt': mockValidCommand.orderData.updatedAt,
  },
  ConditionExpression: '#orderStatus <> :orderStatus',
  ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
  ReturnValues: 'ALL_NEW',
})

const expectedUpdatedOrderData: OrderData = {
  orderId: mockValidCommand.orderData.orderId,
  orderStatus: mockValidCommand.orderData.orderStatus,
  sku: 'mockSku',
  units: 2,
  price: 3.98,
  userId: 'mockUserId',
  createdAt: 'mockCreatedAt',
  updatedAt: mockValidCommand.orderData.updatedAt,
}

function buildMockDdbDocClient_send_resolves(): DynamoDBDocumentClient {
  const mockSendReturnValues: UpdateCommandOutput = {
    Attributes: { ...expectedUpdatedOrderData },
  } as unknown as UpdateCommandOutput
  return { send: jest.fn().mockResolvedValue(mockSendReturnValues) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_send_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

const expectedExistingOrderData: OrderData = {
  orderId: mockValidCommand.orderData.orderId,
  orderStatus: mockValidCommand.orderData.orderStatus,
  sku: 'mockSku-Existing',
  units: 2,
  price: 3.98,
  userId: 'mockUserId-Existing',
  createdAt: 'mockCreatedAt-Existing',
  updatedAt: mockValidCommand.orderData.updatedAt,
}

function buildMockDdbDocClient_send_throws_ConditionalCheckFailedException(): DynamoDBDocumentClient {
  const error = new ConditionalCheckFailedException({
    $metadata: {},
    message: '',
    Item: marshall(expectedExistingOrderData),
  })
  return {
    send: jest.fn().mockRejectedValue(error),
  } as unknown as DynamoDBDocumentClient
}

describe(`Orders Service SyncOrderWorker DbUpdateOrderClient tests`, () => {
  //
  // Test UpdateOrderCommand edge cases
  //
  it(`does not throw if the input UpdateOrderCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    await expect(dbUpdateOrderClient.updateOrder(mockValidCommand)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input UpdateOrderCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = undefined as UpdateOrderCommand
    const resultPromise = dbUpdateOrderClient.updateOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input UpdateOrderCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = null as UpdateOrderCommand
    const resultPromise = dbUpdateOrderClient.updateOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input UpdateOrderCommand is empty`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = {} as UpdateOrderCommand
    const resultPromise = dbUpdateOrderClient.updateOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input UpdateOrderCommand.orderData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = { orderData: undefined } as UpdateOrderCommand
    const resultPromise = dbUpdateOrderClient.updateOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input UpdateOrderCommand.orderData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const mockTestCommand = { orderData: null } as UpdateOrderCommand
    const resultPromise = dbUpdateOrderClient.updateOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    await dbUpdateOrderClient.updateOrder(mockValidCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    await dbUpdateOrderClient.updateOrder(mockValidCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it(`throws a transient UnrecognizedError with the original Error as cause
      if DynamoDBDocumentClient.send throws a generic Error`, async () => {
    const error = new Error('mockError')
    const mockDdbDocClient = buildMockDdbDocClient_send_throws(error)
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const expectedError = UnrecognizedError.from(error)
    const resultPromise = dbUpdateOrderClient.updateOrder(mockValidCommand)
    await expect(resultPromise).rejects.toThrow(expectedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  //
  // Test expected results
  //
  it(`returns the expected OrderData existing in the database if DynamoDBDocumentClient.send
      throws a ConditionalCheckFailedException error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_throws_ConditionalCheckFailedException()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const existingOrderData = await dbUpdateOrderClient.updateOrder(mockValidCommand)
    expect(existingOrderData).toStrictEqual(expectedExistingOrderData)
  })

  it(`returns the expected OrderData updated in the database`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_send_resolves()
    const dbUpdateOrderClient = new DbUpdateOrderClient(mockDdbDocClient)
    const orderData = await dbUpdateOrderClient.updateOrder(mockValidCommand)
    expect(orderData).toStrictEqual(expectedUpdatedOrderData)
  })
})
