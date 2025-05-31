import { DynamoDBDocumentClient, GetCommand, GetCommandOutput } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { GetOrderPaymentCommand } from '../model/GetOrderPaymentCommand'
import { DbGetOrderPaymentClient } from './DbGetOrderPaymentClient'

const mockPaymentsTableName = 'mockPaymentsTableName'

process.env.PAYMENTS_TABLE_NAME = mockPaymentsTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'

function buildMockGetOrderPaymentCommand(): TypeUtilsMutable<GetOrderPaymentCommand> {
  const mockClass = GetOrderPaymentCommand.validateAndBuild({
    orderId: mockOrderId,
  })
  return mockClass
}

const mockGetOrderPaymentCommand = buildMockGetOrderPaymentCommand()

function buildMockDdbCommand(): GetCommand {
  const ddbCommand = new GetCommand({
    TableName: mockPaymentsTableName,
    Key: {
      pk: `PAYMENTS#ORDER_ID#${mockOrderId}`,
      sk: `ORDER_ID#${mockOrderId}#ORDER_PAYMENT`,
    },
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
const mockExistingOrderPaymentData: OrderPaymentData = {
  orderId: mockGetOrderPaymentCommand.commandData.orderId,
  sku: 'mockSku',
  units: 2,
  price: 5.55,
  userId: 'mockUserId',
  createdAt: mockDate,
  updatedAt: mockDate,
  paymentId: 'mockPaymentId',
  paymentStatus: 'PAYMENT_ACCEPTED',
  paymentRetries: 0,
}

function buildMockDdbDocClient_resolves_validItem(): DynamoDBDocumentClient {
  const mockDdbOutput: GetCommandOutput = {
    Item: mockExistingOrderPaymentData,
    $metadata: {},
  }
  return { send: jest.fn().mockResolvedValue(mockDdbOutput) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_resolves_nullItem(): DynamoDBDocumentClient {
  const mockDdbOutput: GetCommandOutput = {
    Item: null,
    $metadata: {},
  }
  return { send: jest.fn().mockResolvedValue(mockDdbOutput) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

describe(`Payments Service ProcessOrderPaymentWorker DbGetOrderPaymentClient tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test GetOrderPaymentCommand edge cases
   ************************************************************/
  it(`does not throw if the input GetOrderPaymentCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderPaymentClient = new DbGetOrderPaymentClient(mockDdbDocClient)
    await expect(dbGetOrderPaymentClient.getOrderPayment(mockGetOrderPaymentCommand)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input GetOrderPaymentCommand
      is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderPaymentClient = new DbGetOrderPaymentClient(mockDdbDocClient)
    const mockTestCommand = undefined as never
    const resultPromise = dbGetOrderPaymentClient.getOrderPayment(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input GetOrderPaymentCommand
      is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderPaymentClient = new DbGetOrderPaymentClient(mockDdbDocClient)
    const mockTestCommand = null as never
    const resultPromise = dbGetOrderPaymentClient.getOrderPayment(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input GetOrderPaymentCommand
      is not an instance of the class`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderPaymentClient = new DbGetOrderPaymentClient(mockDdbDocClient)
    const mockTestCommand = { ...mockGetOrderPaymentCommand }
    const resultPromise = dbGetOrderPaymentClient.getOrderPayment(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test GetOrderPaymentCommand.commandData edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderPaymentCommand.commandData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderPaymentClient = new DbGetOrderPaymentClient(mockDdbDocClient)
    const mockTestCommand = buildMockGetOrderPaymentCommand()
    mockTestCommand.commandData = undefined
    const resultPromise = dbGetOrderPaymentClient.getOrderPayment(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderPaymentCommand.commandData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderPaymentClient = new DbGetOrderPaymentClient(mockDdbDocClient)
    const mockTestCommand = buildMockGetOrderPaymentCommand()
    mockTestCommand.commandData = null
    const resultPromise = dbGetOrderPaymentClient.getOrderPayment(mockTestCommand)
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
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderPaymentClient = new DbGetOrderPaymentClient(mockDdbDocClient)
    await dbGetOrderPaymentClient.getOrderPayment(mockGetOrderPaymentCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderPaymentClient = new DbGetOrderPaymentClient(mockDdbDocClient)
    await dbGetOrderPaymentClient.getOrderPayment(mockGetOrderPaymentCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send throws an
      Error not not accounted for`, async () => {
    const mockError = new Error('mockError')
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const dbGetOrderPaymentClient = new DbGetOrderPaymentClient(mockDdbDocClient)
    const resultPromise = dbGetOrderPaymentClient.getOrderPayment(mockGetOrderPaymentCommand)
    await expect(resultPromise).rejects.toThrow(UnrecognizedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected null if DynamoDBDocumentClient.send returns a null Item`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_nullItem()
    const dbGetOrderPaymentClient = new DbGetOrderPaymentClient(mockDdbDocClient)
    const result = await dbGetOrderPaymentClient.getOrderPayment(mockGetOrderPaymentCommand)
    const expectedResult: OrderPaymentData = null
    expect(result).toBe(expectedResult)
  })

  it(`returns the expected OrderPaymentData if DynamoDBDocumentClient.send returns an
      Item with data`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves_validItem()
    const dbGetOrderPaymentClient = new DbGetOrderPaymentClient(mockDdbDocClient)
    const result = await dbGetOrderPaymentClient.getOrderPayment(mockGetOrderPaymentCommand)
    const expectedResult: OrderPaymentData = {
      orderId: mockExistingOrderPaymentData.orderId,
      sku: mockExistingOrderPaymentData.sku,
      units: mockExistingOrderPaymentData.units,
      price: mockExistingOrderPaymentData.price,
      userId: mockExistingOrderPaymentData.userId,
      createdAt: mockExistingOrderPaymentData.createdAt,
      updatedAt: mockExistingOrderPaymentData.updatedAt,
      paymentId: mockExistingOrderPaymentData.paymentId,
      paymentStatus: mockExistingOrderPaymentData.paymentStatus,
      paymentRetries: mockExistingOrderPaymentData.paymentRetries,
    }
    expect(result).toStrictEqual(expectedResult)
  })
})
