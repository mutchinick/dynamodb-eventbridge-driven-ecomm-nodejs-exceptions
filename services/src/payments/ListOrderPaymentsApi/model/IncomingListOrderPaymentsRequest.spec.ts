import { InvalidArgumentsError } from '../../errors/AppError'
import {
  IncomingListOrderPaymentsRequest,
  IncomingListOrderPaymentsRequestInput,
} from './IncomingListOrderPaymentsRequest'

const mockOrderId = 'mockOrderId'
const mockSortDirection = 'asc'
const mockLimit = 10

function buildMockIncomingListOrderPaymentsRequestInput(): IncomingListOrderPaymentsRequestInput {
  const mockValidRequestInput: IncomingListOrderPaymentsRequestInput = {
    orderId: mockOrderId,
    sortDirection: mockSortDirection,
    limit: mockLimit,
  }
  return mockValidRequestInput
}

describe(`Payments Service ListOrderPaymentsApi IncomingListOrderPaymentsRequest tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingListOrderPaymentsRequestInput edge cases
   ************************************************************/
  it(`does not throw if the input IncomingListOrderPaymentsRequestInput is valid`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    expect(() =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput),
    ).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput is undefined`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = undefined as never
    const testingFunc = () =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput is null`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = null as never
    const testingFunc = () =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingListOrderPaymentsRequestInput.orderId edge cases
   ************************************************************/
  it(`does not throw if the input IncomingListOrderPaymentsRequestInput.orderId is
      undefined`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.orderId = undefined as never
    const testingFunc = () =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.orderId is null`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.orderId = null as never
    const testingFunc = () =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.orderId is empty`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.orderId = '' as never
    const testingFunc = () =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.orderId is blank`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.orderId = '      ' as never
    const testingFunc = () =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.orderId length < 4`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.orderId = '123' as never
    const testingFunc = () =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingListOrderPaymentsRequestInput.sortDirection edge cases
   ************************************************************/
  it(`does not throw if the input IncomingListOrderPaymentsRequestInput.sortDirection
      is undefined`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.sortDirection = undefined as never
    const testingFunc = () =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.sortDirection is null`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.sortDirection = null as never
    const testingFunc = () =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.sortDirection is empty`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.sortDirection = '' as never
    const testingFunc = () =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.sortDirection is blank`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.sortDirection = '      ' as never
    const testingFunc = () =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.sortDirection is a random string`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.sortDirection = 'xyz' as never
    const testingFunc = () =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingListOrderPaymentsRequestInput.limit edge cases
   ************************************************************/
  it(`does not throw if the input IncomingListOrderPaymentsRequestInput.limit is
      undefined`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.limit = undefined as never
    const testingFunc = () =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.limit is null`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.limit = null as never
    const testingFunc = () =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.limit < 1`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.limit = 0
    const testingFunc = () =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.limit > 1000`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.limit = 1001
    const testingFunc = () =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.limit is not an integer`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.limit = 3.45
    const testingFunc = () =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListOrderPaymentsRequestInput.limit is not a number`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    mockIncomingListOrderPaymentsRequestInput.limit = '1' as never
    const testingFunc = () =>
      IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected IncomingListOrderPaymentsRequest if the execution path is
      successful`, async () => {
    const mockIncomingListOrderPaymentsRequestInput = buildMockIncomingListOrderPaymentsRequestInput()
    const result = IncomingListOrderPaymentsRequest.validateAndBuild(mockIncomingListOrderPaymentsRequestInput)
    const expectedRequest: IncomingListOrderPaymentsRequest = {
      orderId: mockIncomingListOrderPaymentsRequestInput.orderId,
      sortDirection: mockIncomingListOrderPaymentsRequestInput.sortDirection,
      limit: mockIncomingListOrderPaymentsRequestInput.limit,
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedRequest))
  })
})
