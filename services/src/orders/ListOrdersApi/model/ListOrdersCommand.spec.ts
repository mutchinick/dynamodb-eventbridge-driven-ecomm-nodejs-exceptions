import { InvalidArgumentsError } from '../../errors/AppError'
import { ListOrdersCommand, ListOrdersCommandInput } from './ListOrdersCommand'

function buildMockListOrdersCommandInput() {
  const mockValidInput: ListOrdersCommandInput = {
    orderId: 'mockOrderId',
    sortOrder: 'asc',
    limit: 10,
  }
  return mockValidInput
}

describe(`Orders Service SyncOrderWorker ListOrdersCommand tests`, () => {
  //
  // Test ListOrdersCommandInput edge cases
  //
  it(`does not throw if the input ListOrdersCommandInput is valid`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    expect(() => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrdersCommandInput is undefined`, () => {
    const mockListOrdersCommandInput: ListOrdersCommandInput = undefined
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrdersCommandInput is null`, () => {
    const mockListOrdersCommandInput: ListOrdersCommandInput = null
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test ListOrdersCommandInput.orderId edge cases
  //
  it(`does not throw if the input ListOrdersCommandInput.orderId is missing`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    delete mockListOrdersCommandInput.orderId
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).not.toThrow()
  })

  it(`does not throw if the input ListOrdersCommandInput.orderId is undefined`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.orderId = undefined as never
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrdersCommandInput.orderId is null`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.orderId = null as never
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrdersCommandInput.orderId is empty`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.orderId = '' as never
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrdersCommandInput.orderId is blank`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.orderId = '      ' as never
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrdersCommandInput.orderId length < 4`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.orderId = '123' as never
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test ListOrdersCommandInput.sortOrder edge cases
  //
  it(`does not throw if the input ListOrdersCommandInput.sortOrder is missing`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    delete mockListOrdersCommandInput.sortOrder
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).not.toThrow()
  })

  it(`does not throw if the input ListOrdersCommandInput.sortOrder is undefined`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.sortOrder = undefined as never
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrdersCommandInput.sortOrder is null`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.sortOrder = null as never
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrdersCommandInput.sortOrder is empty`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.sortOrder = '' as never
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrdersCommandInput.sortOrder is blank`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.sortOrder = '      ' as never
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrdersCommandInput.sortOrder is a random string`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.sortOrder = 'xyz' as never
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test ListOrdersCommandInput.limit edge cases
  //
  it(`does not throw if the input ListOrdersCommandInput.limit is missing`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    delete mockListOrdersCommandInput.limit
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).not.toThrow()
  })

  it(`does not throw if the input ListOrdersCommandInput.limit is undefined`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.limit = undefined as never
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrdersCommandInput.limit is null`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.limit = null as never
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrdersCommandInput.limit is not a number`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.limit = '1' as never
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrdersCommandInput.limit < 1`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.limit = 0
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrdersCommandInput.limit > 1000`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.limit = 1001
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListOrdersCommandInput.limit is not an integer`, async () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    mockListOrdersCommandInput.limit = 3.45
    const testingFunc = () => ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test expected results
  //
  it(`returns the expected ListOrdersCommand with the expected data`, () => {
    const mockListOrdersCommandInput = buildMockListOrdersCommandInput()
    const result = ListOrdersCommand.validateAndBuild(mockListOrdersCommandInput)
    const expectedResult: ListOrdersCommand = {
      queryData: {
        orderId: mockListOrdersCommandInput.orderId,
        limit: mockListOrdersCommandInput.limit,
        sortOrder: mockListOrdersCommandInput.sortOrder,
      },
      options: {},
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedResult))
  })
})
