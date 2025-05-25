import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import {
  InvalidArgumentsError,
  PaymentAlreadyAcceptedError,
  PaymentAlreadyRejectedError,
  UnrecognizedError,
} from '../../errors/AppError'
import { PaymentStatus } from '../../model/PaymentStatus'
import { RecordOrderPaymentCommand } from '../model/RecordOrderPaymentCommand'
import { DbRecordOrderPaymentClient } from './DbRecordOrderPaymentClient'

const mockPaymentsTableName = 'mockPaymentsTableName'

process.env.PAYMENTS_TABLE_NAME = mockPaymentsTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'
const mockPaymentId = 'mockPaymentId'
const mockPaymentFailedStatus: PaymentStatus = 'PAYMENT_FAILED'
const mockPaymentAcceptedStatus: PaymentStatus = 'PAYMENT_ACCEPTED'
const mockPaymentRejectedStatus: PaymentStatus = 'PAYMENT_REJECTED'

function buildMockRecordOrderPaymentCommand(): TypeUtilsMutable<RecordOrderPaymentCommand> {
  const mockClass = RecordOrderPaymentCommand.validateAndBuild({
    existingOrderPaymentData: {
      orderId: mockOrderId,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
      createdAt: mockDate,
      updatedAt: mockDate,
      paymentId: mockPaymentId,
      paymentStatus: mockPaymentFailedStatus,
      paymentRetries: 0,
    },
    newOrderPaymentFields: {
      orderId: mockOrderId,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
      paymentId: mockPaymentId,
      paymentStatus: mockPaymentFailedStatus,
    },
  })
  return mockClass
}

const mockRecordOrderPaymentCommand = buildMockRecordOrderPaymentCommand()

