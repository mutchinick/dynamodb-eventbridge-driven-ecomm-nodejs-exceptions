import { InvalidArgumentsError } from '../../errors/AppError'
import {
  IncomingSimulateRawEventRequest,
  IncomingSimulateRawEventRequestInput,
} from './IncomingSimulateRawEventRequest'

const mockPk = 'mockPk'
const mockSk = 'mockSk'
const mockEventName = 'mockEventName'
const mockEventData = {}
const mockCreatedAt = 'mockCreatedAt'
const mockUpdatedAt = 'mockUpdatedAt'

function buildMockIncomingSimulateRawEventRequestInput(): IncomingSimulateRawEventRequestInput {
  const mockValidRequestInput: IncomingSimulateRawEventRequestInput = {
    pk: mockPk,
    sk: mockSk,
    eventName: mockEventName,
    eventData: mockEventData,
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
  }
  return mockValidRequestInput
}

describe(`Testing Service SimulateRawEventApi IncomingSimulateRawEventRequest tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingSimulateRawEventRequestInput edge cases
   ************************************************************/
  it(`does not throw if the input IncomingSimulateRawEventRequestInput is valid`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    expect(() =>
      IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput),
    ).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput is undefined`, () => {
    const mockIncomingSimulateRawEventRequestInput = undefined as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput is null`, () => {
    const mockIncomingSimulateRawEventRequestInput = null as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSimulateRawEventRequestInput.pk edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.pk is undefined`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.pk = undefined as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.pk is null`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.pk = null as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.pk is empty`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.pk = '' as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.pk is blank`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.pk = '      ' as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.pk is not a string`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.pk = 123456 as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSimulateRawEventRequestInput.sk edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.sk is undefined`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.sk = undefined as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.sk is null`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.sk = null as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.sk is empty`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.sk = '' as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.sk is blank`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.sk = '      ' as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.sk is not a string`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.sk = 123456 as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSimulateRawEventRequestInput.eventName edge cases
   ************************************************************/
  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.eventName is undefined`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.eventName = undefined as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.eventName is null`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.eventName = null as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.eventName is empty`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.eventName = '' as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.eventName is blank`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.eventName = '      ' as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.eventName is not a string`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.eventName = 123456 as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSimulateRawEventRequestInput.createdAt edge cases
   ************************************************************/
  it(`does not throw if the input IncomingSimulateRawEventRequestInput.createdAt is
      undefined`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.createdAt = undefined as never
    expect(() =>
      IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput),
    ).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.createdAt is null`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.createdAt = null as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`does not throw if the input IncomingSimulateRawEventRequestInput.createdAt is
      empty`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.createdAt = '' as never
    expect(() =>
      IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput),
    ).not.toThrow()
  })

  it(`does not throw if the input IncomingSimulateRawEventRequestInput.createdAt is
      blank`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.createdAt = '      ' as never
    expect(() =>
      IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput),
    ).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.createdAt is not a string`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.createdAt = 123456 as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSimulateRawEventRequestInput.updatedAt edge cases
   ************************************************************/
  it(`does not throw if the input IncomingSimulateRawEventRequestInput.updatedAt is
      undefined`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.updatedAt = undefined as never
    expect(() =>
      IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput),
    ).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.updatedAt is null`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.updatedAt = null as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`does not throw if the input IncomingSimulateRawEventRequestInput.updatedAt is
      empty`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.updatedAt = '' as never
    expect(() =>
      IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput),
    ).not.toThrow()
  })

  it(`does not throw if the input IncomingSimulateRawEventRequestInput.updatedAt is
      blank`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.updatedAt = '      ' as never
    expect(() =>
      IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput),
    ).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.updatedAt is not a string`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.updatedAt = 123456 as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected IncomingSimulateRawEventRequest if the execution path is
      successful`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    const expectedRequest: IncomingSimulateRawEventRequest = {
      pk: mockIncomingSimulateRawEventRequestInput.pk,
      sk: mockIncomingSimulateRawEventRequestInput.sk,
      eventName: mockIncomingSimulateRawEventRequestInput.eventName,
      eventData: mockIncomingSimulateRawEventRequestInput.eventData,
      createdAt: mockIncomingSimulateRawEventRequestInput.createdAt,
      updatedAt: mockIncomingSimulateRawEventRequestInput.updatedAt,
    }
    expect(result).toMatchObject(expectedRequest)
  })
})
