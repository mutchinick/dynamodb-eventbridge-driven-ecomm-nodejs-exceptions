import { InvalidArgumentsError } from '../../errors/AppError'
import { ListOrderPaymentsCommand, ListOrderPaymentsCommandInput } from './ListOrderPaymentsCommand'

const mockOrderId = 'mockOrderId'
const mockSortDirection = 'asc'
const mockLimit = 10

function buildMockListOrderPaymentsCommandInput(): ListOrderPaymentsCommandInput {
  const mockValidInput: ListOrderPaymentsCommandInput = {
    orderId: mockOrderId,
    sortDirection: mockSortDirection,
    limit: mockLimit,
  }
  return mockValidInput
}

describe(`Payments Service ListOrderPaymentsApi ListOrderPaymentsCommand tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test ListOrderPaymentsCommandInput edge cases
   ************************************************************/
  it(`does not throw if the input ListOrderPaymentsCommandInput is valid`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    expect(() => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput is undefined`, () => {
    const mockListOrderPaymentsCommandInput = undefined as never
    const testingFunc = () => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput is null`, () => {
    const mockListOrderPaymentsCommandInput = null as never
    const testingFunc = () => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test ListOrderPaymentsCommandInput.orderId edge cases
   ************************************************************/
  it(`does not throw if the input ListOrderPaymentsCommandInput.orderId is undefined`, async () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.orderId = undefined as never
    const testingFunc = () => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.orderId is null`, async () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.orderId = null as never
    const testingFunc = () => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.orderId is empty`, async () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.orderId = '' as never
    const testingFunc = () => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.orderId is blank`, async () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.orderId = '      ' as never
    const testingFunc = () => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.orderId length < 4`, async () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.orderId = '123' as never
    const testingFunc = () => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test ListOrderPaymentsCommandInput.sortDirection edge cases
   ************************************************************/
  it(`does not throw if the input ListOrderPaymentsCommandInput.sortDirection is
      undefined`, async () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.sortDirection = undefined as never
    const testingFunc = () => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.sortDirection is null`, async () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.sortDirection = null as never
    const testingFunc = () => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.sortDirection is empty`, async () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.sortDirection = '' as never
    const testingFunc = () => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.sortDirection is blank`, async () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.sortDirection = '      ' as never
    const testingFunc = () => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.sortDirection is a random string`, async () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.sortDirection = 'xyz' as never
    const testingFunc = () => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test ListOrderPaymentsCommandInput.limit edge cases
   ************************************************************/
  it(`does not throw if the input ListOrderPaymentsCommandInput.limit is undefined`, async () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.limit = undefined as never
    const testingFunc = () => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.limit is null`, async () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.limit = null as never
    const testingFunc = () => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.limit is not a number`, async () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.limit = '1' as never
    const testingFunc = () => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.limit < 1`, async () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.limit = 0
    const testingFunc = () => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.limit > 1000`, async () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.limit = 1001
    const testingFunc = () => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrderPaymentsCommandInput.limit is not an integer`, async () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    mockListOrderPaymentsCommandInput.limit = 3.45
    const testingFunc = () => ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected ListOrderPaymentsCommand if the execution path is
      successful`, () => {
    const mockListOrderPaymentsCommandInput = buildMockListOrderPaymentsCommandInput()
    const result = ListOrderPaymentsCommand.validateAndBuild(mockListOrderPaymentsCommandInput)
    const expectedCommand: ListOrderPaymentsCommand = {
      commandData: {
        orderId: mockListOrderPaymentsCommandInput.orderId,
        sortDirection: mockListOrderPaymentsCommandInput.sortDirection,
        limit: mockListOrderPaymentsCommandInput.limit,
      },
      options: {},
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedCommand))
  })
})
