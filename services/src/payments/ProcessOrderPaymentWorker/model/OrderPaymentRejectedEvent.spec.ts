import { InvalidArgumentsError } from '../../errors/AppError'
import { PaymentsEventName } from '../../model/PaymentsEventName'
import { OrderPaymentRejectedEvent, OrderPaymentRejectedEventInput } from './OrderPaymentRejectedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.99
const mockUserId = 'mockUserId'

function buildMockOrderPaymentRejectedEventInput(): OrderPaymentRejectedEventInput {
  const mockValidInput: OrderPaymentRejectedEventInput = {
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
  }
  return mockValidInput
}

describe(`Payments Service ProcessOrderPaymentWorker OrderPaymentRejectedEvent tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test OrderPaymentRejectedEventInput edge cases
   ************************************************************/
  it(`does not throw if the input OrderPaymentRejectedEventInput is valid`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    expect(() => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput is undefined`, () => {
    const mockOrderPaymentRejectedEventInput = undefined as unknown as OrderPaymentRejectedEventInput
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput is null`, () => {
    const mockOrderPaymentRejectedEventInput = null as unknown as OrderPaymentRejectedEventInput
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderPaymentRejectedEventInput.orderId edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.orderId is undefined`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.orderId = undefined
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.orderId is null`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.orderId = null
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.orderId is empty`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.orderId = ''
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.orderId is blank`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.orderId = '      '
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.orderId length < 4`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.orderId = '123'
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderPaymentRejectedEventInput.sku edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.sku is undefined`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.sku = undefined
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.sku is null`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.sku = null
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.sku is empty`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.sku = ''
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.sku is blank`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.sku = '      '
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.sku length < 4`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.sku = '123'
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderPaymentRejectedEventInput.units edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.units is undefined`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.units = undefined
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.units is null`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.units = null
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.units < 1`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.units = 0
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.units is not an integer`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.units = 2.34
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.units is not a number`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.units = '1' as unknown as number
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderPaymentRejectedEventInput.price edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.price is undefined`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.price = undefined
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.price is null`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.price = null
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.price < 0`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.price = -1
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.price is not a number`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.price = '1' as unknown as number
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderPaymentRejectedEventInput.userId edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.userId is undefined`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.userId = undefined
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.userId is null`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.userId = null
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.userId is empty`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.userId = ''
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.userId is blank`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.userId = '      '
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentRejectedEventInput.userId length < 4`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    mockOrderPaymentRejectedEventInput.userId = '123'
    const testingFunc = () => OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected OrderPaymentRejectedEvent if the execution path is
      successful`, () => {
    const mockOrderPaymentRejectedEventInput = buildMockOrderPaymentRejectedEventInput()
    const result = OrderPaymentRejectedEvent.validateAndBuild(mockOrderPaymentRejectedEventInput)
    const expectedEvent: OrderPaymentRejectedEvent = {
      eventName: PaymentsEventName.ORDER_PAYMENT_REJECTED_EVENT,
      eventData: {
        orderId: mockOrderPaymentRejectedEventInput.orderId,
        sku: mockOrderPaymentRejectedEventInput.sku,
        units: mockOrderPaymentRejectedEventInput.units,
        price: mockOrderPaymentRejectedEventInput.price,
        userId: mockOrderPaymentRejectedEventInput.userId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedEvent))
  })
})
