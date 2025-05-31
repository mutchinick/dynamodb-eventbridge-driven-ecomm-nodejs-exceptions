import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { DuplicateEventRaisedError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { InventoryEventName } from '../../model/InventoryEventName'
import { SkuRestockedEvent } from '../model/SkuRestockedEvent'
import { EsRaiseSkuRestockedEventClient } from './EsRaiseSkuRestockedEventClient'

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockEventName = InventoryEventName.SKU_RESTOCKED_EVENT
const mockSku = 'mockSku'
const mockUnits = 8
const mockLotId = 'mockLotId'

function buildMockSkuRestockedEvent(): TypeUtilsMutable<SkuRestockedEvent> {
  const mockClass = SkuRestockedEvent.validateAndBuild({
    sku: mockSku,
    units: mockUnits,
    lotId: mockLotId,
  })
  return mockClass
}

const mockSkuRestockedEvent = buildMockSkuRestockedEvent()

function buildMockDdbCommand(): PutCommand {
  const ddbCommand = new PutCommand({
    TableName: mockEventStoreTableName,
    Item: {
      pk: `EVENTS#SKU#${mockSku}`,
      sk: `EVENT#${mockEventName}#LOT_ID#${mockLotId}`,
      _tn: `EVENTS#EVENT`,
      _sn: `EVENTS`,
      eventName: InventoryEventName.SKU_RESTOCKED_EVENT,
      eventData: {
        sku: mockSku,
        units: mockUnits,
        lotId: mockLotId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
      gsi1pk: `EVENTS#EVENT`,
      gsi1sk: `CREATED_AT#${mockDate}`,
    },
    ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
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

describe(`Inventory Service RestockSkuApi EsRaiseSkuRestockedEventClient tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test SkuRestockedEvent edge cases
   ************************************************************/
  it(`does not throw if the input SkuRestockedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    await expect(esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockSkuRestockedEvent)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input SkuRestockedEvent is
      undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as SkuRestockedEvent
    const resultPromise = esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input SkuRestockedEvent is
      null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const mockTestEvent = null as SkuRestockedEvent
    const resultPromise = esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input SkuRestockedEvent is
      not an instance of the class`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const mockTestEvent = { ...mockSkuRestockedEvent }
    const resultPromise = esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test SkuRestockedEvent.eventData edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      SkuRestockedEvent.eventData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockSkuRestockedEvent()
    mockTestEvent.eventData = undefined
    const resultPromise = esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      SkuRestockedEvent.eventData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockSkuRestockedEvent()
    mockTestEvent.eventData = null
    const resultPromise = esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockTestEvent)
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
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    await esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockSkuRestockedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    await esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockSkuRestockedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send throws an
      unwrapped Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const resultPromise = esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockSkuRestockedEvent)
    await expect(resultPromise).rejects.toThrow(UnrecognizedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  it(`throws a non-transient DuplicateEventRaisedError if DynamoDBDocumentClient.send
      throws a ConditionalCheckFailedException`, async () => {
    const mockError = new ConditionalCheckFailedException({ $metadata: {}, message: 'ConditionalCheckFailed' })
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const resultPromise = esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockSkuRestockedEvent)
    await expect(resultPromise).rejects.toThrow(DuplicateEventRaisedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected result
   ************************************************************/
  it(`returns the expected void if the execution path is successful`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const result = await esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockSkuRestockedEvent)
    const expectedResult = undefined as void
    expect(result).toStrictEqual(expectedResult)
  })
})
