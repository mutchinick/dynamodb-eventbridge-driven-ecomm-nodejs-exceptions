import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { DuplicateEventRaisedError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { SkuRestockedEvent } from '../model/SkuRestockedEvent'
import { EsRaiseSkuRestockedEventClient } from './EsRaiseSkuRestockedEventClient'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

function buildMockSkuRestockedEvent(): TypeUtilsMutable<SkuRestockedEvent> {
  const mockClass = SkuRestockedEvent.validateAndBuild({
    sku: 'mockSku',
    units: 2,
    lotId: 'mockLotId',
  })
  return mockClass
}

const mockSkuRestockedEvent = buildMockSkuRestockedEvent()

const expectedDdbDocClientInput = new PutCommand({
  TableName: mockEventStoreTableName,
  Item: {
    pk: `SKU#${mockSkuRestockedEvent.eventData.sku}`,
    sk: `EVENT#${mockSkuRestockedEvent.eventName}#LOT_ID#${mockSkuRestockedEvent.eventData.lotId}`,
    _tn: '#EVENT',
    ...mockSkuRestockedEvent,
  },
  ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
})

//
// Mock clients
//
function buildMockDdbDocClient_resolves(): DynamoDBDocumentClient {
  return { send: jest.fn() } as unknown as DynamoDBDocumentClient
}

function buildMockDdbDocClient_throws(error?: unknown): DynamoDBDocumentClient {
  return { send: jest.fn().mockRejectedValue(error ?? new Error()) } as unknown as DynamoDBDocumentClient
}

describe(`Warehouse Service RestockSkuApi EsRaiseSkuRestockedEventClient tests`, () => {
  //
  // Test SkuRestockedEvent edge cases
  //
  it(`does not throw if the input SkuRestockedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    await expect(esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockSkuRestockedEvent)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input SkuRestockedEvent is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as SkuRestockedEvent
    const resultPromise = esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input SkuRestockedEvent is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const mockTestEvent = null as SkuRestockedEvent
    const resultPromise = esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input SkuRestockedEvent.eventData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockSkuRestockedEvent()
    mockTestEvent.eventData = undefined
    const resultPromise = esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input SkuRestockedEvent.eventData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockSkuRestockedEvent()
    mockTestEvent.eventData = null
    const resultPromise = esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic
  //
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
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ input: expectedDdbDocClientInput.input }),
    )
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send throws a native Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const resultPromise = esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockSkuRestockedEvent)
    await expect(resultPromise).rejects.toThrow(UnrecognizedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  it(`throws a non-transient DuplicateEventRaisedError if DynamoDBDocumentClient.send throws 
      a ConditionalCheckFailedException`, async () => {
    const mockError = new ConditionalCheckFailedException({ $metadata: {}, message: 'ConditionalCheckFailed' })
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const esRaiseSkuRestockedEventClient = new EsRaiseSkuRestockedEventClient(mockDdbDocClient)
    const resultPromise = esRaiseSkuRestockedEventClient.raiseSkuRestockedEvent(mockSkuRestockedEvent)
    await expect(resultPromise).rejects.toThrow(DuplicateEventRaisedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })
})
