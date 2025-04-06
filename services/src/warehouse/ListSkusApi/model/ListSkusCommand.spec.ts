import { InvalidArgumentsError } from '../../errors/AppError'
import { ListSkusCommand, ListSkusCommandInput } from './ListSkusCommand'

function buildMockListSkusCommandInput() {
  const mockValidInput: ListSkusCommandInput = {
    sku: 'mockSku',
    sortDirection: 'asc',
    limit: 10,
  }
  return mockValidInput
}

describe(`Warehouse Service ListSkusApi ListSkusCommand tests`, () => {
  //
  // Test ListSkusCommandInput edge cases
  //
  it(`does not throw if the input ListSkusCommandInput is valid`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    expect(() => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListSkusCommandInput is undefined`, () => {
    const mockListSkusCommandInput: ListSkusCommandInput = undefined
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListSkusCommandInput is null`, () => {
    const mockListSkusCommandInput: ListSkusCommandInput = null
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test ListSkusCommandInput.sku edge cases
  //
  it(`does not throw if the input ListSkusCommandInput.sku is missing`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    delete mockListSkusCommandInput.sku
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).not.toThrow()
  })

  it(`does not throw if the input ListSkusCommandInput.sku is undefined`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sku = undefined as never
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListSkusCommandInput.sku is null`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sku = null as never
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListSkusCommandInput.sku is empty`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sku = '' as never
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListSkusCommandInput.sku is blank`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sku = '      ' as never
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListSkusCommandInput.sku length < 4`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sku = '123' as never
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test ListSkusCommandInput.sortDirection edge cases
  //
  it(`does not throw if the input ListSkusCommandInput.sortDirection is missing`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    delete mockListSkusCommandInput.sortDirection
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).not.toThrow()
  })

  it(`does not throw if the input ListSkusCommandInput.sortDirection is undefined`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sortDirection = undefined as never
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListSkusCommandInput.sortDirection is null`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sortDirection = null as never
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListSkusCommandInput.sortDirection is empty`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sortDirection = '' as never
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListSkusCommandInput.sortDirection is blank`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sortDirection = '      ' as never
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListSkusCommandInput.sortDirection is a random string`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.sortDirection = 'xyz' as never
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test ListSkusCommandInput.limit edge cases
  //
  it(`does not throw if the input ListSkusCommandInput.limit is missing`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    delete mockListSkusCommandInput.limit
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).not.toThrow()
  })

  it(`does not throw if the input ListSkusCommandInput.limit is undefined`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.limit = undefined as never
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListSkusCommandInput.limit is null`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.limit = null as never
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListSkusCommandInput.limit is not a number`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.limit = '1' as never
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListSkusCommandInput.limit < 1`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.limit = 0
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListSkusCommandInput.limit > 1000`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.limit = 1001
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      ListSkusCommandInput.limit is not an integer`, async () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    mockListSkusCommandInput.limit = 3.45
    const testingFunc = () => ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test expected results
  //
  it(`returns the expected ListSkusCommand with the expected data`, () => {
    const mockListSkusCommandInput = buildMockListSkusCommandInput()
    const result = ListSkusCommand.validateAndBuild(mockListSkusCommandInput)
    const expectedCommand: ListSkusCommand = {
      commandData: {
        sku: mockListSkusCommandInput.sku,
        limit: mockListSkusCommandInput.limit,
        sortDirection: mockListSkusCommandInput.sortDirection,
      },
      options: {},
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedCommand))
  })
})
