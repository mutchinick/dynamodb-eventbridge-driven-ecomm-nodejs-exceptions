import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { DuplicateRestockOperationError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { RestockSkuCommand } from '../model/RestockSkuCommand'
import { DbRestockSkuClient } from './DbRestockSkuClient'

const mockWarehouseName = 'mockWarehouseTableName'

process.env.WAREHOUSE_TABLE_NAME = mockWarehouseName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockSku = 'mockSku'
const mockUnits = 3
const mockLotId = 'mockLotId'

function buildMockRestockSkuCommand(): TypeUtilsMutable<RestockSkuCommand> {
  const mockClass = RestockSkuCommand.validateAndBuild({
    incomingSkuRestockedEvent: {
      eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
      eventData: {
        sku: mockSku,
        units: mockUnits,
        lotId: mockLotId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    },
  })
  return mockClass
}

const mockRestockSkuCommand = buildMockRestockSkuCommand()

function buildMockDdbCommand(): TransactWriteCommand {
  const ddbCommand = new TransactWriteCommand({
    TransactItems: [
      {
        Put: {
          TableName: mockWarehouseName,
          Item: {
            pk: `WAREHOUSE#SKU#${mockSku}`,
            sk: `LOT_ID#${mockLotId}`,
            sku: mockSku,
            units: mockUnits,
            lotId: mockLotId,
            createdAt: mockDate,
            updatedAt: mockDate,
            _tn: 'WAREHOUSE#RESTOCK',
            _sn: `WAREHOUSE`,
            gsi1pk: 'WAREHOUSE#RESTOCK',
            gsi1sk: `CREATED_AT#${mockDate}`,
          },
          ConditionExpression: 'attribute_not_exists(pk)',
        },
      },
      {
        Update: {
          TableName: mockWarehouseName,
          Key: {
            pk: `WAREHOUSE#SKU#${mockSku}`,
            sk: `SKU#${mockSku}`,
          },
          UpdateExpression:
            `SET ` +
            `#sku = :sku, ` +
            `#units = if_not_exists(#units, :zero) + :units, ` +
            `#createdAt = if_not_exists(#createdAt, :createdAt), ` +
            `#updatedAt = :updatedAt, ` +
            `#_tn = :_tn, ` +
            `#_sn = :_sn, ` +
            `#gsi1pk = :gsi1pk, ` +
            `#gsi1sk = :gsi1sk`,
          ExpressionAttributeNames: {
            '#sku': 'sku',
            '#units': 'units',
            '#createdAt': 'createdAt',
            '#updatedAt': 'updatedAt',
            '#_tn': '_tn',
            '#_sn': '_sn',
            '#gsi1pk': 'gsi1pk',
            '#gsi1sk': 'gsi1sk',
          },
          ExpressionAttributeValues: {
            ':sku': mockSku,
            ':units': mockUnits,
            ':createdAt': mockDate,
            ':updatedAt': mockDate,
            ':zero': 0,
            ':_tn': 'WAREHOUSE#SKU',
            ':_sn': 'WAREHOUSE',
            ':gsi1pk': 'WAREHOUSE#SKU',
            ':gsi1sk': `CREATED_AT#${mockDate}`,
          },
        },
      },
    ],
  })
  return ddbCommand
}

const expectedDdbCommand = buildMockDdbCommand()

//
// Mock clients
//
function buildMockDdbDocClient_resolves(): DynamoDBDocumentClient {
  return { send: jest.fn() } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

describe(`Warehouse Service RestockSkuWorker DbRestockSkuClient tests`, () => {
  //
  // Test RestockSkuCommand edge cases
  //
  it(`does not throw if the input RestockSkuCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    await expect(dbRestockSkuClient.restockSku(mockRestockSkuCommand)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input RestockSkuCommand is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockRestockSkuCommand = undefined as RestockSkuCommand
    const resultPromise = dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RestockSkuCommand is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockRestockSkuCommand = null as RestockSkuCommand
    const resultPromise = dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RestockSkuCommand is empty`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockRestockSkuCommand = {} as RestockSkuCommand
    const resultPromise = dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RestockSkuCommand.restockSkuData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockRestockSkuCommand = buildMockRestockSkuCommand()
    mockRestockSkuCommand.restockSkuData = undefined
    const resultPromise = dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RestockSkuCommand.restockSkuData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const mockRestockSkuCommand = buildMockRestockSkuCommand()
    mockRestockSkuCommand.restockSkuData = null
    const resultPromise = dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic
  //
  it(`calls DynamoDBDocumentClient.send a single time`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send throws a native Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const resultPromise = dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    await expect(resultPromise).rejects.toThrow(UnrecognizedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  //
  // Test transaction errors
  //
  it(`throws a non-transient DuplicateRestockOperationError if DynamoDBDocumentClient.send throws 
      a ConditionalCheckFailedException error when restocking the sku`, async () => {
    const mockError: Error = new TransactionCanceledException({
      $metadata: {},
      message: 'mockError',
      CancellationReasons: [{ Code: 'ConditionalCheckFailed' }, null],
    })
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const resultPromise = dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    await expect(resultPromise).rejects.toThrow(DuplicateRestockOperationError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test expected results
  //
  it(`returns a void if all components succeed`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbRestockSkuClient = new DbRestockSkuClient(mockDdbDocClient)
    const result = await dbRestockSkuClient.restockSku(mockRestockSkuCommand)
    expect(result).not.toBeDefined()
  })
})
