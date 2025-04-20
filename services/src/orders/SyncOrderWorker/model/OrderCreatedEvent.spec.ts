import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderCreatedEvent, OrderCreatedEventInput } from './OrderCreatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 14
const mockPrice = 1897.99
const mockUserId = 'mockUserId'

function buildMockOrderCreatedEventInput(): OrderCreatedEventInput {
  const mockEventInput: OrderCreatedEventInput = {
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
  }
  return mockEventInput
}

describe(`Orders Service SyncOrderWorker OrderCreatedEvent tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test OrderCreatedEventInput edge cases
   ************************************************************/
  it(`does not throw if the input OrderCreatedEventInput is valid`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    expect(() => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderCreatedEventInput
      is undefined`, () => {
    const mockOrderCreatedEventInput = undefined as never
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderCreatedEventInput
      is null`, () => {
    const mockOrderCreatedEventInput = null as never
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderCreatedEventInput.orderId edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderId is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderId = undefined
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderId is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderId = null
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderId is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderId = ''
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderId is blank`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderId = '      '
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderId length < 4`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderId = '123'
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderCreatedEventInput.sku edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.sku is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.sku = undefined
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.sku is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.sku = null
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.sku is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.sku = ''
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.sku is blank`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.sku = '      '
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.sku length < 4`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.sku = '123'
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderCreatedEventInput.units edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.units is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.units = undefined
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.units is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.units = null
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.units < 1`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.units = 0
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.units is not an integer`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.units = 3.45
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.units is not a number`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.units = '1' as unknown as number
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderCreatedEventInput.price edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.price is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.price = undefined
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.price is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.price = null
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.price < 0`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.price = -1
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.price is not a number`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.price = '1' as unknown as number
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderCreatedEventInput.userId edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.userId is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.userId = undefined
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.userId is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.userId = null
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.userId is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.userId = ''
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.userId is blank`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.userId = '      '
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.userId length < 4`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.userId = '123'
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected OrderCreatedEvent if the execution path is successful`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    const result = OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    const expectedEvent: OrderCreatedEvent = {
      eventName: OrderEventName.ORDER_CREATED_EVENT,
      eventData: {
        orderId: mockOrderCreatedEventInput.orderId,
        sku: mockOrderCreatedEventInput.sku,
        units: mockOrderCreatedEventInput.units,
        price: mockOrderCreatedEventInput.price,
        userId: mockOrderCreatedEventInput.userId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedEvent))
  })
})
