import { InvalidArgumentsError } from '../../errors/AppError'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { OrderStockAllocatedEvent, OrderStockAllocatedEventInput } from './OrderStockAllocatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockValidOrderStockAllocatedEventInput() {
  const mockValidInput: OrderStockAllocatedEventInput = {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 2,
  }
  return mockValidInput
}

describe(`Warehouse Service AllocateOrderStockApi OrderStockAllocatedEvent tests`, () => {
  //
  // Test OrderStockAllocatedEventData edge cases
  //
  it(`does not throw if the input OrderStockAllocatedEventInput is valid`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).not.toThrow()
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput is undefined`, () => {
    const mockOrderStockAllocatedEventInput = undefined as unknown as OrderStockAllocatedEventInput
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput is null`, () => {
    const mockOrderStockAllocatedEventInput = null as unknown as OrderStockAllocatedEventInput
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  //
  // Test OrderStockAllocatedEventData.orderId edge cases
  //
  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.orderId is missing`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    delete mockOrderStockAllocatedEventInput.orderId
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.orderId is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = undefined
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.orderId is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = null
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.orderId is empty`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = ''
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.orderId is blank`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = '      '
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.orderId length < 4`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = '123'
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  //
  // Test OrderStockAllocatedEventData.sku edge cases
  //
  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.sku is missing`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    delete mockOrderStockAllocatedEventInput.sku
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.sku is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = undefined
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.sku is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = null
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.sku is empty`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = ''
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.sku is blank`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = '      '
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.sku length < 4`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = '123'
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  //
  // Test OrderStockAllocatedEventData.units edge cases
  //
  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.units is missing`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    delete mockOrderStockAllocatedEventInput.units
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.units is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = undefined
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.units is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = null
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.units < 0`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = -1
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.units == 0`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = 0
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.units is not an integer`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = 2.34
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  it(`throws an InvalidArgumentsError if the input OrderStockAllocatedEventInput.units is not a number`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = '1' as unknown as number
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).toThrow(
      InvalidArgumentsError,
    )
  })

  //
  // Test expected results
  //
  it(`returns the expected OrderStockAllocatedEvent with eventName and eventData`, () => {
    const mockOrderStockAllocatedEventInput = buildMockValidOrderStockAllocatedEventInput()
    const expected: OrderStockAllocatedEvent = {
      eventName: WarehouseEventName.ORDER_STOCK_ALLOCATED_EVENT,
      eventData: {
        orderId: mockOrderStockAllocatedEventInput.orderId,
        sku: mockOrderStockAllocatedEventInput.sku,
        units: mockOrderStockAllocatedEventInput.units,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    const orderStockAllocatedEvent = OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(orderStockAllocatedEvent).toMatchObject(expected)
  })
})
