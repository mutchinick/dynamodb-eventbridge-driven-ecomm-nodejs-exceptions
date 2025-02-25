import { InvalidArgumentsError } from '../../errors/AppError'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { OrderStockDepletedEvent, OrderStockDepletedEventInput } from './OrderStockDepletedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockValidOrderStockDepletedEventInput() {
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
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).not.toThrow()
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput is undefined`, () => {
    const mockOrderStockDepletedEventInput = undefined as unknown as OrderStockDepletedEventInput
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput is null`, () => {
    const mockOrderStockDepletedEventInput = null as unknown as OrderStockDepletedEventInput
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  //
  // Test OrderStockDepletedEventData.orderId edge cases
  //
  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.orderId is missing`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    delete mockOrderStockDepletedEventInput.orderId
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.orderId is undefined`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = undefined
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.orderId is null`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = null
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.orderId is empty`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = ''
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.orderId is blank`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = '      '
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.orderId length < 4`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.orderId = '123'
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  //
  // Test OrderStockDepletedEventData.sku edge cases
  //
  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.sku is missing`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    delete mockOrderStockDepletedEventInput.sku
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.sku is undefined`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = undefined
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.sku is null`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = null
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.sku is empty`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = ''
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.sku is blank`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = '      '
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.sku length < 4`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.sku = '123'
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  //
  // Test OrderStockDepletedEventData.units edge cases
  //
  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.units is missing`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    delete mockOrderStockDepletedEventInput.units
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.units is undefined`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = undefined
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.units is null`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = null
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.units < 0`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = -1
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.units == 0`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = 0
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.units is not an integer`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = 2.34
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockDepletedEventInput.units is not a number`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
    mockOrderStockDepletedEventInput.units = '1' as unknown as number
    expect(() => OrderStockDepletedEvent.validateAndBuild(mockOrderStockDepletedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  //
  // Test expected results
  //
  it(`returns the expected OrderStockDepletedEvent with eventName and eventData`, () => {
    const mockOrderStockDepletedEventInput = buildMockValidOrderStockDepletedEventInput()
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
