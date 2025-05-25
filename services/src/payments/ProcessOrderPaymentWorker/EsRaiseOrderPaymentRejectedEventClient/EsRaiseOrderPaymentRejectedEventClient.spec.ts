import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { DuplicateEventRaisedError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { PaymentsEventName } from '../../model/PaymentsEventName'
import { OrderPaymentRejectedEvent } from '../model/OrderPaymentRejectedEvent'
import { EsRaiseOrderPaymentRejectedEventClient } from './EsRaiseOrderPaymentRejectedEventClient'

const mockEventStoreTableName = 'mockEventStoreTableName'

process.env.EVENT_STORE_TABLE_NAME = mockEventStoreTableName

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockEventName = PaymentsEventName.ORDER_PAYMENT_REJECTED_EVENT
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.32
const mockUserId = 'mockUserId'

function buildMockOrderPaymentRejectedEvent(): TypeUtilsMutable<OrderPaymentRejectedEvent> {
  const mockClass = OrderPaymentRejectedEvent.validateAndBuild({
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
  })
  return mockClass
}

const mockOrderPaymentRejectedEvent = buildMockOrderPaymentRejectedEvent()

function buildMockDdbCommand(): PutCommand {
  const ddbCommand = new PutCommand({
    TableName: mockEventStoreTableName,
    Item: {
      pk: `EVENTS#ORDER_ID#${mockOrderId}`,
      sk: `EVENT#${mockEventName}`,
      _tn: `EVENTS#EVENT`,
      _sn: `EVENTS`,
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

describe(`Payments Service ProcessOrderPaymentApi EsRaiseOrderPaymentRejectedEventClient
          tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test OrderPaymentRejectedEvent edge cases
   ************************************************************/
  it(`does not throw if the input OrderPaymentRejectedEvent is valid`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPaymentRejectedEventClient = new EsRaiseOrderPaymentRejectedEventClient(mockDdbDocClient)
    const resultPromise =
      esRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent(mockOrderPaymentRejectedEvent)
    await expect(resultPromise).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEvent is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPaymentRejectedEventClient = new EsRaiseOrderPaymentRejectedEventClient(mockDdbDocClient)
    const mockTestEvent = undefined as OrderPaymentRejectedEvent
    const resultPromise = esRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEvent is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPaymentRejectedEventClient = new EsRaiseOrderPaymentRejectedEventClient(mockDdbDocClient)
    const mockTestEvent = null as OrderPaymentRejectedEvent
    const resultPromise = esRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEvent is not an instance of the class`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPaymentRejectedEventClient = new EsRaiseOrderPaymentRejectedEventClient(mockDdbDocClient)
    const mockTestEvent = { ...mockOrderPaymentRejectedEvent }
    const resultPromise = esRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderPaymentRejectedEvent.eventData edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEvent.eventData is undefined`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPaymentRejectedEventClient = new EsRaiseOrderPaymentRejectedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockOrderPaymentRejectedEvent()
    mockTestEvent.eventData = undefined
    const resultPromise = esRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent(mockTestEvent)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEvent.eventData is null`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPaymentRejectedEventClient = new EsRaiseOrderPaymentRejectedEventClient(mockDdbDocClient)
    const mockTestEvent = buildMockOrderPaymentRejectedEvent()
    mockTestEvent.eventData = null
    const resultPromise = esRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent(mockTestEvent)
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
    const esRaiseOrderPaymentRejectedEventClient = new EsRaiseOrderPaymentRejectedEventClient(mockDdbDocClient)
    await esRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent(mockOrderPaymentRejectedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledTimes(1)
  })

  it(`calls DynamoDBDocumentClient.send with the expected input`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_resolves()
    const esRaiseOrderPaymentRejectedEventClient = new EsRaiseOrderPaymentRejectedEventClient(mockDdbDocClient)
    await esRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent(mockOrderPaymentRejectedEvent)
    expect(mockDdbDocClient.send).toHaveBeenCalledWith(expect.objectContaining({ input: expectedDdbCommand.input }))
  })

  it(`throws a transient UnrecognizedError if DynamoDBDocumentClient.send throws an
      unwrapped Error`, async () => {
    const mockDdbDocClient = buildMockDdbDocClient_throws()
    const esRaiseOrderPaymentRejectedEventClient = new EsRaiseOrderPaymentRejectedEventClient(mockDdbDocClient)
    const resultPromise =
      esRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent(mockOrderPaymentRejectedEvent)
    await expect(resultPromise).rejects.toThrow(UnrecognizedError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: true }))
  })

  it(`throws a non-transient DuplicateEventRaisedError if DynamoDBDocumentClient.send
      throws a ConditionalCheckFailedException`, async () => {
    const mockError = new ConditionalCheckFailedException({ $metadata: {}, message: 'ConditionalCheckFailed' })
    const mockDdbDocClient = buildMockDdbDocClient_throws(mockError)
    const esRaiseOrderPaymentRejectedEventClient = new EsRaiseOrderPaymentRejectedEventClient(mockDdbDocClient)
    const resultPromise =
      esRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent(mockOrderPaymentRejectedEvent)
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
    const esRaiseOrderPaymentRejectedEventClient = new EsRaiseOrderPaymentRejectedEventClient(mockDdbDocClient)
    const result =
      await esRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent(mockOrderPaymentRejectedEvent)
    const expectedResult = undefined as void
    expect(result).toStrictEqual(expectedResult)
  })
})
