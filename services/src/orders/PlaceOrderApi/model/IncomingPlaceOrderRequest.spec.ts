import { InvalidArgumentsError } from '../../errors/AppError'
import { IncomingPlaceOrderRequest, IncomingPlaceOrderRequestInput } from './IncomingPlaceOrderRequest'

function buildMockIncomingPlaceOrderRequestInput(): IncomingPlaceOrderRequestInput {
  const mockValidRequestInput: IncomingPlaceOrderRequestInput = {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
    price: 3.98,
    userId: 'mockUserId',
  }
  return mockValidRequestInput
}

describe(`Orders Service PlaceOrderApi IncomingPlaceOrderRequest tests`, () => {
  //
  // Test IncomingPlaceOrderRequestInput edge cases
  //
  it(`does not throw if the input IncomingPlaceOrderRequestInput is valid`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    expect(() => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput is undefined`, async () => {
    const mockIncomingPlaceOrderRequestInput = undefined as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput is null`, async () => {
    const mockIncomingPlaceOrderRequestInput = null as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput is invalid`, async () => {
    const mockIncomingPlaceOrderRequestInput = 'mockInvalidValue' as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test IncomingPlaceOrderRequestInput.orderId edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.orderId is missing`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    delete mockIncomingPlaceOrderRequestInput.orderId
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.orderId is undefined`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = undefined as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.orderId is null`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = null as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.orderId is empty`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = '' as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.orderId is blank`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = '      ' as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.orderId length < 4`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.orderId = '123' as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test IncomingPlaceOrderRequestInput.sku edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.sku is missing`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    delete mockIncomingPlaceOrderRequestInput.sku
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.sku is undefined`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = undefined as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.sku is null`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = null as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.sku is empty`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = '' as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.sku is blank`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = '      ' as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.sku length < 4`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.sku = '123' as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test IncomingPlaceOrderRequestInput.units edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.units is missing`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    delete mockIncomingPlaceOrderRequestInput.units
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.units is undefined`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.units = undefined as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.units is null`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.units = null as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.units is empty`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.units = '' as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.units is not a number`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.units = '1' as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.units < 1`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.units = 0
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.units is not an integer`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.units = 3.45
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test IncomingPlaceOrderRequestInput.price edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.price is missing`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    delete mockIncomingPlaceOrderRequestInput.price
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.price is undefined`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = undefined as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.price is null`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = null as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.price is empty`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = '' as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.price is not a number`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = '0' as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.price < 0`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.price = -1
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test IncomingPlaceOrderRequestInput.userId edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.userId is missing`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    delete mockIncomingPlaceOrderRequestInput.userId
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.userId is undefined`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = undefined as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.userId is undefined`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = undefined as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.userId is null`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = null as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.userId is empty`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = '' as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.userId is blank`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = '      ' as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingPlaceOrderRequestInput.userId length < 4`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    mockIncomingPlaceOrderRequestInput.userId = '123' as never
    const testingFunc = () => IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test expected results
  //
  it(`returns the expected IncomingPlaceOrderRequest if the input is valid`, async () => {
    const mockIncomingPlaceOrderRequestInput = buildMockIncomingPlaceOrderRequestInput()
    const result = IncomingPlaceOrderRequest.validateAndBuild(mockIncomingPlaceOrderRequestInput)
    const expectedRequest: IncomingPlaceOrderRequest = {
      orderId: mockIncomingPlaceOrderRequestInput.orderId,
      sku: mockIncomingPlaceOrderRequestInput.sku,
      units: mockIncomingPlaceOrderRequestInput.units,
      price: mockIncomingPlaceOrderRequestInput.price,
      userId: mockIncomingPlaceOrderRequestInput.userId,
    } as never
    expect(result).toStrictEqual(expect.objectContaining(expectedRequest))
  })
})
