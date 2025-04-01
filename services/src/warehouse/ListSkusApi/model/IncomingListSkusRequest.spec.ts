import { InvalidArgumentsError } from '../../errors/AppError'
import { IncomingListSkusRequest, IncomingListSkusRequestInput } from './IncomingListSkusRequest'

function buildMockIncomingListSkusRequestInput(): IncomingListSkusRequestInput {
  const mockValidRequestInput: IncomingListSkusRequestInput = {
    sku: 'mockSku',
    sortOrder: 'asc',
    limit: 10,
  }
  return mockValidRequestInput
}

describe(`Warehouse Service ListSkusApi IncomingListSkusRequest tests`, () => {
  //
  // Test IncomingListSkusRequestInput edge cases
  //
  it(`does not throw if the input IncomingListSkusRequestInput is valid`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    expect(() => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput is undefined`, async () => {
    const mockIncomingListSkusRequestInput = undefined as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput is null`, async () => {
    const mockIncomingListSkusRequestInput = null as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput is invalid`, async () => {
    const mockIncomingListSkusRequestInput = 'mockInvalidValue' as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test IncomingListSkusRequestInput.sku edge cases
  //
  it(`does not throw if the input IncomingListSkusRequestInput.sku is missing`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    delete mockIncomingListSkusRequestInput.sku
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`does not throw if the input IncomingListSkusRequestInput.sku is undefined`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sku = undefined as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.sku is null`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sku = null as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.sku is empty`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sku = '' as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.sku is blank`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sku = '      ' as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.sku length < 4`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sku = '123' as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test IncomingListSkusRequestInput.sortOrder edge cases
  //
  it(`does not throw if the input IncomingListSkusRequestInput.sortOrder is missing`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    delete mockIncomingListSkusRequestInput.sortOrder
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`does not throw if the input IncomingListSkusRequestInput.sortOrder is undefined`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sortOrder = undefined as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.sortOrder is null`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sortOrder = null as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.sortOrder is empty`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sortOrder = '' as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.sortOrder is blank`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sortOrder = '      ' as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.sortOrder is a random string`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sortOrder = 'xyz' as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test IncomingListSkusRequestInput.limit edge cases
  //
  it(`does not throw if the input IncomingListSkusRequestInput.limit is missing`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    delete mockIncomingListSkusRequestInput.limit
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`does not throw if the input IncomingListSkusRequestInput.limit is undefined`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = undefined as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.limit is null`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = null as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.limit is not a number`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = '1' as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.limit < 1`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = 0
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.limit > 1000`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = 1001
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.limit is not an integer`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = 3.45
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test IncomingListSkusRequestInput.limit edge cases
  //
  it(`does not throw if the input IncomingListSkusRequestInput.limit is missing`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    delete mockIncomingListSkusRequestInput.limit
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`does not throw if the input IncomingListSkusRequestInput.limit is undefined`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = undefined as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.limit is null`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = null as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.limit is empty`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = '' as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.limit is not a number`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = '1' as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.limit < 1`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = 0
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.limit is not an integer`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = 3.45
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
    IncomingListSkusRequestInput.limit > 1000`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = 1001
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test expected results
  //
  it(`returns the expected IncomingListSkusRequest if the input is valid`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    const expectedRequest: IncomingListSkusRequest = {
      sku: mockIncomingListSkusRequestInput.sku,
      sortOrder: mockIncomingListSkusRequestInput.sortOrder,
      limit: mockIncomingListSkusRequestInput.limit,
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedRequest))
  })
})
