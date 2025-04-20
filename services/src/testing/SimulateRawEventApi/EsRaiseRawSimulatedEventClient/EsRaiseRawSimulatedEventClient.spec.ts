import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { DuplicateEventRaisedError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { RawSimulatedEvent } from '../model/RawSimulatedEvent'
import { EsRaiseRawSimulatedEventClient } from './EsRaiseRawSimulatedEventClient'

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toUTCString()
const mockPk = 'mockPk'
const mockSk = 'mockSk'
const mockEventName = 'mockEventName'
const mockEventData = {}

function buildMockRawSimulatedEvent(): TypeUtilsMutable<RawSimulatedEvent> {
  const mockClass = RawSimulatedEvent.validateAndBuild({
    pk: mockPk,
    sk: mockSk,
    eventName: mockEventName,
    eventData: mockEventData,
    createdAt: mockDate,
    updatedAt: mockDate,
  })
  return mockClass
}

const mockRawSimulatedEvent = buildMockRawSimulatedEvent()

function buildMockDdbCommand(): PutCommand {
  const ddbCommand = new PutCommand({
    TableName: mockEventStoreTableName,
    Item: {
      pk: mockPk,
      sk: mockSk,
      eventName: mockEventName,
      eventData: mockEventData,
      createdAt: mockDate,
      updatedAt: mockDate,
      _tn: `EVENTS#EVENT`,
      _sn: `EVENTS`,
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

describe(`Testing Service SimulateRawEventApi EsRaiseRawSimulatedEventClient tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test RawSimulatedEvent edge cases
   ************************************************************/
  it(`does not throw if the input RawSimulatedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    await expect(esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockRawSimulatedEvent)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEvent is
      undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as never
    const resultPromise = esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEvent is
      null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    const mockTestEvent = null as never
    const resultPromise = esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEvent is
      not an instance of the class`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    const mockTestEvent = { ...mockRawSimulatedEvent }
    const resultPromise = esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockTestEvent)
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
    const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    await esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockRawSimulatedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    await esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockRawSimulatedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send throws an
      unwrapped Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    const resultPromise = esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockRawSimulatedEvent)
    await expect(resultPromise).rejects.toThrow(UnrecognizedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  it(`throws a non-transient DuplicateEventRaisedError if DynamoDBDocumentClient.send
      throws a ConditionalCheckFailedException`, async () => {
    const mockError = new ConditionalCheckFailedException({ $metadata: {}, message: '' })
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    const resultPromise = esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockRawSimulatedEvent)
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
    const esRaiseRawSimulatedEventClient = new EsRaiseRawSimulatedEventClient(mockDdbDocClient)
    const result = await esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(mockRawSimulatedEvent)
    const expectedResult = undefined as void
    expect(result).toStrictEqual(expectedResult)
  })
})
