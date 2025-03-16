import { InvalidArgumentsError } from '../../errors/AppError'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import { OrderStockAllocatedEvent, OrderStockAllocatedEventInput } from './OrderStockAllocatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockOrderStockAllocatedEventInput() {
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
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    expect(() => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput is undefined`, () => {
    const mockOrderStockAllocatedEventInput = undefined as unknown as OrderStockAllocatedEventInput
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput is null`, () => {
    const mockOrderStockAllocatedEventInput = null as unknown as OrderStockAllocatedEventInput
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test OrderStockAllocatedEventData.orderId edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.orderId is missing`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    delete mockOrderStockAllocatedEventInput.orderId
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.orderId is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = undefined
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.orderId is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = null
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.orderId is empty`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = ''
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.orderId is blank`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = '      '
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.orderId length < 4`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.orderId = '123'
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test OrderStockAllocatedEventData.sku edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.sku is missing`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    delete mockOrderStockAllocatedEventInput.sku
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.sku is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = undefined
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.sku is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = null
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.sku is empty`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = ''
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.sku is blank`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = '      '
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.sku length < 4`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.sku = '123'
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test OrderStockAllocatedEventData.units edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.units is missing`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    delete mockOrderStockAllocatedEventInput.units
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.units is undefined`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = undefined
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.units is null`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = null
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.units < 0`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = -1
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.units == 0`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = 0
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.units is not an integer`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = 2.34
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input OrderStockAllocatedEventInput.units is not a number`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
    mockOrderStockAllocatedEventInput.units = '1' as unknown as number
    const testingFunc = () => OrderStockAllocatedEvent.validateAndBuild(mockOrderStockAllocatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test expected results
  //
  it(`returns the expected OrderStockAllocatedEvent with eventName and eventData`, () => {
    const mockOrderStockAllocatedEventInput = buildMockOrderStockAllocatedEventInput()
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
