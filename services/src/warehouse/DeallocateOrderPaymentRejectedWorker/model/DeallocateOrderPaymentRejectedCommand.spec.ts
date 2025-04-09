import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { WarehouseEventName } from '../../model/WarehouseEventName'
import {
  DeallocateOrderPaymentRejectedCommand,
  DeallocateOrderPaymentRejectedCommandInput,
} from './DeallocateOrderPaymentRejectedCommand'
import { IncomingOrderPaymentRejectedEvent } from './IncomingOrderPaymentRejectedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockIncomingOrderPaymentRejectedEvent(): TypeUtilsMutable<IncomingOrderPaymentRejectedEvent> {
  const mockEvent: TypeUtilsMutable<IncomingOrderPaymentRejectedEvent> = {
    eventName: WarehouseEventName.ORDER_PAYMENT_REJECTED_EVENT,
    eventData: {
      orderId: 'mockOrderId',
      sku: 'mockSku',
      units: 111, // Intentional mismatch with existingOrderAllocationData
      price: 123.45,
      userId: 'mockUserId',
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return mockEvent
}

function buildMockExistingOrderAllocationData(): TypeUtilsMutable<OrderAllocationData> {
  const mockData: TypeUtilsMutable<OrderAllocationData> = {
    orderId: 'mockOrderId',
    sku: 'mockSku',
    units: 777, // Intentional mismatch with incomingOrderPaymentRejectedEvent
    price: 123.45,
    userId: 'mockUserId',
    createdAt: mockDate,
    updatedAt: mockDate,
    allocationStatus: 'ALLOCATED',
  }
  return mockData
}

function buildMockDeallocateOrderPaymentRejectedCommandInput(): TypeUtilsMutable<DeallocateOrderPaymentRejectedCommandInput> {
  const mockValidInput: TypeUtilsMutable<DeallocateOrderPaymentRejectedCommandInput> = {
    existingOrderAllocationData: buildMockExistingOrderAllocationData(),
    incomingOrderPaymentRejectedEvent: buildMockIncomingOrderPaymentRejectedEvent(),
  }
  return mockValidInput
}

describe(`Warehouse Service DeallocateOrderPaymentRejectedWorker DeallocateOrderPaymentRejectedCommand tests`, () => {
  //
  // Test DeallocateOrderPaymentRejectedCommandInput edge cases
  //
  it(`does not throw if the input DeallocateOrderPaymentRejectedCommandInput is valid`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    expect(() =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput),
    ).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input DeallocateOrderPaymentRejectedCommandInput is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput: DeallocateOrderPaymentRejectedCommandInput = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input DeallocateOrderPaymentRejectedCommandInput is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput: DeallocateOrderPaymentRejectedCommandInput = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData is missing`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    delete mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData is empty`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData = {} as never
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.orderId edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.orderId is missing`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    delete mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.orderId
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.orderId is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.orderId = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.orderId is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.orderId = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.orderId is empty`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.orderId = ''
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.orderId is blank`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.orderId = '      '
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.orderId length < 4`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.orderId = '123'
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.sku edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.sku is missing`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    delete mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.sku
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.sku is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.sku = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.sku is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.sku = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.sku is empty`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.sku = ''
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.sku is blank`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.sku = '      '
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.sku length < 4`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.sku = '123'
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.units edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.units is missing`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    delete mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.units
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.units is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.units = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.units is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.units = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.units < 0`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.units = -1
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.units == 0`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.units = 0
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.units is not an integer`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.units = 3.45
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.units is not a number`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.units = '1' as unknown as number
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.price edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.price is missing`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    delete mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.price
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.price is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.price = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.price is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.price = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.price < 0`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.price = -1
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.price is not a number`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.price = '1' as unknown as number
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.userId edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.userId is missing`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    delete mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.userId
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.userId is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.userId = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.userId is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.userId = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.userId is empty`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.userId = ''
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.userId is blank`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.userId = '      '
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.userId length < 4`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.userId = '123'
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.createdAt edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.createdAt is missing`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    delete mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.createdAt
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.createdAt is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.createdAt = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.createdAt is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.createdAt = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.createdAt is empty`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.createdAt = ''
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.createdAt is blank`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.createdAt = '      '
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.createdAt length < 4`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.createdAt = '123'
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.updatedAt edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.updatedAt is missing`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    delete mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.updatedAt
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.updatedAt is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.updatedAt = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.updatedAt is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.updatedAt = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.updatedAt is empty`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.updatedAt = ''
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.updatedAt is blank`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.updatedAt = '      '
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.updatedAt length < 4`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.updatedAt = '123'
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent is missing`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    delete mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent is empty`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent = {} as never
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventName edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventName is missing`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    delete mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventName
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventName is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventName = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventName is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventName = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventName is empty`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventName = '' as never
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventName is blank`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventName = '      ' as never
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventName is not an ORDER_PAYMENT_REJECTED_EVENT`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventName =
      WarehouseEventName.ORDER_CANCELED_EVENT as never
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData is missing`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    delete mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData is empty`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData = {} as never
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.orderId edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.orderId is missing`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    delete mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.orderId
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.orderId is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.orderId = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.orderId is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.orderId = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.orderId is empty`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.orderId = ''
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.orderId is blank`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.orderId = '      '
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.orderId length < 4`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.orderId = '123'
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.sku edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.sku is missing`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    delete mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.sku
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.sku is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.sku = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.sku is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.sku = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.sku is empty`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.sku = ''
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.sku is blank`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.sku = '      '
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.sku length < 4`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.sku = '123'
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.units edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.units is missing`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    delete mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.units
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.units is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.units = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.units is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.units = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.units < 0`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.units = -1
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.units == 0`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.units = 0
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.units is not an integer`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.units = 3.45
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.units is not a number`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.units =
      '1' as unknown as number
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.price edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
    DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.price is missing`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    delete mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.price
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
    DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.price is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.price = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
    DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.price is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.price = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
    DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.price < 0`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.price = -1
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
    DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.price is not a number`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.price =
      '1' as unknown as number
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.userId edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
    DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.userId is missing`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    delete mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.userId
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
    DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.userId is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.userId = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
    DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.userId is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.userId = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
    DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.userId is empty`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.userId = ''
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
    DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.userId is blank`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.userId = '      '
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
    DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.userId length < 4`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.userId = '123'
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.createdAt edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.createdAt is missing`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    delete mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.createdAt
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.createdAt is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.createdAt = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.createdAt is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.createdAt = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.createdAt is empty`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.createdAt = ''
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.createdAt is blank`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.createdAt = '      '
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.createdAt length < 4`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.createdAt = '123'
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.updatedAt edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.updatedAt is missing`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    delete mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.updatedAt
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.updatedAt is undefined`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.updatedAt = undefined
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.updatedAt is null`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.updatedAt = null
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.updatedAt is empty`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.updatedAt = ''
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.updatedAt is blank`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.updatedAt = '      '
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      DeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.updatedAt length < 4`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.updatedAt = '123'
    const testingFunc = () =>
      DeallocateOrderPaymentRejectedCommand.validateAndBuild(mockDeallocateOrderPaymentRejectedCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test expected results
  //
  it(`returns the expected DeallocateOrderPaymentRejectedCommand with the expected data`, () => {
    const mockDeallocateOrderPaymentRejectedCommandInput = buildMockDeallocateOrderPaymentRejectedCommandInput()
    const result = DeallocateOrderPaymentRejectedCommand.validateAndBuild(
      mockDeallocateOrderPaymentRejectedCommandInput,
    )
    const expectedCommand: DeallocateOrderPaymentRejectedCommand = {
      commandData: {
        orderId: mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.orderId,
        sku: mockDeallocateOrderPaymentRejectedCommandInput.incomingOrderPaymentRejectedEvent.eventData.sku,
        units: mockDeallocateOrderPaymentRejectedCommandInput.existingOrderAllocationData.units,
        updatedAt: mockDate,
        allocationStatus: 'PAYMENT_REJECTED',
        expectedAllocationStatus: 'ALLOCATED',
      },
      options: {},
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedCommand))
  })
})
