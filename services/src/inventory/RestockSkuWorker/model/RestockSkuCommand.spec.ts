import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { InventoryEventName } from '../../model/InventoryEventName'
import { IncomingSkuRestockedEvent } from './IncomingSkuRestockedEvent'
import { RestockSkuCommand, RestockSkuCommandInput } from './RestockSkuCommand'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockEventName = InventoryEventName.SKU_RESTOCKED_EVENT
const mockSku = 'mockSku'
const mockUnits = 12
const mockLotId = 'mockLotId'
const mockCreatedAt = mockDate
const mockUpdatedAt = mockDate

function buildMockIncomingSkuRestockedEvent(): TypeUtilsMutable<IncomingSkuRestockedEvent> {
  const mockValidInventoryEvent: TypeUtilsMutable<IncomingSkuRestockedEvent> = {
    eventName: mockEventName,
    eventData: {
      sku: mockSku,
      units: mockUnits,
      lotId: mockLotId,
    },
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
  }
  return mockValidInventoryEvent
}

function buildMockRestockSkuCommandInput(): TypeUtilsMutable<RestockSkuCommandInput> {
  const mockValidInput: TypeUtilsMutable<RestockSkuCommandInput> = {
    incomingSkuRestockedEvent: buildMockIncomingSkuRestockedEvent(),
  }
  return mockValidInput
}

describe(`Inventory Service RestockSkuWorker RestockSkuCommand tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test RestockSkuCommandInput edge cases
   ************************************************************/
  it(`does not throw if the input RestockSkuCommandInput is valid`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    expect(() => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input RestockSkuCommandInput
      is undefined`, () => {
    const mockRestockSkuCommandInput = undefined as never
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RestockSkuCommandInput
      is null`, () => {
    const mockRestockSkuCommandInput = null as never
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test RestockSkuCommandInput.incomingSkuRestockedEvent.eventName edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventName is undefined`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventName = undefined
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventName is null`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventName = null
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventName is empty`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventName = '' as never
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventName is blank`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventName = '      ' as never
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventName is not an
      SKU_RESTOCKED_EVENT`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventName = InventoryEventName.ORDER_CANCELED_EVENT as never
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt is undefined`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.createdAt = undefined
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt is null`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.createdAt = null
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt is empty`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.createdAt = ''
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt is blank`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.createdAt = '      '
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.createdAt length < 4`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.createdAt = '123'
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt is undefined`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt = undefined
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt is null`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt = null
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt is empty`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt = ''
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt is blank`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt = '      '
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt length < 4`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.updatedAt = '123'
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku is undefined`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku = undefined
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku is null`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku = null
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku is empty`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku = ''
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku is blank`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku = '      '
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku length < 4`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku = '123'
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units is undefined`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units = undefined
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units is null`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units = null
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units < 1`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units = 0
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units is not an
      integer`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units = 3.45
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units is not a number`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units = '1' as unknown as number
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId is undefined`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId = undefined
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId is null`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId = null
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId is empty`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId = ''
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId is blank`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId = '      '
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      RestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId length < 4`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId = '123'
    const testingFunc = () => RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected RestockSkuCommand if the execution path is successful`, () => {
    const mockRestockSkuCommandInput = buildMockRestockSkuCommandInput()
    const result = RestockSkuCommand.validateAndBuild(mockRestockSkuCommandInput)
    const expectedCommand: RestockSkuCommand = {
      commandData: {
        sku: mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.sku,
        units: mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.units,
        lotId: mockRestockSkuCommandInput.incomingSkuRestockedEvent.eventData.lotId,
        createdAt: mockDate,
        updatedAt: mockDate,
      },
      options: {},
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedCommand))
  })
})