function buildMockDdbCommand(): UpdateCommand {
  const ddbCommand = new UpdateCommand({
    TableName: mockPaymentsTableName,
    Key: {
      pk: `PAYMENTS#ORDER_ID#${mockOrderId}`,
      sk: `ORDER_ID#${mockOrderId}#PAYMENT`,
    },
    UpdateExpression:
      'SET ' +
      '#orderId = :orderId, ' +
      '#sku = :sku, ' +
      '#units = :units, ' +
      '#price = :price, ' +
      '#userId = :userId, ' +
      '#paymentId = :paymentId, ' +
      '#paymentStatus = :paymentStatus, ' +
      '#paymentRetries = :paymentRetries, ' +
      '#updatedAt = :updatedAt, ' +
      '#createdAt = if_not_exists(#createdAt, :createdAt), ' +
      '#_tn = :_tn, ' +
      '#_sn = :_sn, ' +
      '#gsi1pk = :gsi1pk, ' +
      '#gsi1sk = :gsi1sk',
    ExpressionAttributeNames: {
      '#orderId': 'orderId',
      '#sku': 'sku',
      '#units': 'units',
      '#price': 'price',
      '#userId': 'userId',
      '#paymentId': 'paymentId',
      '#paymentStatus': 'paymentStatus',
      '#paymentRetries': 'paymentRetries',
      '#updatedAt': 'updatedAt',
      '#createdAt': 'createdAt',
      '#_tn': '_tn',
      '#_sn': '_sn',
      '#gsi1pk': 'gsi1pk',
      '#gsi1sk': 'gsi1sk',
    },
    ExpressionAttributeValues: {
      ':orderId': mockOrderId,
      ':sku': mockSku,
      ':units': mockUnits,
      ':price': mockPrice,
      ':userId': mockUserId,
      ':paymentId': mockPaymentId,
      ':paymentStatus': mockPaymentFailedStatus,
      ':paymentRetries': mockRecordOrderPaymentCommand.commandData.paymentRetries,
      ':updatedAt': mockDate,
      ':createdAt': mockDate,
      ':_tn': 'PAYMENTS#PAYMENT',
      ':_sn': 'PAYMENTS',
      ':gsi1pk': 'PAYMENTS#PAYMENT',
      ':gsi1sk': `CREATED_AT#${mockDate}`,
      ':paymentAcceptedStatus': mockPaymentAcceptedStatus,
      ':paymentRejectedStatus': mockPaymentRejectedStatus,
    },
    ConditionExpression: '#paymentStatus <> :paymentAcceptedStatus AND #paymentStatus <> :paymentRejectedStatus',
    ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
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

function buildMockDdbDocClient_throws(): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(new Error()) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws_ConditionRejected(): DynamoDBDocumentClient {
  const error: Error = new ConditionalCheckFailedException({
    $metadata: {},
    message: '',
    Item: { paymentStatus: mockPaymentRejectedStatus as never },
  })
  return { send: jest.fn().mockRejectedValue(error) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws_ConditionAccepted(): DynamoDBDocumentClient {
  const error: Error = new ConditionalCheckFailedException({
    $metadata: {},
    message: '',
    Item: { paymentStatus: mockPaymentAcceptedStatus as never },
  })
  return { send: jest.fn().mockRejectedValue(error) } as unknown as DynamoDBDocumentClient
}

describe(`Payments Service ProcessOrderPaymentWorker DbRecordOrderPaymentClient tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test RecordOrderPaymentCommand edge cases
   ************************************************************/
  it(`does not throw if the input RecordOrderPaymentCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbRecordOrderPaymentClient = new DbRecordOrderPaymentClient(mockDdbDocClient)
    await expect(dbRecordOrderPaymentClient.recordOrderPayment(mockRecordOrderPaymentCommand)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RecordOrderPaymentCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRecordOrderPaymentClient = new DbRecordOrderPaymentClient(mockDdbDocClient)
    const mockTestCommand = undefined as RecordOrderPaymentCommand
    const resultPromise = dbRecordOrderPaymentClient.recordOrderPayment(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RecordOrderPaymentCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRecordOrderPaymentClient = new DbRecordOrderPaymentClient(mockDdbDocClient)
    const mockTestCommand = null as RecordOrderPaymentCommand
    const resultPromise = dbRecordOrderPaymentClient.recordOrderPayment(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RecordOrderPaymentCommand is not an instance of the class`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRecordOrderPaymentClient = new DbRecordOrderPaymentClient(mockDdbDocClient)
    const mockTestCommand = { ...mockRecordOrderPaymentCommand }
    const resultPromise = dbRecordOrderPaymentClient.recordOrderPayment(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test RecordOrderPaymentCommand.commandData edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      RecordOrderPaymentCommand.commandData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRecordOrderPaymentClient = new DbRecordOrderPaymentClient(mockDdbDocClient)
    const mockTestCommand = buildMockRecordOrderPaymentCommand()
    mockTestCommand.commandData = undefined
    const resultPromise = dbRecordOrderPaymentClient.recordOrderPayment(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RecordOrderPaymentCommand.commandData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRecordOrderPaymentClient = new DbRecordOrderPaymentClient(mockDdbDocClient)
    const mockTestCommand = buildMockRecordOrderPaymentCommand()
    mockTestCommand.commandData = null
    const resultPromise = dbRecordOrderPaymentClient.recordOrderPayment(mockTestCommand)
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
    const dbRecordOrderPaymentClient = new DbRecordOrderPaymentClient(mockDdbDocClient)
    await dbRecordOrderPaymentClient.recordOrderPayment(mockRecordOrderPaymentCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbRecordOrderPaymentClient = new DbRecordOrderPaymentClient(mockDdbDocClient)
    await dbRecordOrderPaymentClient.recordOrderPayment(mockRecordOrderPaymentCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send throws an
      Error not accounted for`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRecordOrderPaymentClient = new DbRecordOrderPaymentClient(mockDdbDocClient)
    const resultPromise = dbRecordOrderPaymentClient.recordOrderPayment(mockRecordOrderPaymentCommand)
    await expect(resultPromise).rejects.toThrow(UnrecognizedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  it(`throws a non-transient PaymentAlreadyRejectedError if
      DynamoDBDocumentClient.send throws a TransactionCanceledException for the
      'PAYMENT_REJECTED' ConditionCheck`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws_ConditionRejected()
    const dbRecordOrderPaymentClient = new DbRecordOrderPaymentClient(mockDdbDocClient)
    const resultPromise = dbRecordOrderPaymentClient.recordOrderPayment(mockRecordOrderPaymentCommand)
    await expect(resultPromise).rejects.toThrow(PaymentAlreadyRejectedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient PaymentAlreadyAcceptedError if
      DynamoDBDocumentClient.send throws a TransactionCanceledException for the
      'PAYMENT_ACCEPTED' ConditionCheck`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws_ConditionAccepted()
    const dbRecordOrderPaymentClient = new DbRecordOrderPaymentClient(mockDdbDocClient)
    const resultPromise = dbRecordOrderPaymentClient.recordOrderPayment(mockRecordOrderPaymentCommand)
    await expect(resultPromise).rejects.toThrow(PaymentAlreadyAcceptedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected void if the execution path is successful`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbRecordOrderPaymentClient = new DbRecordOrderPaymentClient(mockDdbDocClient)
    const result = await dbRecordOrderPaymentClient.recordOrderPayment(mockRecordOrderPaymentCommand)
    const expectedResult = undefined as void
    expect(result).toStrictEqual(expectedResult)
  })
})
