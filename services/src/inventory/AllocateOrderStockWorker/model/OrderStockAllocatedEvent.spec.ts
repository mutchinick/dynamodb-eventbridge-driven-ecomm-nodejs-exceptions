import { InvalidArgumentsError } from '../../errors/AppError'
import { InventoryEventName } from '../../model/InventoryEventName'
import { OrderStockAllocatedEvent, OrderStockAllocatedEventInput } from './OrderStockAllocatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 2
const mockPrice = 10.99
const mockUserId = 'mockUserId'

function buildMockOrderStockAllocatedEventInput(): OrderStockAllocatedEventInput {
  const mockValidInput: OrderStockAllocatedEventInput = {
    orderId: mockOrderId,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
  }
  return mockValidInput
}

describe(`Inventory Service AllocateOrderStockApi OrderStockAllocatedEvent tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test OrderStockAllocatedEventInput edge cases
   ************************************************************/
  it(`does not throw if the input OrderStockAllocatedEventInput is valid`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput is undefined`, () => {
    const mockOrderStockAllocatedEventInput = undefined as unknown as OrderStockAllocatedEventInput
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput is null`, () => {
    const mockOrderStockAllocatedEventInput = null as unknown as OrderStockAllocatedEventInput
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderStockAllocatedEventInput.orderId edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.orderId is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = undefined
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.orderId is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = null
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.orderId is empty`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = ''
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.orderId is blank`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = '      '
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.orderId length < 4`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = '123'
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderStockAllocatedEventInput.sku edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.sku is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = undefined
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.sku is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = null
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.sku is empty`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = ''
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.sku is blank`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = '      '
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.sku length < 4`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = '123'
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderStockAllocatedEventInput.units edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.units is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = undefined
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.units is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = null
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.units < 1`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = 0
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.units is not an integer`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = 2.34
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.units is not a number`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = '1' as unknown as number
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderStockAllocatedEventInput.price edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.price is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.price = undefined
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.price is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.price = null
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.price < 0`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.price = -1
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.price is not a number`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.price = '1' as unknown as number
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderStockAllocatedEventInput.userId edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.userId is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.userId = undefined
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.userId is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.userId = null
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.userId is empty`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.userId = ''
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.userId is blank`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.userId = '      '
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderStockAllocatedEventInput.userId length < 4`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.userId = '123'
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected OrderStockAllocatedEvent if the execution path is
      successful`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    const result = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    const expectedEvent: OrderStockAllocatedEvent = {
      eventName: InventoryEventName.ORDER_STOCK_ALLOCATED_EVENT,
      eventData: {
        orderId: mockOrderStockAllocatedEventInput.orderId,
        sku: mockOrderStockAllocatedEventInput.sku,
        units: mockOrderStockAllocatedEventInput.units,
        price: mockOrderStockAllocatedEventInput.price,
        userId: mockOrderStockAllocatedEventInput.userId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedEvent))
  })
})
