import { InvalidArgumentsError } from '../../errors/AppError'
import { IncomingListOrdersRequest, IncomingListOrdersRequestInput } from './IncomingListOrdersRequest'

const mockOrderId = 'mockOrderId'
const mockSortDirection = 'asc'
const mockLimit = 10

function buildMockIncomingListOrdersRequestInput(): IncomingListOrdersRequestInput {
  const mockValidRequestInput: IncomingListOrdersRequestInput = {
    orderId: mockOrderId,
    sortDirection: mockSortDirection,
    limit: mockLimit,
  }
  return mockValidRequestInput
}

describe(`Orders Service ListOrdersApi IncomingListOrdersRequest tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingListOrdersRequestInput edge cases
   ************************************************************/
  it(`does not throw if the input IncomingListOrdersRequestInput is valid`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    expect(() => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingListOrdersRequestInput is undefined`, async () => {
    const mockIncomingListOrdersRequestInput = undefined as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingListOrdersRequestInput is null`, async () => {
    const mockIncomingListOrdersRequestInput = null as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingListOrdersRequestInput.orderId edge cases
   ************************************************************/
  it(`does not throw if the input IncomingListOrdersRequestInput.orderId is undefined`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.orderId = undefined as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingListOrdersRequestInput.orderId is null`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.orderId = null as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingListOrdersRequestInput.orderId is empty`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.orderId = '' as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingListOrdersRequestInput.orderId is blank`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.orderId = '      ' as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingListOrdersRequestInput.orderId length < 4`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.orderId = '123' as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingListOrdersRequestInput.sortDirection edge cases
   ************************************************************/
  it(`does not throw if the input IncomingListOrdersRequestInput.sortDirection is undefined`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.sortDirection = undefined as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingListOrdersRequestInput.sortDirection is null`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.sortDirection = null as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingListOrdersRequestInput.sortDirection is empty`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.sortDirection = '' as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingListOrdersRequestInput.sortDirection is blank`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.sortDirection = '      ' as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingListOrdersRequestInput.sortDirection is a random string`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.sortDirection = 'xyz' as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingListOrdersRequestInput.limit edge cases
   ************************************************************/
  it(`does not throw if the input IncomingListOrdersRequestInput.limit is undefined`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = undefined as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingListOrdersRequestInput.limit is null`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = null as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingListOrdersRequestInput.limit < 1`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = 0
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingListOrdersRequestInput.limit > 1000`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = 1001
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingListOrdersRequestInput.limit is not an integer`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = 3.45
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input IncomingListOrdersRequestInput.limit is not a number`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    mockIncomingListOrdersRequestInput.limit = '1' as never
    const testingFunc = () => IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected IncomingListOrdersRequest if the execution path is successful`, async () => {
    const mockIncomingListOrdersRequestInput = buildMockIncomingListOrdersRequestInput()
    const result = IncomingListOrdersRequest.validateAndBuild(mockIncomingListOrdersRequestInput)
    const expectedRequest: IncomingListOrdersRequest = {
      orderId: mockIncomingListOrdersRequestInput.orderId,
      sortDirection: mockIncomingListOrdersRequestInput.sortDirection,
      limit: mockIncomingListOrdersRequestInput.limit,
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedRequest))
  })
})
