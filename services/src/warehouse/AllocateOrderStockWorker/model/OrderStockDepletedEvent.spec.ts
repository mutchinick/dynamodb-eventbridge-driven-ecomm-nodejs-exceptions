import { InvalidArgumentsError } from '../../errors/AppError'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { OrderStockDepletedEvent, OrderStockDepletedEventInput } from './OrderStockDepletedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockOrderStockDepletedEventInput() {
  const mockValidInput: OrderStockDepletedEventInput = {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
  }
  return mockValidInput
}

describe(`Warehouse Service AllocateOrderStockApi OrderStockDepletedEvent tests`, () => {
  //
  // Test OrderStockDepletedEventData edge cases
  //
  it(`does not throw if the input OrderStockDepletedEventInput is valid`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput is undefined`, () => {
    const mockOrderStockDepletedEventInput = undefined as unknown as OrderStockDepletedEventInput
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput is null`, () => {
    const mockOrderStockDepletedEventInput = null as unknown as OrderStockDepletedEventInput
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test OrderStockDepletedEventData.orderId edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.orderId is missing`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    delete mockOrderStockDepletedEventInput.orderId
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.orderId is undefined`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = undefined
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.orderId is null`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = null
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.orderId is empty`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = ''
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.orderId is blank`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = '      '
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.orderId length < 4`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = '123'
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test OrderStockDepletedEventData.sku edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.sku is missing`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    delete mockOrderStockDepletedEventInput.sku
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.sku is undefined`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = undefined
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.sku is null`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = null
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.sku is empty`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = ''
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.sku is blank`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = '      '
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.sku length < 4`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = '123'
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test OrderStockDepletedEventData.units edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.units is missing`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    delete mockOrderStockDepletedEventInput.units
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.units is undefined`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = undefined
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.units is null`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = null
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.units < 0`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = -1
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.units == 0`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = 0
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.units is not an integer`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = 2.34
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockDepletedEventInput.units is not a number`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = '1' as unknown as number
    const testingFunc = () => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test expected results
  //
  it(`returns the expected OrderStockDepletedEvent with eventName and eventData`, () => {
    const mockOrderStockDepletedEventInput = buildMockOrderStockDepletedEventInput()
    const expected: OrderStockDepletedEvent = {
      eventName: WarehouseEventName.ORDER_STOCK_DEPLETED_EVENT,
      eventData: {
        orderId: mockOrderStockDepletedEventInput.orderId,
        sku: mockOrderStockDepletedEventInput.sku,
        units: mockOrderStockDepletedEventInput.units,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    const orderStockDepletedEvent = OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)
    expect(orderStockDepletedEvent).toMatchObject(expected)
  })
})
