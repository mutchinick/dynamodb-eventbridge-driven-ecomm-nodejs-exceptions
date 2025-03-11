import { InvalidArgumentsError } from '../../errors/AppError'
import { GetOrderCommand, GetOrderCommandInput } from './GetOrderCommand'

function buildMockValidGetOrderCommandInput() {
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
    const mockGetOrderCommandInput = buildMockValidGetOrderCommandInput()
    expect(() => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderCommandInput is undefined`, () => {
    const mockGetOrderCommandInput: GetOrderCommandInput = undefined
    expect(() => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)).toThrow(InvalidArgumentsError)
    expect(() => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)).toThrow(
      expect.objectContaining({
        transient: false,
      }),
    )
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderCommandInput is null`, () => {
    const mockGetOrderCommandInput: GetOrderCommandInput = null
    expect(() => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)).toThrow(InvalidArgumentsError)
    expect(() => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)).toThrow(
      expect.objectContaining({
        transient: false,
      }),
    )
  })

  //
  // Test GetOrderCommandInput.orderId edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is missing`, () => {
    const mockGetOrderCommandInput = buildMockValidGetOrderCommandInput()
    delete mockGetOrderCommandInput.orderId
    expect(() => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)).toThrow(InvalidArgumentsError)
    expect(() => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)).toThrow(
      expect.objectContaining({
        transient: false,
      }),
    )
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is undefined`, () => {
    const mockGetOrderCommandInput = buildMockValidGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = undefined
    expect(() => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)).toThrow(InvalidArgumentsError)
    expect(() => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)).toThrow(
      expect.objectContaining({
        transient: false,
      }),
    )
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is null`, () => {
    const mockGetOrderCommandInput = buildMockValidGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = null
    expect(() => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)).toThrow(InvalidArgumentsError)
    expect(() => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)).toThrow(
      expect.objectContaining({
        transient: false,
      }),
    )
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is empty`, () => {
    const mockGetOrderCommandInput = buildMockValidGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = ''
    expect(() => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)).toThrow(InvalidArgumentsError)
    expect(() => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)).toThrow(
      expect.objectContaining({
        transient: false,
      }),
    )
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderCommandInput.orderId is blank`, () => {
    const mockGetOrderCommandInput = buildMockValidGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = '      '
    expect(() => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)).toThrow(InvalidArgumentsError)
    expect(() => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)).toThrow(
      expect.objectContaining({
        transient: false,
      }),
    )
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderCommandInput.orderId length < 4`, () => {
    const mockGetOrderCommandInput = buildMockValidGetOrderCommandInput()
    mockGetOrderCommandInput.orderId = '123'
    expect(() => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)).toThrow(InvalidArgumentsError)
    expect(() => GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)).toThrow(
      expect.objectContaining({
        transient: false,
      }),
    )
  })

  //
  // Test expected results
  //
  it(`returns the expected GetOrderCommand with the expected data`, () => {
    const mockGetOrderCommandInput = buildMockValidGetOrderCommandInput()
    const getOrderCommand = GetOrderCommand.validateAndBuild(mockGetOrderCommandInput)
    const expected: GetOrderCommand = {
      orderId: mockGetOrderCommandInput.orderId,
      options: {},
    }
    expect(getOrderCommand).toMatchObject(expected)
  })
})
