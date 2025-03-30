import { InvalidArgumentsError } from '../../errors/AppError'
import {
  IncomingSimulateRawEventRequest,
  IncomingSimulateRawEventRequestInput,
} from './IncomingSimulateRawEventRequest'

function buildMockIncomingSimulateRawEventRequestInput(): IncomingSimulateRawEventRequestInput {
  const mockValidRequestInput: IncomingSimulateRawEventRequestInput = {
    pk: 'mockPk',
    sk: 'mockSk',
    eventName: 'mockEventName',
    eventData: {},
    createdAt: 'mockCreatedAt',
    updatedAt: 'mockUpdatedAt',
  }
  return mockValidRequestInput
}

describe(`Testing Service SimulateRawEventApi IncomingSimulateRawEventRequest tests`, () => {
  //
  // Test IncomingSimulateRawEventRequestInput edge cases
  //
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

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput is invalid`, () => {
    const mockIncomingSimulateRawEventRequestInput = 'mockInvalidValue' as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test IncomingSimulateRawEventRequestInput.pk edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.pk is missing`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    delete mockIncomingSimulateRawEventRequestInput.pk
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

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

  //
  // Test IncomingSimulateRawEventRequestInput.sk edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.sk is missing`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    delete mockIncomingSimulateRawEventRequestInput.sk
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

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

  //
  // Test IncomingSimulateRawEventRequestInput.eventName edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.eventName is missing`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    delete mockIncomingSimulateRawEventRequestInput.eventName
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

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

  //
  // Test IncomingSimulateRawEventRequestInput.createdAt edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.createdAt is null`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.createdAt = null as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.createdAt not a string`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.createdAt = 123456 as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test IncomingSimulateRawEventRequestInput.updatedAt edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.updatedAt is null`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.updatedAt = null as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingSimulateRawEventRequestInput.updatedAt not a string`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    mockIncomingSimulateRawEventRequestInput.updatedAt = 123456 as never
    const testingFunc = () => IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test expected results
  //
  it(`returns the expected IncomingSimulateRawEventRequest with the expected data`, () => {
    const mockIncomingSimulateRawEventRequestInput = buildMockIncomingSimulateRawEventRequestInput()
    const result = IncomingSimulateRawEventRequest.validateAndBuild(mockIncomingSimulateRawEventRequestInput)
    const expectedRequest: IncomingSimulateRawEventRequest = {
      pk: mockIncomingSimulateRawEventRequestInput.pk,
      sk: mockIncomingSimulateRawEventRequestInput.sk,
      eventName: mockIncomingSimulateRawEventRequestInput.eventName,
      eventData: {},
      createdAt: mockIncomingSimulateRawEventRequestInput.createdAt,
      updatedAt: mockIncomingSimulateRawEventRequestInput.updatedAt,
    }
    expect(result).toMatchObject(expectedRequest)
  })
})
