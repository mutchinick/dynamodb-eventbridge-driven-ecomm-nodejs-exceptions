import { InvalidArgumentsError } from '../../errors/AppError'
import { GetOrderCommand, GetOrderCommandInput } from './GetOrderCommand'

function buildMockGetOrderCommandInput() {
  const mockValidInput: GetOrderCommandInput = {
    orderId: 'mockOrderId',
  }
  return mockValidInput
}

describe(`Orders Service SyncOrderWorker GetOrderCommand tests`, () => {
  //
  // Test GetOrderCommandInput edge cases
  //
  it(`does not throw if the input GetOrderCommandInput is valid`, () => {
    const mockGetOrderCommandInput = buildMockGetOrderCommandInput()
    expect(() => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderCommandInput is undefined`, () => {
    const mockGetOrderCommandInput: GetOrderCommandInput = undefined
    const testingFunc = () => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderCommandInput is null`, () => {
    const mockGetOrderCommandInput: GetOrderCommandInput = null
    const testingFunc = () => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test GetOrderCommandInput.orderId edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is missing`, () => {
    const mockGetOrderCommandInput = buildMockGetOrderCommandInput()
    delete mockGetOrderCommandInput.orderId
    const testingFunc = () => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is undefined`, () => {
    const mockGetOrderCommandInput = buildMockGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = undefined
    const testingFunc = () => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is null`, () => {
    const mockGetOrderCommandInput = buildMockGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = null
    const testingFunc = () => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is empty`, () => {
    const mockGetOrderCommandInput = buildMockGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = ''
    const testingFunc = () => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is blank`, () => {
    const mockGetOrderCommandInput = buildMockGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = '      '
    const testingFunc = () => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderCommandInput.orderId length < 4`, () => {
    const mockGetOrderCommandInput = buildMockGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = '123'
    const testingFunc = () => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test expected results
  //
  it(`returns the expected GetOrderCommand with the expected data`, () => {
    const mockGetOrderCommandInput = buildMockGetOrderCommandInput()
    const result = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    const expectedCommand: GetOrderCommand = {
      commandData: {
        orderId: mockGetOrderCommandInput.orderId,
      },
      options: {},
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedCommand))
  })
})
