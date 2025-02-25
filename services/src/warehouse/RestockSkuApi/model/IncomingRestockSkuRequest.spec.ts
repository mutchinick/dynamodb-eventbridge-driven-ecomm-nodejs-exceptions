import { InvalidArgumentsError } from '../../errors/AppError'
import { IncomingRestockSkuRequest, IncomingRestockSkuRequestInput } from './IncomingRestockSkuRequest'

function buildMockValidIncomingRestockSkuRequestInput(): IncomingRestockSkuRequestInput {
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
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).not.toThrow()
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput is undefined`, () => {
    const mockIncomingRestockSkuRequestInput = undefined as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput is null`, () => {
    const mockIncomingRestockSkuRequestInput = null as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput is invalid`, () => {
    const mockIncomingRestockSkuRequestInput = 'mockInvalidValue' as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  //
  // Test IncomingRestockSkuRequestInput.sku edge cases
  //
  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.sku is missing`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    delete mockIncomingRestockSkuRequestInput.sku
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.sku is undefined`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = undefined as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.sku is null`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = null as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.sku is empty`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = '' as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.sku is blank`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = '      ' as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.sku length < 4`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.sku = '123' as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  //
  // Test IncomingRestockSkuRequestInput.units edge cases
  //
  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.units is missing`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    delete mockIncomingRestockSkuRequestInput.units
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.units is undefined`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = undefined as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.units is null`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = null as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.units is empty`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = '' as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.units is not a number`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = '1' as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.units < 1`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = 0
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.units is not an integer`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.units = 2.34
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  //
  // Test IncomingRestockSkuRequestInput.lotId edge cases
  //
  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.lotId is missing`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    delete mockIncomingRestockSkuRequestInput.lotId
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.lotId is undefined`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = undefined as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.lotId is undefined`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = undefined as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.lotId is null`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = null as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.lotId is empty`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = '' as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.lotId is blank`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = '      ' as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input IncomingRestockSkuRequestInput.lotId length < 4`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    mockIncomingRestockSkuRequestInput.lotId = '123' as never
    expect(() => IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  //
  // Test expected results
  //
  it(`returns the expected IncomingRestockSkuRequest if the input is valid`, () => {
    const mockIncomingRestockSkuRequestInput = buildMockValidIncomingRestockSkuRequestInput()
    const result = IncomingRestockSkuRequest.validateAndBuild(mockIncomingRestockSkuRequestInput)
    const expected = mockIncomingRestockSkuRequestInput
    expect(result).toMatchObject(expected)
  })
})
