import { InvalidArgumentsError } from '../../errors/AppError'
import { PaymentsEventName } from '../../model/PaymentsEventName'
import { OrderPaymentAcceptedEvent, OrderPaymentAcceptedEventInput } from './OrderPaymentAcceptedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.99
const mockUserId = 'mockUserId'

function buildMockOrderPaymentAcceptedEventInput(): OrderPaymentAcceptedEventInput {
  const mockValidInput: OrderPaymentAcceptedEventInput = {
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
  }
  return mockValidInput
}

describe(`Payments Service ProcessOrderPaymentWorker OrderPaymentAcceptedEvent tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test OrderPaymentAcceptedEventInput edge cases
   ************************************************************/
  it(`does not throw if the input OrderPaymentAcceptedEventInput is valid`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    expect(() => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput is undefined`, () => {
    const mockOrderPaymentAcceptedEventInput = undefined as unknown as OrderPaymentAcceptedEventInput
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput is null`, () => {
    const mockOrderPaymentAcceptedEventInput = null as unknown as OrderPaymentAcceptedEventInput
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderPaymentAcceptedEventInput.orderId edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.orderId is undefined`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.orderId = undefined
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.orderId is null`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.orderId = null
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.orderId is empty`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.orderId = ''
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.orderId is blank`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.orderId = '      '
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.orderId length < 4`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.orderId = '123'
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderPaymentAcceptedEventInput.sku edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.sku is undefined`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.sku = undefined
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.sku is null`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.sku = null
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.sku is empty`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.sku = ''
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.sku is blank`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.sku = '      '
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.sku length < 4`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.sku = '123'
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderPaymentAcceptedEventInput.units edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.units is undefined`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.units = undefined
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.units is null`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.units = null
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.units < 1`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.units = 0
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.units is not an integer`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.units = 2.34
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.units is not a number`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.units = '1' as unknown as number
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderPaymentAcceptedEventInput.price edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.price is undefined`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.price = undefined
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.price is null`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.price = null
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.price < 0`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.price = -1
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.price is not a number`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.price = '1' as unknown as number
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderPaymentAcceptedEventInput.userId edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.userId is undefined`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.userId = undefined
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.userId is null`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.userId = null
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.userId is empty`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.userId = ''
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.userId is blank`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.userId = '      '
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPaymentAcceptedEventInput.userId length < 4`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    mockOrderPaymentAcceptedEventInput.userId = '123'
    const testingFunc = () => OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected OrderPaymentAcceptedEvent if the execution path is
      successful`, () => {
    const mockOrderPaymentAcceptedEventInput = buildMockOrderPaymentAcceptedEventInput()
    const result = OrderPaymentAcceptedEvent.validateAndBuild(mockOrderPaymentAcceptedEventInput)
    const expectedEvent: OrderPaymentAcceptedEvent = {
      eventName: PaymentsEventName.ORDER_PAYMENT_ACCEPTED_EVENT,
      eventData: {
        orderId: mockOrderPaymentAcceptedEventInput.orderId,
        sku: mockOrderPaymentAcceptedEventInput.sku,
        units: mockOrderPaymentAcceptedEventInput.units,
        price: mockOrderPaymentAcceptedEventInput.price,
        userId: mockOrderPaymentAcceptedEventInput.userId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedEvent))
  })
})
