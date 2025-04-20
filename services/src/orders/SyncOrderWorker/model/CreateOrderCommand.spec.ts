import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { CreateOrderCommand, CreateOrderCommandInput } from './CreateOrderCommand'
import { IncomingOrderEvent } from './IncomingOrderEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()
const mockEventName = OrderEventName.ORDER_PLACED_EVENT
const mockOrderId = 'mockOrderId'
const mockSku = 'mockSku'
const mockUnits = 12
const mockPrice = 149.99
const mockUserId = 'mockUserId'
const mockCreatedAt = mockDate
const mockUpdatedAt = mockDate

function buildMockIncomingOrderEvent() {
  const mockValidEvent: TypeUtilsMutable<IncomingOrderEvent> = {
    eventName: mockEventName,
    eventData: {
      orderId: mockOrderId,
      sku: mockSku,
      units: mockUnits,
      price: mockPrice,
      userId: mockUserId,
    },
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
  }
  return mockValidEvent
}

function buildMockCreateOrderCommandInput() {
  const mockValidInput: TypeUtilsMutable<CreateOrderCommandInput> = {
    incomingOrderEvent: buildMockIncomingOrderEvent(),
  }
  return mockValidInput
}

describe(`Orders Service SyncOrderWorker CreateOrderCommand tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test CreateOrderCommandInput edge cases
   ************************************************************/
  it(`does not throw if the input CreateOrderCommandInput is valid`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    expect(() => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput is undefined`, () => {
    const mockCreateOrderCommandInput: CreateOrderCommandInput = undefined
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput is null`, () => {
    const mockCreateOrderCommandInput: CreateOrderCommandInput = null
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test CreateOrderCommandInput.incomingOrderEvent.eventName edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventName is undefined`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventName = undefined
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventName is null`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventName = null
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventName is empty`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventName = '' as OrderEventName
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventName is blank`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventName = '      ' as OrderEventName
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventName is not an IncomingOrderEventName`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventName = 'mockOrderEventName' as OrderEventName
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it.each(Object.values(OrderEventName).filter((en) => en !== OrderEventName.ORDER_PLACED_EVENT))(
    `throws a non-transient InvalidArgumentsError if the input
      CreateOrderCommandInput.incomingOrderEvent.eventName is %s and not OrderEventName.ORDER_PLACED_EVENT`,
    (testEventName) => {
      const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
      mockCreateOrderCommandInput.incomingOrderEvent.eventName = testEventName
      const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
      expect(testingFunc).toThrow(InvalidArgumentsError)
      expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
    },
  )

  /*
   *
   *
   ************************************************************
   * Test CreateOrderCommandInput.incomingOrderEvent.createdAt edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.createdAt is undefined`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.createdAt = undefined
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.createdAt is null`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.createdAt = null
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.createdAt is empty`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.createdAt = ''
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.createdAt is blank`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.createdAt = '      '
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.createdAt length < 4`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.createdAt = '123'
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test CreateOrderCommandInput.incomingOrderEvent.updatedAt edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.updatedAt is undefined`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.updatedAt = undefined
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.updatedAt is null`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.updatedAt = null
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.updatedAt is empty`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.updatedAt = ''
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.updatedAt is blank`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.updatedAt = '      '
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.updatedAt length < 4`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.updatedAt = '123'
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test CreateOrderCommandInput.incomingOrderEvent.eventData edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData is undefined`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData = undefined
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData is null`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData = null
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData is empty`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData = {} as never
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test CreateOrderCommandInput.incomingOrderEvent.eventData.orderId edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.orderId is undefined`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.orderId = undefined
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.orderId is null`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.orderId = null
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.orderId is empty`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.orderId = ''
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.orderId is blank`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.orderId = '      '
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.orderId length < 4`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.orderId = '123'
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test CreateOrderCommandInput.incomingOrderEvent.eventData.sku edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.sku is undefined`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.sku = undefined
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.sku is null`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.sku = null
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.sku is empty`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.sku = ''
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.sku is blank`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.sku = '      '
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.sku length < 4`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.sku = '123'
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test CreateOrderCommandInput.incomingOrderEvent.eventData.units edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.units is undefined`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.units = undefined
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.units is null`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.units = null
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.units < 1`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.units = 0
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.units is not an integer`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.units = 3.45
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.units is not a number`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.units = '1' as unknown as number
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test CreateOrderCommandInput.incomingOrderEvent.eventData.price edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.price is undefined`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.price = undefined
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.price is null`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.price = null
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.price < 0`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.price = -1
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.price is not a number`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.price = '1' as unknown as number
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test CreateOrderCommandInput.incomingOrderEvent.eventData.userId edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.userId is undefined`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.userId = undefined
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.userId is null`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.userId = null
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.userId is empty`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.userId = ''
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.userId is blank`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.userId = '      '
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input CreateOrderCommandInput.incomingOrderEvent.eventData.userId length < 4`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    mockCreateOrderCommandInput.incomingOrderEvent.eventData.userId = '123'
    const testingFunc = () => CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected CreateOrderCommand if the execution path is successful`, () => {
    const mockCreateOrderCommandInput = buildMockCreateOrderCommandInput()
    const result = CreateOrderCommand.validateAndBuild(mockCreateOrderCommandInput)
    const expectedCommand: CreateOrderCommand = {
      commandData: {
        orderId: mockCreateOrderCommandInput.incomingOrderEvent.eventData.orderId,
        orderStatus: OrderStatus.ORDER_CREATED_STATUS,
        sku: mockCreateOrderCommandInput.incomingOrderEvent.eventData.sku,
        units: mockCreateOrderCommandInput.incomingOrderEvent.eventData.units,
        price: mockCreateOrderCommandInput.incomingOrderEvent.eventData.price,
        userId: mockCreateOrderCommandInput.incomingOrderEvent.eventData.userId,
        createdAt: mockDate,
        updatedAt: mockDate,
      },
      options: {},
    }
    expect(result).toStrictEqual(expect.objectContaining(expectedCommand))
  })
})
