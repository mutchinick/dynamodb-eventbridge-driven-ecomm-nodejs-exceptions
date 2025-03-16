import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderPlacedEvent, OrderPlacedEventInput } from './OrderPlacedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockOrderPlacedEventInput() {
  const mockValidInput: OrderPlacedEventInput = {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
    price: 23.45,
    userId: 'mockUserId',
  }
  return mockValidInput
}

describe(`Orders Service PlaceOrderApi OrderPlacedEvent tests`, () => {
  //
  // Test OrderPlacedEventData edge cases
  //
  it(`does not throw if the input OrderPlacedEventInput is valid`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    expect(() => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput is undefined`, () => {
    const mockOrderPlacedEventInput = undefined as unknown as OrderPlacedEventInput
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput is null`, () => {
    const mockOrderPlacedEventInput = null as unknown as OrderPlacedEventInput
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test OrderPlacedEventData.orderId edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.orderId is missing`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    delete mockOrderPlacedEventInput.orderId
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.orderId is undefined`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.orderId = undefined
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.orderId is null`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.orderId = null
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.orderId is empty`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.orderId = ''
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.orderId is blank`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.orderId = '      '
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.orderId length < 4`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.orderId = '123'
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test OrderPlacedEventData.sku edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.sku is missing`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    delete mockOrderPlacedEventInput.sku
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.sku is undefined`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.sku = undefined
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.sku is null`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.sku = null
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.sku is empty`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.sku = ''
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.sku is blank`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.sku = '      '
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.sku length < 4`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.sku = '123'
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test OrderPlacedEventData.units edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.units is missing`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    delete mockOrderPlacedEventInput.units
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.units is undefined`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.units = undefined
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.units is null`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.units = null
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.units < 0`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.units = -1
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.units == 0`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.units = 0
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.units is not an integer`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.units = 3.45
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.units is not a number`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.units = '1' as unknown as number
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test OrderPlacedEventData.price edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.price is missing`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    delete mockOrderPlacedEventInput.price
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.price is undefined`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.price = undefined
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.price is null`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.price = null
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.price < 0`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.price = -1
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.price is not a number`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.price = '1' as unknown as number
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test OrderPlacedEventData.userId edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.userId is missing`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    delete mockOrderPlacedEventInput.userId
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.userId is undefined`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.userId = undefined
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.userId is null`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.userId = null
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.userId is empty`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.userId = ''
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.userId is blank`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.userId = '      '
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderPlacedEventInput.userId length < 4`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    mockOrderPlacedEventInput.userId = '123'
    const testingFunc = () => OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test expected results
  //
  it(`returns the expected OrderPlacedEvent with eventName and eventData`, () => {
    const mockOrderPlacedEventInput = buildMockOrderPlacedEventInput()
    const result = OrderPlacedEvent.validateAndBuild(mockOrderPlacedEventInput)
    const expected: OrderPlacedEvent = {
      eventName: OrderEventName.ORDER_PLACED_EVENT,
      eventData: {
        orderId: mockOrderPlacedEventInput.orderId,
        sku: mockOrderPlacedEventInput.sku,
        units: mockOrderPlacedEventInput.units,
        price: mockOrderPlacedEventInput.price,
        userId: mockOrderPlacedEventInput.userId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    expect(result).toMatchObject(expected)
  })
})
