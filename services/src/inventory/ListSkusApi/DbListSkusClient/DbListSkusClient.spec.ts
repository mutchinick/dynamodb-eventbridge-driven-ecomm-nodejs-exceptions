import { DynamoDBDocumentClient, QueryCommand, QueryCommandOutput } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { SkuData } from '../../model/SkuData'
import { type SortDirection } from '../../model/SortDirection'
import { ListSkusCommand, ListSkusCommandInput } from '../model/ListSkusCommand'
import { DbListSkusClient } from './DbListSkusClient'

const mockInventoryTableName = 'mockInventoryTableName'

process.env.INVENTORY_TABLE_NAME = mockInventoryTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockSku = 'mockSku'
const mockSortDirection = 'desc'
const mockLimit = 30

function buildMockListSkusCommand(listSkusCommandInput: ListSkusCommandInput): TypeUtilsMutable<ListSkusCommand> {
  const mockClass = ListSkusCommand.validateAndBuild(listSkusCommandInput)
  return mockClass
}

const mockListSkusCommand = buildMockListSkusCommand({})

/*
 *
 *
 ************************************************************
 * By Sku
 ************************************************************/
function buildMockDdbCommand_BySku(sku: string): QueryCommand {
  const skuListPk = `INVENTORY#SKU#${sku}`
  const skuListSk = `SKU#${sku}`
  const ddbCommand = new QueryCommand({
    TableName: mockInventoryTableName,
    KeyConditionExpression: '#pk = :pk AND #sk = :sk',
    ExpressionAttributeNames: {
      '#pk': 'pk',
      '#sk': 'sk',
    },
    ExpressionAttributeValues: {
      ':pk': skuListPk,
      ':sk': skuListSk,
    },
  })
  return ddbCommand
}

/*
 *
 *
 ************************************************************
 * List filtered (sortDirection and limit)
 ************************************************************/
function buildMockDdbCommand_ListFiltered(sortDirection: SortDirection, limit: number): QueryCommand {
  const indexName = 'gsi1pk-gsi1sk-index'
  const skuListGsi1pk = `INVENTORY#SKU`
  const ddbCommand = new QueryCommand({
    TableName: mockInventoryTableName,
    IndexName: indexName,
    KeyConditionExpression: '#gsi1pk = :gsi1pk',
    ExpressionAttributeNames: {
      '#gsi1pk': 'gsi1pk',
    },
    ExpressionAttributeValues: {
      ':gsi1pk': skuListGsi1pk,
    },
    ScanIndexForward: sortDirection !== 'desc',
    Limit: limit,
  })
  return ddbCommand
}

/*
 *
 *
 ************************************************************
 * List default (no filters)
 ************************************************************/
function buildMockDdbCommand_ListDefault(): QueryCommand {
  const indexName = 'gsi1pk-gsi1sk-index'
  const skuListGsi1pk = `INVENTORY#SKU`
  const ddbCommand = new QueryCommand({
    TableName: mockInventoryTableName,
    IndexName: indexName,
    KeyConditionExpression: '#gsi1pk = :gsi1pk',
    ExpressionAttributeNames: {
      '#gsi1pk': 'gsi1pk',
    },
    ExpressionAttributeValues: {
      ':gsi1pk': skuListGsi1pk,
    },
    ScanIndexForward: DbListSkusClient.DEFAULT_SORT_DIRECTION === 'asc',
    Limit: DbListSkusClient.DEFAULT_LIMIT,
  })
  return ddbCommand
}

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
const mockExistingSkuData: SkuData[] = [
  {
    sku: mockSku,
    units: 2,
    createdAt: mockDate,
    updatedAt: mockDate,
  },
  {
    sku: `${mockSku}-2`,
    units: 2,
    createdAt: mockDate,
    updatedAt: mockDate,
  },
]

