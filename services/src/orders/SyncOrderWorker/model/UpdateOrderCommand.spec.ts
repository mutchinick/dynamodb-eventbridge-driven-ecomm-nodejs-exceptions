import {
  ForbiddenOrderStatusTransitionError,
  InvalidArgumentsError,
  NotReadyOrderStatusTransitionError,
  RedundantOrderStatusTransitionError,
} from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { IncomingOrderEvent } from './IncomingOrderEvent'
import { UpdateOrderCommand, UpdateOrderCommandInput } from './UpdateOrderCommand'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

type Mutable_IncomingOrderEvent = {
  -readonly [K in keyof IncomingOrderEvent]: IncomingOrderEvent[K]
}

type Mutable_UpdateOrderCommandInput = {
  existingOrderData: OrderData
  incomingOrderEvent: Mutable_IncomingOrderEvent
}

function buildMockIncomingOrderEvent(): Mutable_IncomingOrderEvent {
  const mockValidOrderEvent: Mutable_IncomingOrderEvent = {
    eventName: OrderEventName.ORDER_STOCK_ALLOCATED_EVENT,
    eventData: {
      orderId: 'mockOrderId',
      orderStatus: OrderStatus.ORDER_CREATED_STATUS,
      sku: 'mockSku',
      units: 12,
      price: 1440,
      userId: 'mockUserId',
      createdAt: mockDate,
      updatedAt: mockDate,
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return mockValidOrderEvent
}

function buildMockOrderData() {
  const mockValidOrderData: OrderData = {
    orderId: 'mockOrderId',
    orderStatus: OrderStatus.ORDER_CREATED_STATUS,
    sku: 'mockSku',
    units: 12,
    price: 1440,
    userId: 'mockUserId',
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return mockValidOrderData
}

function buildMockUpdateOrderCommandInput() {
  const mockValidInput: Mutable_UpdateOrderCommandInput = {
    existingOrderData: buildMockOrderData(),
    incomingOrderEvent: buildMockIncomingOrderEvent(),
  }
  return mockValidInput
}

describe(`Orders Service SyncOrderWorker UpdateOrderCommand tests`, () => {
  it(`does not throw if the input UpdateOrderCommandInput is valid`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  //
  // Test UpdateOrderCommandInput edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput is undefined`, () => {
    const mockUpdateOrderCommandInput: UpdateOrderCommandInput = undefined
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput is null`, () => {
    const mockUpdateOrderCommandInput: UpdateOrderCommandInput = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.orderId edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderId is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.orderId
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderId is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderId = undefined
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderId is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderId = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderId is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderId = '' as OrderStatus
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderId is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderId = '      ' as OrderStatus
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderId length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderId = 'ABC' as OrderStatus
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.orderStatus edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderStatus is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.orderStatus
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderStatus is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = undefined
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderStatus is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderStatus is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = '' as OrderStatus
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderStatus is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = '      ' as OrderStatus
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.orderStatus not an OrderStatus`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = 'mockInvalidValue' as OrderStatus
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.sku edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.sku is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.sku
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.sku is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.sku = undefined
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.sku is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.sku = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.sku is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.sku = '' as OrderStatus
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.sku is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.sku = '      ' as OrderStatus
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.sku length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.sku = '      ' as OrderStatus
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.units edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.units is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.units
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.units is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.units = undefined
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.units is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.units = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.units < 0`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.units = -1
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.units == 0`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.units = 0
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.units is not a number`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.units = '1' as unknown as number
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.price edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.price is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.price
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.price is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.price = undefined
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.price is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.price = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.price < 0`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.price = -1
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.price is not a number`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.price = '1' as unknown as number
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.userId edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.userId is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.userId
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.userId is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.userId = undefined
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.userId is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.userId = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.userId is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.userId = ''
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.userId is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.userId = '      '
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.userId length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.userId = '123'
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.createdAt edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.createdAt is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.createdAt
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.createdAt is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.createdAt = undefined
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.createdAt is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.createdAt = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.createdAt is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.createdAt = ''
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.createdAt is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.createdAt = '      '
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.createdAt length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.createdAt = '123'
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.existingOrderData.updatedAt edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.updatedAt is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.existingOrderData.updatedAt
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.updatedAt is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.updatedAt = undefined
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.updatedAt is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.updatedAt = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.updatedAt is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.updatedAt = ''
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.updatedAt is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.updatedAt = '      '
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.existingOrderData.updatedAt length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.updatedAt = '123'
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventName edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventName is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventName
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventName is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = undefined
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventName is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventName is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = '' as OrderEventName
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventName is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = '      ' as OrderEventName
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventName is not an IncomingOrderEventName`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = 'mockOrderEventName' as OrderEventName
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderId
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderId = undefined
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderId = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderId = ''
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderId = '      '
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderId length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderId = '123'
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus edge cases
  //
  it(`does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it(`does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus = '' as OrderStatus
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus = '      ' as OrderStatus
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus is not an OrderStatus`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.orderStatus = 'mockOrderStatus' as OrderStatus
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.sku edge cases
  //
  it(`does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.sku is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.sku
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it(`does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.sku is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.sku = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.sku is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.sku = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.sku is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.sku = ''
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.sku is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.sku = '      '
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.sku length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.sku = '123'
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.units edge cases
  //
  it(`does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.units is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.units
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it(`does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.units is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.units = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.units is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.units = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.units < 0`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.units = -1
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.units == 0`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.units = 0
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.units is not an integer`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.units = 3.45
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.units is not a number`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.units = '1' as unknown as number
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.price edge cases
  //
  it(`does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.price is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.price
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it(`does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.price is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.price = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.price is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.price = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.price < 0`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.price = -1
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.price is not a number`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.price = '1' as unknown as number
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.userId edge cases
  //
  it(`does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.userId is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.userId
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it(`does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.userId is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.userId = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.userId is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.userId = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.userId is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.userId = ''
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.userId is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.userId = '      '
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.userId length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.userId = '123'
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt edge cases
  //
  it(`does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it(`does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt = ''
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt = '      '
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.createdAt = '123'
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt edge cases
  //
  it(`does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it(`does not throw if the input UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt = undefined
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt = ''
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt = '      '
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.eventData.updatedAt = '123'
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.createdAt edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.createdAt is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.createdAt
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow(
      expect.objectContaining({
        transient: false,
      }),
    )
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.createdAt is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.createdAt = undefined
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.createdAt is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.createdAt = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.createdAt is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.createdAt = ''
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.createdAt is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.createdAt = '      '
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.createdAt length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.createdAt = '123'
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test UpdateOrderCommandInput.incomingOrderEvent.updatedAt edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.updatedAt is missing`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    delete mockUpdateOrderCommandInput.incomingOrderEvent.updatedAt
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.updatedAt is undefined`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.updatedAt = undefined
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.updatedAt is null`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.updatedAt = null
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.updatedAt is empty`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.updatedAt = ''
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.updatedAt is blank`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.updatedAt = '      '
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      UpdateOrderCommandInput.incomingOrderEvent.updatedAt length < 4`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.incomingOrderEvent.updatedAt = '123'
    const testingFunc = () => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test Event and Order Status Transition edge cases
  //
  it(`throws non-transient ForbiddenOrderStatusTransitionError if the input
      existingOrderData.orderStatus is not valid for transition`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = OrderStatus.ORDER_CANCELED_STATUS
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = OrderEventName.ORDER_STOCK_ALLOCATED_EVENT
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow(
      ForbiddenOrderStatusTransitionError,
    )
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow(
      expect.objectContaining({
        transient: false,
      }),
    )
  })

  it(`throws a transient NotReadyOrderStatusTransitionError error if the input
      existingOrderData.orderStatus is not ready for transition`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = OrderStatus.ORDER_CREATED_STATUS
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = OrderEventName.ORDER_FULFILLED_EVENT
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow(
      NotReadyOrderStatusTransitionError,
    )
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow(
      expect.objectContaining({
        transient: true,
      }),
    )
  })

  it(`throws a non-transient RedundantOrderStatusTransitionError error if the input
      existingOrderData.orderStatus is not ready for transition`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = OrderStatus.ORDER_PAYMENT_ACCEPTED_STATUS
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = OrderEventName.ORDER_PAYMENT_ACCEPTED_EVENT
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow(
      RedundantOrderStatusTransitionError,
    )
    expect(() => UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)).toThrow(
      expect.objectContaining({
        transient: false,
      }),
    )
  })

  //
  // Test expected results
  //
  it(`returns the expected UpdateOrderCommand with the expected data (case ORDER_STOCK_ALLOCATED_STATUS)`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = OrderStatus.ORDER_CREATED_STATUS
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = OrderEventName.ORDER_STOCK_ALLOCATED_EVENT
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    const expectedCommand: UpdateOrderCommand = {
      commandData: {
        orderId: mockUpdateOrderCommandInput.existingOrderData.orderId,
        orderStatus: OrderStatus.ORDER_STOCK_ALLOCATED_STATUS,
        updatedAt: mockDate,
      },
      options: {},
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedCommand))
  })

  it(`returns the expected UpdateOrderCommand with the expected data (case ORDER_FULFILLED_STATUS)`, () => {
    const mockUpdateOrderCommandInput = buildMockUpdateOrderCommandInput()
    mockUpdateOrderCommandInput.existingOrderData.orderStatus = OrderStatus.ORDER_PAYMENT_ACCEPTED_STATUS
    mockUpdateOrderCommandInput.incomingOrderEvent.eventName = OrderEventName.ORDER_FULFILLED_EVENT
    const result = UpdateOrderCommand.validateAndBuild(mockUpdateOrderCommandInput)
    const expectedCommand: UpdateOrderCommand = {
      commandData: {
        orderId: mockUpdateOrderCommandInput.existingOrderData.orderId,
        orderStatus: OrderStatus.ORDER_FULFILLED_STATUS,
        updatedAt: mockDate,
      },
      options: {},
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedCommand))
  })
})
