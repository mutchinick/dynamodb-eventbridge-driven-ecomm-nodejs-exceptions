import { InvalidArgumentsError } from '../../errors/AppError'
import { GetOrderAllocationCommand, GetOrderAllocationCommandInput } from './GetOrderAllocationCommand'

const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'

function buildMockGetOrderAllocationCommandInput(): GetOrderAllocationCommandInput {
  const mockValidInput: GetOrderAllocationCommandInput = {
    orderId: mockOrderId,
    sku: mockSku,
  }
  return mockValidInput
}

describe(`Warehouse Service DeallocateOrderPaymentRejectedWorker GetOrderAllocationCommand
          tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test GetOrderAllocationCommandInput edge cases
   ************************************************************/
  it(`does not throw if the input GetOrderAllocationCommandInput is valid`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    expect(() => GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderAllocationCommandInput is undefined`, () => {
    const mockGetOrderAllocationCommandInput: GetOrderAllocationCommandInput = undefined
    const testingFunc = () => GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderAllocationCommandInput is null`, () => {
    const mockGetOrderAllocationCommandInput: GetOrderAllocationCommandInput = null
    const testingFunc = () => GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test GetOrderAllocationCommandInput.orderId edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderAllocationCommandInput.orderId is undefined`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.orderId = undefined
    const testingFunc = () => GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderAllocationCommandInput.orderId is null`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.orderId = null
    const testingFunc = () => GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderAllocationCommandInput.orderId is empty`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.orderId = ''
    const testingFunc = () => GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderAllocationCommandInput.orderId is blank`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.orderId = '      '
    const testingFunc = () => GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderAllocationCommandInput.orderId length < 4`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.orderId = '123'
    const testingFunc = () => GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test GetOrderAllocationCommandInput.sku edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderAllocationCommandInput.sku is undefined`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.sku = undefined
    const testingFunc = () => GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderAllocationCommandInput.sku is null`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.sku = null
    const testingFunc = () => GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderAllocationCommandInput.sku is empty`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.sku = ''
    const testingFunc = () => GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderAllocationCommandInput.sku is blank`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.sku = '      '
    const testingFunc = () => GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      GetOrderAllocationCommandInput.sku length < 4`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    mockGetOrderAllocationCommandInput.sku = '123'
    const testingFunc = () => GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected GetOrderAllocationCommand if the execution path is
      successful`, () => {
    const mockGetOrderAllocationCommandInput = buildMockGetOrderAllocationCommandInput()
    const result = GetOrderAllocationCommand.validateAndBuild(mockGetOrderAllocationCommandInput)
    const expectedCommand: GetOrderAllocationCommand = {
      commandData: {
        orderId: mockGetOrderAllocationCommandInput.orderId,
        sku: mockGetOrderAllocationCommandInput.sku,
      },
      options: {},
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedCommand))
  })
})
