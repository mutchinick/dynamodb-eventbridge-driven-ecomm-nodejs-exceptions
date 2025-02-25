import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { EventBridgeEvent } from 'aws-lambda'
import { InvalidArgumentsError } from '../../errors/AppError'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { IncomingSkuRestockedEvent } from './IncomingSkuRestockedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

type Mutable_IncomingSkuRestockedEvent = {
  -readonly [K in keyof IncomingSkuRestockedEvent]: IncomingSkuRestockedEvent[K]
}

type MockEventDetail = {
  eventName: 'INSERT'
  eventSource: 'aws:dynamodb'
  eventID: string
  eventVersion: string
  awsRegion: string
  dynamodb: {
    NewImage: AttributeValue | Record<string, AttributeValue>
  }
}

function buildMockEventBrideEvent(incomingSkuRestockedEvent: IncomingSkuRestockedEvent) {
  const mockEventBridgeEvent: EventBridgeEvent<string, MockEventDetail> = {
    id: `mockId`,
    version: '0',
    'detail-type': 'mockDetailType',
    source: 'mockSource',
    account: 'mockAccount',
    time: 'mockTime',
    region: 'mockRegion',
    resources: [],
    detail: {
      eventID: 'mockEventId',
      eventVersion: 'mockEventVersion',
      awsRegion: 'mockAwsRegion',
      eventName: 'INSERT',
      eventSource: 'aws:dynamodb',
      dynamodb: {
        NewImage: marshall(incomingSkuRestockedEvent, { removeUndefinedValues: true }),
      },
    },
  }

  return mockEventBridgeEvent
}

function buildMockValidIncomingSkuRestockedEvent(): Mutable_IncomingSkuRestockedEvent {
  const incomingSkuRestockedEvent: Mutable_IncomingSkuRestockedEvent = {
    eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
    eventData: {
      sku: 'mockSku',
      units: 4,
      lotId: 'mockLotId',
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return incomingSkuRestockedEvent
}

describe(`Warehouse Service RestockSkuWorker IncomingSkuRestockedEvent tests`, () => {
  //
  // Test valid IncomingSkuRestockedEvent success
  //
  it(`does not throw if the input IncomingSkuRestockedEvent is valid`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).not.toThrow()
  })

  // Test EventBridgeEvent edge cases
  //
  it(`throws an InvalidArgumentsError if the input EventBridgeEvent is undefined`, () => {
    const mockEventBridgeEvent = undefined as never
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input EventBridgeEvent is invalid`, () => {
    const mockEventBridgeEvent = 'mockInvalidValue' as never
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  //
  // Test EventBridgeEvent.detail edge cases
  //
  it(`throws an InvalidArgumentsError if the input EventBridgeEvent.detail is missing`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    delete mockEventBridgeEvent.detail
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input EventBridgeEvent.detail is undefined`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail = undefined as never
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input EventBridgeEvent.detail is invalid`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail = 'mockInvalidValue' as never
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  //
  // Test EventBridgeEvent.detail.dynamodb edge cases
  //
  it(`throws an InvalidArgumentsError if the input EventBridgeEvent.detail.dynamodb is missing`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    delete mockEventBridgeEvent.detail.dynamodb
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input EventBridgeEvent.detail.dynamodb is undefined`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail.dynamodb = undefined as never
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input EventBridgeEvent.detail.dynamodb is invalid`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail.dynamodb = 'mockInvalidValue' as never
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  //
  // Test EventBridgeEvent.detail.dynamodb.newImage edge cases
  //
  it(`throws an InvalidArgumentsError if the input EventBridgeEvent.detail.dynamodb.newImage
      (IncomingSkuRestockedEvent) is missing`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    delete mockEventBridgeEvent.detail.dynamodb.NewImage
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input EventBridgeEvent.detail.dynamodb.newImage
      (IncomingSkuRestockedEvent) is undefined`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = undefined as never
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input EventBridgeEvent.detail.dynamodb.newImage
      (IncomingSkuRestockedEvent) is invalid`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    mockEventBridgeEvent.detail.dynamodb.NewImage = 'mockInvalidValue' as never
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  //
  // Test IncomingSkuRestockedEvent.eventName edge cases
  //
  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventName is missing`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    delete mockIncomingSkuRestockedEvent.eventName
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventName is undefined`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventName = undefined
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventName is null`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventName = null
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventName is empty`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventName = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventName is blank`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventName = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventName
      is not an WarehouseEventName`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventName = 'mockEventName' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  //
  // Test IncomingSkuRestockedEvent.eventData edge cases
  //
  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData is missing`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    delete mockIncomingSkuRestockedEvent.eventData
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData is undefined`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData is null`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData is empty`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData = {} as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData invalid`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData = 'mockInvalidValue' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  //
  // Test IncomingSkuRestockedEvent.eventData.sku edge cases
  //
  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.sku is missing`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    delete mockIncomingSkuRestockedEvent.eventData.sku
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.sku is undefined`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.sku = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.sku is null`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.sku = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.sku is empty`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.sku = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.sku is blank`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.sku = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.sku length < 4`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.sku = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  //
  // Test IncomingSkuRestockedEvent.eventData.units edge cases
  //
  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.units is missing`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    delete mockIncomingSkuRestockedEvent.eventData.units
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.units is undefined`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.units = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.units is null`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.units = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.units is empty`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.units = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.units is not a number`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.units = '1' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.units < 1`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.units = 0
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.units is not an integer`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.units = 3.45
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  //
  // Test IncomingSkuRestockedEvent.eventData.lotId edge cases
  //
  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.lotId is missing`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    delete mockIncomingSkuRestockedEvent.eventData.lotId
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.lotId is undefined`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.lotId = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.lotId is null`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.lotId = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.lotId is empty`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.lotId = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.lotId is blank`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.lotId = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.eventData.lotId length < 4`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.eventData.lotId = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  //
  // Test IncomingSkuRestockedEvent.createdAt edge cases
  //
  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.createdAt is missing`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    delete mockIncomingSkuRestockedEvent.createdAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.createdAt is undefined`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.createdAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.createdAt is null`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.createdAt = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.createdAt is empty`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.createdAt = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.createdAt is blank`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.createdAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.createdAt length < 4`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.createdAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  //
  // Test IncomingSkuRestockedEvent.updatedAt edge cases
  //
  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.updatedAt is missing`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    delete mockIncomingSkuRestockedEvent.updatedAt
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.updatedAt is undefined`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.updatedAt = undefined as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.updatedAt is null`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.updatedAt = null as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.updatedAt is empty`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.updatedAt = '' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.updatedAt is blank`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.updatedAt = '      ' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  it(`throws an InvalidArgumentsError if the input IncomingSkuRestockedEvent.updatedAt length < 4`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    mockIncomingSkuRestockedEvent.updatedAt = '123' as never
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    expect(() => IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)).toThrow(InvalidArgumentsError)
  })

  //
  // Test expected results
  //
  it(`returns the expected IncomingSkuRestockedEvent if the input is valid`, () => {
    const mockIncomingSkuRestockedEvent = buildMockValidIncomingSkuRestockedEvent()
    const mockEventBridgeEvent = buildMockEventBrideEvent(mockIncomingSkuRestockedEvent)
    const result = IncomingSkuRestockedEvent.validateAndBuild(mockEventBridgeEvent)
    const expected = mockIncomingSkuRestockedEvent
    expect(result).toMatchObject(expected)
  })
})
