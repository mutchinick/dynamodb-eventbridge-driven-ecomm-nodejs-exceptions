import { InvalidArgumentsError } from '../../errors/AppError'
import { IncomingRestockSkuRequest, IncomingRestockSkuRequestInput } from './IncomingRestockSkuRequest'

function buildMockIncomingRestockSkuRequestInput(): IncomingRestockSkuRequestInput {
  const mockValidRequestInput: IncomingRestockSkuRequestInput = {
    sku: 'mockSku',
    units: 2,
    lotId: 'mockLotId',
  }
  return mockValidRequestInput
}

describe(`Warehouse Service RestockSkuApi IncomingRestockSkuRequest tests`, () => {
  //
  // Test IncomingRestockSkuRequestInput edge cases
  //
  it(`does not throw if the input IncomingRestockSkuRequestInput is valid`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput is undefined`, () => {
    const mockIncomingRestockSkuRequestInput = undefined as never
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput is null`, () => {
    const mockIncomingRestockSkuRequestInput = null as never
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput is invalid`, () => {
    const mockIncomingRestockSkuRequestInput = 'mockInvalidValue' as never
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test IncomingRestockSkuRequestInput.sku edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.sku is missing`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    delete mockIncomingRestockSkuRequestInput.sku
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.sku is undefined`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = undefined as never
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.sku is null`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = null as never
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.sku is empty`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = '' as never
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.sku is blank`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = '      ' as never
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.sku length < 4`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = '123' as never
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test IncomingRestockSkuRequestInput.units edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.units is missing`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    delete mockIncomingRestockSkuRequestInput.units
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.units is undefined`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = undefined as never
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.units is null`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = null as never
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.units is empty`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = '' as never
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.units is not a number`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = '1' as never
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.units < 1`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = 0
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.units is not an integer`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = 2.34
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test IncomingRestockSkuRequestInput.lotId edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.lotId is missing`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    delete mockIncomingRestockSkuRequestInput.lotId
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.lotId is undefined`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = undefined as never
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.lotId is undefined`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = undefined as never
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.lotId is null`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = null as never
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.lotId is empty`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = '' as never
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.lotId is blank`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = '      ' as never
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingRestockSkuRequestInput.lotId length < 4`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = '123' as never
    const testingFunc = () => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test expected results
  //
  it(`returns the expected IncomingRestockSkuRequest if the input is valid`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockIncomingRestockSkuRequestInput()
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    const expected = mockIncomingRestockSkuRequestInput
    expect(result).toMatchObject(expected)
  })
})
