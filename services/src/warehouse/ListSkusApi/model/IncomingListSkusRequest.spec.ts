import { InvalidArgumentsError } from '../../errors/AppError'
import { IncomingListSkusRequest, IncomingListSkusRequestInput } from './IncomingListSkusRequest'

const mockSku = 'mockSku'
const mockSortDirection = 'asc'
const mockLimit = 10

function buildMockIncomingListSkusRequestInput(): IncomingListSkusRequestInput {
  const mockValidRequestInput: IncomingListSkusRequestInput = {
    sku: mockSku,
    sortDirection: mockSortDirection,
    limit: mockLimit,
  }
  return mockValidRequestInput
}

describe(`Warehouse Service ListSkusApi IncomingListSkusRequest tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingListSkusRequestInput edge cases
   ************************************************************/
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

  /*
   *
   *
   ************************************************************
   * Test IncomingListSkusRequestInput.sku edge cases
   ************************************************************/
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

  /*
   *
   *
   ************************************************************
   * Test IncomingListSkusRequestInput.sortDirection edge cases
   ************************************************************/
  it(`does not throw if the input IncomingListSkusRequestInput.sortDirection is
      undefined`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sortDirection = undefined as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.sortDirection is null`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sortDirection = null as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.sortDirection is empty`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sortDirection = '' as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.sortDirection is blank`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sortDirection = '      ' as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.sortDirection is a random string`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.sortDirection = 'xyz' as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingListSkusRequestInput.limit edge cases
   ************************************************************/
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

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequestInput.limit is not a number`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    mockIncomingListSkusRequestInput.limit = '1' as never
    const testingFunc = () => IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected IncomingListSkusRequest if the execution path is successful`, async () => {
    const mockIncomingListSkusRequestInput = buildMockIncomingListSkusRequestInput()
    const result = IncomingListSkusRequest.validateAndBuild(mockIncomingListSkusRequestInput)
    const expectedRequest: IncomingListSkusRequest = {
      sku: mockIncomingListSkusRequestInput.sku,
      sortDirection: mockIncomingListSkusRequestInput.sortDirection,
      limit: mockIncomingListSkusRequestInput.limit,
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedRequest))
  })
})
