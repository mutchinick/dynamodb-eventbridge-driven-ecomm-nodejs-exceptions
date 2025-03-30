import { InvalidArgumentsError } from '../../errors/AppError'
import { IncomingListOrdersRequest, IncomingListOrdersRequestInput } from './IncomingListOrdersRequest'

function buildMockIncomingListOrdersRequestInput(): IncomingListOrdersRequestInput {
  const mockValidRequestInput: IncomingListOrdersRequestInput = {
    orderId: 'mockOrderId',
    sortOrder: 'asc',
    limit: 10,
  }
  return mockValidRequestInput
}

describe(`Orders Service ListOrdersApi IncomingListOrdersRequest tests`, () => {
  //
  // Test IncomingListOrdersRequestInput edge cases
  //
  it(`does not throw if the input IncomingListOrdersRequestInput is valid`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    expect(() => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput is undefined`, async () => {
    const mockIncomingListOrdersRequestInput = undefined as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput is null`, async () => {
    const mockIncomingListOrdersRequestInput = null as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput is invalid`, async () => {
    const mockIncomingListOrdersRequestInput = 'mockInvalidValue' as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test IncomingListOrdersRequestInput.orderId edge cases
  //
  it(`does not throw if the input IncomingListOrdersRequestInput.orderId is missing`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    delete mockIncomingListOrdersRequestInput.orderId
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`does not throw if the input IncomingListOrdersRequestInput.orderId is undefined`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.orderId = undefined as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput.orderId is null`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.orderId = null as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput.orderId is empty`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.orderId = '' as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput.orderId is blank`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.orderId = '      ' as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput.orderId length < 4`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.orderId = '123' as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test IncomingListOrdersRequestInput.sortOrder edge cases
  //
  it(`does not throw if the input IncomingListOrdersRequestInput.sortOrder is missing`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    delete mockIncomingListOrdersRequestInput.sortOrder
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`does not throw if the input IncomingListOrdersRequestInput.sortOrder is undefined`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.sortOrder = undefined as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput.sortOrder is null`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.sortOrder = null as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput.sortOrder is empty`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.sortOrder = '' as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput.sortOrder is blank`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.sortOrder = '      ' as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput.sortOrder is a random string`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.sortOrder = 'xyz' as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test IncomingListOrdersRequestInput.limit edge cases
  //
  it(`does not throw if the input IncomingListOrdersRequestInput.limit is missing`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    delete mockIncomingListOrdersRequestInput.limit
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`does not throw if the input IncomingListOrdersRequestInput.limit is undefined`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = undefined as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput.limit is null`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = null as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput.limit is not a number`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = '1' as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput.limit < 1`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = 0
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput.limit > 1000`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = 1001
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput.limit is not an integer`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = 3.45
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test IncomingListOrdersRequestInput.limit edge cases
  //
  it(`does not throw if the input IncomingListOrdersRequestInput.limit is missing`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    delete mockIncomingListOrdersRequestInput.limit
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`does not throw if the input IncomingListOrdersRequestInput.limit is undefined`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = undefined as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput.limit is null`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = null as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput.limit is empty`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = '' as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput.limit is not a number`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = '1' as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput.limit < 1`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = 0
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrdersRequestInput.limit is not an integer`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = 3.45
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
    IncomingListOrdersRequestInput.limit > 1000`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = 1001
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test expected results
  //
  it(`returns the expected IncomingListOrdersRequest if the input is valid`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    const expectedRequest: IncomingListOrdersRequest = {
      orderId: mockIncomingListOrdersRequestInput.orderId,
      sortOrder: mockIncomingListOrdersRequestInput.sortOrder,
      limit: mockIncomingListOrdersRequestInput.limit,
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedRequest))
  })
})
