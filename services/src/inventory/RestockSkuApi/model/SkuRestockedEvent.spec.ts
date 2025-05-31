import { InvalidArgumentsError } from '../../errors/AppError'
import { InventoryEventName } from '../../model/InventoryEventName'
import { SkuRestockedEvent, SkuRestockedEventInput } from './SkuRestockedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockSku = 'mockSku'
const mockUnits = 2
const mockLotId = 'mockLotId'

function buildMockSkuRestockedEventInput(): SkuRestockedEventInput {
  const mockValidInput: SkuRestockedEventInput = {
    sku: mockSku,
    units: mockUnits,
    lotId: mockLotId,
  }
  return mockValidInput
}

describe(`Inventory Service RestockSkuApi SkuRestockedEvent tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test SkuRestockedEventInput edge cases
   ************************************************************/
  it(`does not throw if the input SkuRestockedEventInput is valid`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    expect(() => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input SkuRestockedEventInput
      is undefined`, () => {
    const mockSkuRestockedEventInput = undefined as unknown as SkuRestockedEventInput
    const testingFunc = () => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input SkuRestockedEventInput
      is null`, () => {
    const mockSkuRestockedEventInput = null as unknown as SkuRestockedEventInput
    const testingFunc = () => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test SkuRestockedEventInput.sku edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      SkuRestockedEventInput.sku is undefined`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = undefined
    const testingFunc = () => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      SkuRestockedEventInput.sku is null`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = null
    const testingFunc = () => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      SkuRestockedEventInput.sku is empty`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = ''
    const testingFunc = () => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      SkuRestockedEventInput.sku is blank`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = '      '
    const testingFunc = () => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      SkuRestockedEventInput.sku length < 4`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.sku = '123'
    const testingFunc = () => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test SkuRestockedEventInput.units edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      SkuRestockedEventInput.units is undefined`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = undefined
    const testingFunc = () => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      SkuRestockedEventInput.units is null`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = null
    const testingFunc = () => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      SkuRestockedEventInput.units < 1`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = 0
    const testingFunc = () => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      SkuRestockedEventInput.units is not an integer`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = 2.34
    const testingFunc = () => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      SkuRestockedEventInput.units is not a number`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.units = '1' as unknown as number
    const testingFunc = () => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test SkuRestockedEventInput.lotId edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      SkuRestockedEventInput.lotId is undefined`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = undefined
    const testingFunc = () => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      SkuRestockedEventInput.lotId is null`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = null
    const testingFunc = () => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      SkuRestockedEventInput.lotId is empty`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = ''
    const testingFunc = () => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      SkuRestockedEventInput.lotId is blank`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = '      '
    const testingFunc = () => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      SkuRestockedEventInput.lotId length < 4`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    mockSkuRestockedEventInput.lotId = '123'
    const testingFunc = () => SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected SkuRestockedEvent if the execution path is successful`, () => {
    const mockSkuRestockedEventInput = buildMockSkuRestockedEventInput()
    const result = SkuRestockedEvent.validateAndBuild(mockSkuRestockedEventInput)
    const expectedEvent: SkuRestockedEvent = {
      eventName: InventoryEventName.SKU_RESTOCKED_EVENT,
      eventData: {
        sku: mockSkuRestockedEventInput.sku,
        units: mockSkuRestockedEventInput.units,
        lotId: mockSkuRestockedEventInput.lotId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedEvent))
  })
})
