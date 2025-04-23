import { InvalidArgumentsError } from '../../errors/AppError'
import { InventoryEventName } from '../../model/InventoryEventName'
import { OrderStockDepletedEvent, OrderStockDepletedEventInput } from './OrderStockDepletedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.99
const mockUserId = 'mockUserId'

function buildMockOrderStockDepletedEventInput(): OrderStockDepletedEventInput {
  const mockValidInput: OrderStockDepletedEventInput = {
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
  }
  return mockValidInput
}

describe(`Inventory Service AllocateOrderStockApi OrderStockDepletedEvent tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test OrderStockDepletedEventInput edge cases
   ************************************************************/
  it(`does not throw if the input OrderStockDepletedEventInput is valid`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput is undefined`, () => {
    const mockOrderStockDepletedEventInput = undefined as unknown as OrderStockDepletedEventInput
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput is null`, () => {
    const mockOrderStockDepletedEventInput = null as unknown as OrderStockDepletedEventInput
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput is null`, () => {
    const mockOrderStockDepletedEventInput = null as unknown as OrderStockDepletedEventInput
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderStockDepletedEventInput.orderId edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.orderId is undefined`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = undefined
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.orderId is null`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = null
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.orderId is empty`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = ''
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.orderId is blank`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = '      '
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.orderId length < 4`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = '123'
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderStockDepletedEventInput.sku edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.sku is undefined`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = undefined
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.sku is null`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = null
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.sku is empty`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = ''
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.sku is blank`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = '      '
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.sku length < 4`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = '123'
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderStockDepletedEventInput.units edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.units is undefined`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = undefined
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.units is null`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = null
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.units < 1`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = 0
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.units is not an integer`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = 2.34
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.units is not a number`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = '1' as unknown as number
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderStockDepletedEventInput.price edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.price is undefined`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.price = undefined
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.price is null`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.price = null
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.price < 0`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.price = -1
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.price is not a number`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.price = '1' as unknown as number
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderStockDepletedEventInput.userId edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.userId is undefined`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.userId = undefined
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.userId is null`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.userId = null
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.userId is empty`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.userId = ''
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.userId is blank`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.userId = '      '
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockDepletedEventInput.userId length < 4`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.userId = '123'
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected OrderStockDepletedEvent if the execution path is successful`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    const result = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    const expectedEvent: OrderStockDepletedEvent = {
      eventName: InventoryEventName.ORDER_STOCK_DEPLETED_EVENT,
      eventData: {
        orderId: mockOrderStockDepletedEventInput.orderId,
        sku: mockOrderStockDepletedEventInput.sku,
        units: mockOrderStockDepletedEventInput.units,
        price: mockOrderStockDepletedEventInput.price,
        userId: mockOrderStockDepletedEventInput.userId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedEvent))
  })
})
