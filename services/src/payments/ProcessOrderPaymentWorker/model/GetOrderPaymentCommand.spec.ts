import { InvalidArgumentsError } from '../../errors/AppError'
import { GetOrderPaymentCommand, GetOrderPaymentCommandInput } from './GetOrderPaymentCommand'

const mockOrderId = 'mockOrderId'

function buildMockGetOrderPaymentCommandInput(): GetOrderPaymentCommandInput {
  const mockValidInput: GetOrderPaymentCommandInput = {
    orderId: mockOrderId,
  }
  return mockValidInput
}

describe(`Payments Service ProcessOrderPaymentWorker GetOrderPaymentCommand tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test GetOrderPaymentCommandInput edge cases
   ************************************************************/
  it(`does not throw if the input GetOrderPaymentCommandInput is valid`, () => {
    const mockGetOrderPaymentCommandInput = buildMockGetOrderPaymentCommandInput()
    expect(() => GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderPaymentCommandInput is undefined`, () => {
    const mockGetOrderPaymentCommandInput: GetOrderPaymentCommandInput = undefined
    const testingFunc = () => GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderPaymentCommandInput is null`, () => {
    const mockGetOrderPaymentCommandInput: GetOrderPaymentCommandInput = null
    const testingFunc = () => GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test GetOrderPaymentCommandInput.orderId edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderPaymentCommandInput.orderId is undefined`, () => {
    const mockGetOrderPaymentCommandInput = buildMockGetOrderPaymentCommandInput()
    mockGetOrderPaymentCommandInput.orderId = undefined
    const testingFunc = () => GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderPaymentCommandInput.orderId is null`, () => {
    const mockGetOrderPaymentCommandInput = buildMockGetOrderPaymentCommandInput()
    mockGetOrderPaymentCommandInput.orderId = null
    const testingFunc = () => GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderPaymentCommandInput.orderId is empty`, () => {
    const mockGetOrderPaymentCommandInput = buildMockGetOrderPaymentCommandInput()
    mockGetOrderPaymentCommandInput.orderId = ''
    const testingFunc = () => GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderPaymentCommandInput.orderId is blank`, () => {
    const mockGetOrderPaymentCommandInput = buildMockGetOrderPaymentCommandInput()
    mockGetOrderPaymentCommandInput.orderId = '      '
    const testingFunc = () => GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderPaymentCommandInput.orderId length < 4`, () => {
    const mockGetOrderPaymentCommandInput = buildMockGetOrderPaymentCommandInput()
    mockGetOrderPaymentCommandInput.orderId = '123'
    const testingFunc = () => GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected GetOrderPaymentCommand if the execution path is successful`, () => {
    const mockGetOrderPaymentCommandInput = buildMockGetOrderPaymentCommandInput()
    const result = GetOrderPaymentCommand.validateAndBuild(mockGetOrderPaymentCommandInput)
    const expectedCommand: GetOrderPaymentCommand = {
      commandData: {
        orderId: mockGetOrderPaymentCommandInput.orderId,
      },
      options: {},
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedCommand))
  })
})
