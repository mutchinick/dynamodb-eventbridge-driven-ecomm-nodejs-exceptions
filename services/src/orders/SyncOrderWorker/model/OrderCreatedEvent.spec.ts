import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { OrderCreatedEvent, OrderCreatedEventInput } from './OrderCreatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockOrderId = 'mockOrderId'
const mockOrderStatus = OrderStatus.ORDER_CREATED_STATUS
const mockSku = 'mockSku'
const mockUnits = 14
const mockPrice = 1897.99
const mockUserId = 'mockUserId'
const mockCreatedAt = mockDate
const mockUpdatedAt = mockDate
const mockIncomingEventName = OrderEventName.ORDER_PLACED_EVENT

function buildMockOrderData(): OrderData {
  return {
    orderId: mockOrderId,
    orderStatus: mockOrderStatus,
    sku: mockSku,
    units: mockUnits,
    price: mockPrice,
    userId: mockUserId,
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
  }
}

function buildMockOrderCreatedEventInput(): OrderCreatedEventInput {
  return {
    incomingEventName: mockIncomingEventName,
    orderData: buildMockOrderData(),
  }
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
   * Test OrderCreatedEventInput.incomingEventName edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.incomingEventName is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.incomingEventName = undefined
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.incomingEventName is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.incomingEventName = null
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.incomingEventName is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.incomingEventName = '' as OrderEventName
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.incomingEventName is blank`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.incomingEventName = '      ' as OrderEventName
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.incomingEventName is not an OrderEventName`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.incomingEventName = 'mockEventName' as OrderEventName
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderCreatedEventInput.orderData edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData = undefined
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData = null
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData = {} as never
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderCreatedEventInput.orderData.orderId edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderId is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderId = undefined
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderId is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderId = null
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderId is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderId = ''
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderId is blank`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderId = '      '
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderId length < 4`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderId = '123'
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderCreatedEventInput.orderData.orderStatus edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderStatus is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderStatus = undefined
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderStatus is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderStatus = null
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderStatus is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderStatus = '' as OrderStatus
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderStatus is blank`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderStatus = '      ' as OrderStatus
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.orderStatus not an OrderStatus`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.orderStatus = 'mockOrderStatus' as OrderStatus
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderCreatedEventInput.orderData.sku edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.sku is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.sku = undefined
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.sku is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.sku = null
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.sku is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.sku = ''
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.sku is blank`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.sku = '      '
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.sku length < 4`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.sku = '123'
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderCreatedEventInput.orderData.units edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.units is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.units = undefined
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.units is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.units = null
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.units < 1`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.units = 0
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.units is not an integer`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.units = 3.45
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.units is not a number`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.units = '1' as unknown as number
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderCreatedEventInput.orderData.price edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.price is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.price = undefined
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.price is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.price = null
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.price < 0`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.price = -1
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.price is not a number`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.price = '1' as unknown as number
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderCreatedEventInput.orderData.userId edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.userId is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.userId = undefined
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.userId is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.userId = null
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.userId is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.userId = ''
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.userId is blank`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.userId = '      '
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.userId length < 4`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.userId = '123'
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderCreatedEventInput.orderData.createdAt edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.createdAt is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.createdAt = undefined
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.createdAt is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.createdAt = null
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.createdAt is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.createdAt = ''
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.createdAt is blank`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.createdAt = '      '
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.createdAt length < 4`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.createdAt = '123'
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test OrderCreatedEventInput.orderData.updatedAt edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.updatedAt is undefined`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.updatedAt = undefined
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.updatedAt is null`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.updatedAt = null
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.updatedAt is empty`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.updatedAt = ''
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.updatedAt is blank`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.updatedAt = '      '
    const testingFunc = () => OrderCreatedEvent.validateAndBuild(mockOrderCreatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      OrderCreatedEventInput.orderData.updatedAt length < 4`, () => {
    const mockOrderCreatedEventInput = buildMockOrderCreatedEventInput()
    mockOrderCreatedEventInput.orderData.updatedAt = '123'
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
        orderId: mockOrderCreatedEventInput.orderData.orderId,
        sku: mockOrderCreatedEventInput.orderData.sku,
        units: mockOrderCreatedEventInput.orderData.units,
        price: mockOrderCreatedEventInput.orderData.price,
        userId: mockOrderCreatedEventInput.orderData.userId,
      },
      createdAt: mockDate,
      updatedAt: mockDate,
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedEvent))
  })
})
