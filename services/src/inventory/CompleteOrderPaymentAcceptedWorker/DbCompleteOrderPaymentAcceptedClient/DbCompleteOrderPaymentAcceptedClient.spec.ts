import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError, InvalidStockCompletionError, UnrecognizedError } from '../../errors/AppError'
import { AllocationStatus } from '../../model/AllocationStatus'
import { InventoryEventName } from '../../model/InventoryEventName'
import { CompleteOrderPaymentAcceptedCommand } from '../model/CompleteOrderPaymentAcceptedCommand'
import { DbCompleteOrderPaymentAcceptedClient } from './DbCompleteOrderPaymentAcceptedClient'

const mockInventoryTableName = 'mockInventoryTableName'

process.env.INVENTORY_TABLE_NAME = mockInventoryTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockEventName = InventoryEventName.ORDER_PAYMENT_ACCEPTED_EVENT
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'
const mockNewAllocationStatus: AllocationStatus = 'COMPLETED_PAYMENT_ACCEPTED'
const mockExpectedAllocationStatus: AllocationStatus = 'ALLOCATED'

function buildMockCompleteOrderPaymentAcceptedCommand(): TypeUtilsMutable<CompleteOrderPaymentAcceptedCommand> {
  const mockClass = CompleteOrderPaymentAcceptedCommand.validateAndBuild({
    existingOrderAllocationData: {
      orderId: mockOrderId,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
      createdAt: mockDate,
      updatedAt: mockDate,
      allocationStatus: mockExpectedAllocationStatus,
    },
    incomingOrderPaymentAcceptedEvent: {
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

const mockCompleteOrderPaymentAcceptedCommand = buildMockCompleteOrderPaymentAcceptedCommand()

function buildMockDdbCommand(): UpdateCommand {
  const ddbCommand = new UpdateCommand({
    TableName: mockInventoryTableName,
    Key: {
      pk: `INVENTORY#SKU#${mockSku}`,
      sk: `SKU#${mockSku}#ORDER_ID#${mockOrderId}#ORDER_ALLOCATION`,
    },
    UpdateExpression: 'SET #allocationStatus = :newAllocationStatus, #updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#orderId': 'orderId',
      '#sku': 'sku',
      '#units': 'units',
      '#updatedAt': 'updatedAt',
      '#allocationStatus': 'allocationStatus',
    },
    ExpressionAttributeValues: {
      ':orderId': mockOrderId,
      ':sku': mockSku,
      ':units': mockUnits,
      ':updatedAt': mockDate,
      ':newAllocationStatus': mockNewAllocationStatus,
      ':expectedAllocationStatus': mockExpectedAllocationStatus,
    },
    ConditionExpression:
      'attribute_exists(pk) AND ' +
      'attribute_exists(sk) AND ' +
      '#orderId = :orderId AND ' +
      '#sku = :sku AND ' +
      '#units = :units AND ' +
      '#allocationStatus = :expectedAllocationStatus',
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

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

describe(`Inventory Service CompleteOrderPaymentAcceptedWorker
          DbCompleteOrderPaymentAcceptedClient tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommand edge cases
   ************************************************************/
  it(`does not throw if the input CompleteOrderPaymentAcceptedCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    await expect(
      dbCompleteOrderPaymentAcceptedClient.completeOrder(mockCompleteOrderPaymentAcceptedCommand),
    ).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    const mockTestCommand = undefined as CompleteOrderPaymentAcceptedCommand
    const resultPromise = dbCompleteOrderPaymentAcceptedClient.completeOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    const mockTestCommand = null as CompleteOrderPaymentAcceptedCommand
    const resultPromise = dbCompleteOrderPaymentAcceptedClient.completeOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommand is not an instance of the class`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    const mockTestCommand = { ...mockCompleteOrderPaymentAcceptedCommand }
    const resultPromise = dbCompleteOrderPaymentAcceptedClient.completeOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test CompleteOrderPaymentAcceptedCommand.commandData edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommand.commandData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    const mockTestCommand = buildMockCompleteOrderPaymentAcceptedCommand()
    mockTestCommand.commandData = undefined
    const resultPromise = dbCompleteOrderPaymentAcceptedClient.completeOrder(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      CompleteOrderPaymentAcceptedCommand.commandData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    const mockTestCommand = buildMockCompleteOrderPaymentAcceptedCommand()
    mockTestCommand.commandData = null
    const resultPromise = dbCompleteOrderPaymentAcceptedClient.completeOrder(mockTestCommand)
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
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    await dbCompleteOrderPaymentAcceptedClient.completeOrder(mockCompleteOrderPaymentAcceptedCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    await dbCompleteOrderPaymentAcceptedClient.completeOrder(mockCompleteOrderPaymentAcceptedCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send throws an
      unwrapped Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    const resultPromise = dbCompleteOrderPaymentAcceptedClient.completeOrder(mockCompleteOrderPaymentAcceptedCommand)
    await expect(resultPromise).rejects.toThrow(UnrecognizedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  it(`throws a non-transient InvalidStockCompletionError if
      DynamoDBDocumentClient.send throws a ConditionalCheckFailedException when
      completing the stock`, async () => {
    const mockError: Error = new ConditionalCheckFailedException({ $metadata: {}, message: '' })
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    const resultPromise = dbCompleteOrderPaymentAcceptedClient.completeOrder(mockCompleteOrderPaymentAcceptedCommand)
    await expect(resultPromise).rejects.toThrow(InvalidStockCompletionError)
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
    const dbCompleteOrderPaymentAcceptedClient = new DbCompleteOrderPaymentAcceptedClient(mockDdbDocClient)
    const result = await dbCompleteOrderPaymentAcceptedClient.completeOrder(mockCompleteOrderPaymentAcceptedCommand)
    expect(result).not.toBeDefined()
  })
})