function buildMockDdbDocClient_resolves(resulting: 'many' | 'one' | 'none' = 'many'): DynamoDBDocumentClient {
  const items = resulting === 'many' ? mockExistingSkuData : resulting === 'one' ? [mockExistingSkuData[0]] : []
  const itemsCount = items ? items.length : 0
  const mockGetCommandResult: QueryCommandOutput = {
    Items: items,
    Count: itemsCount,
    $metadata: {},
  }
  return { send: jest.fn().mockResolvedValue(mockGetCommandResult) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_resolves_nullItems(): DynamoDBDocumentClient {
  const mockGetCommandResult: QueryCommandOutput = {
    Items: null,
    $metadata: {},
  }
  return { send: jest.fn().mockResolvedValue(mockGetCommandResult) } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

describe(`Inventory Service ListSkusApi DbListSkusClient tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test ListSkusCommand edge cases
   ************************************************************/
  it(`does not throw if the input ListSkusCommand is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListSkusClient = new DbListSkusClient(mockDdbDocClient)
    await expect(dbListSkusClient.listSkus(mockListSkusCommand)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input ListSkusCommand is
      undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListSkusClient = new DbListSkusClient(mockDdbDocClient)
    const mockTestCommand = undefined as never
    const resultPromise = dbListSkusClient.listSkus(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input ListSkusCommand is
      null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListSkusClient = new DbListSkusClient(mockDdbDocClient)
    const mockTestCommand = null as never
    const resultPromise = dbListSkusClient.listSkus(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input ListSkusCommand is not
      an instance of the class`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListSkusClient = new DbListSkusClient(mockDdbDocClient)
    const mockTestCommand = { ...mockListSkusCommand }
    const resultPromise = dbListSkusClient.listSkus(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test ListSkusCommand.commandData edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      ListSkusCommand.commandData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListSkusClient = new DbListSkusClient(mockDdbDocClient)
    const mockTestCommand = buildMockListSkusCommand({})
    mockTestCommand.commandData = undefined
    const resultPromise = dbListSkusClient.listSkus(mockTestCommand)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListSkusCommand.commandData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListSkusClient = new DbListSkusClient(mockDdbDocClient)
    const mockTestCommand = buildMockListSkusCommand({})
    mockTestCommand.commandData = null
    const resultPromise = dbListSkusClient.listSkus(mockTestCommand)
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
    const dbListSkusClient = new DbListSkusClient(mockDdbDocClient)
    await dbListSkusClient.listSkus(mockListSkusCommand)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input (list by sku)`, async () => {
    const mockTestCommand = buildMockListSkusCommand({ sku: mockSku })
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListSkusClient = new DbListSkusClient(mockDdbDocClient)
    await dbListSkusClient.listSkus(mockTestCommand)
    const expectedDdbCommand = buildMockDdbCommand_BySku(mockSku)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`calls DynamoDBDocumentClient.send with the expected input (list filtered)`, async () => {
    const mockTestCommand = buildMockListSkusCommand({ sortDirection: mockSortDirection, limit: mockLimit })
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListSkusClient = new DbListSkusClient(mockDdbDocClient)
    await dbListSkusClient.listSkus(mockTestCommand)
    const expectedDdbCommand = buildMockDdbCommand_ListFiltered(mockSortDirection, mockLimit)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`calls DynamoDBDocumentClient.send with the expected input (list default)`, async () => {
    const mockTestCommand = buildMockListSkusCommand({})
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const dbListSkusClient = new DbListSkusClient(mockDdbDocClient)
    await dbListSkusClient.listSkus(mockTestCommand)
    const expectedDdbCommand = buildMockDdbCommand_ListDefault()
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send throws an
      unwrapped Error`, async () => {
    const mockError = new Error('mockError')
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const dbListSkusClient = new DbListSkusClient(mockDdbDocClient)
    const resultPromise = dbListSkusClient.listSkus(mockListSkusCommand)
    await expect(resultPromise).rejects.toThrow(UnrecognizedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected empty SkuData[] if DynamoDBDocumentClient.send returns
      Items with null items`, async () => {
    const mockTestCommand = buildMockListSkusCommand({})
    const mockDdbDocClient = buildMockDdbDocClient_resolves_nullItems()
    const dbListSkusClient = new DbListSkusClient(mockDdbDocClient)
    const result = await dbListSkusClient.listSkus(mockTestCommand)
    const expectedResult: SkuData[] = []
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected empty SkuData[] if DynamoDBDocumentClient.send returns
      Items with no items`, async () => {
    const mockTestCommand = buildMockListSkusCommand({})
    const mockDdbDocClient = buildMockDdbDocClient_resolves('none')
    const dbListSkusClient = new DbListSkusClient(mockDdbDocClient)
    const result = await dbListSkusClient.listSkus(mockTestCommand)
    const expectedResult: SkuData[] = []
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected SkuData[] if DynamoDBDocumentClient.send returns Items with
      one item`, async () => {
    const mockTestCommand = buildMockListSkusCommand({})
    const mockDdbDocClient = buildMockDdbDocClient_resolves('one')
    const dbListSkusClient = new DbListSkusClient(mockDdbDocClient)
    const result = await dbListSkusClient.listSkus(mockTestCommand)
    const expectedResult: SkuData[] = [
      {
        sku: mockExistingSkuData[0].sku,
        units: mockExistingSkuData[0].units,
        createdAt: mockExistingSkuData[0].createdAt,
        updatedAt: mockExistingSkuData[0].updatedAt,
      },
    ]
    expect(result).toStrictEqual(expectedResult)
  })

  it(`returns the expected SkuData[] if DynamoDBDocumentClient.send returns Items with
      many items`, async () => {
    const mockTestCommand = buildMockListSkusCommand({ sortDirection: mockSortDirection, limit: mockLimit })
    const mockDdbDocClient = buildMockDdbDocClient_resolves('many')
    const dbListSkusClient = new DbListSkusClient(mockDdbDocClient)
    const result = await dbListSkusClient.listSkus(mockTestCommand)
    const expectedResult: SkuData[] = [
      {
        sku: mockExistingSkuData[0].sku,
        units: mockExistingSkuData[0].units,
        createdAt: mockExistingSkuData[0].createdAt,
        updatedAt: mockExistingSkuData[0].updatedAt,
      },
      {
        sku: mockExistingSkuData[1].sku,
        units: mockExistingSkuData[1].units,
        createdAt: mockExistingSkuData[1].createdAt,
        updatedAt: mockExistingSkuData[1].updatedAt,
      },
    ]
    expect(result).toStrictEqual(expectedResult)
  })
})
