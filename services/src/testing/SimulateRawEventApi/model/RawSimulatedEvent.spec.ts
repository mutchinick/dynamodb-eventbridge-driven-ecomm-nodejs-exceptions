import { InvalidArgumentsError } from '../../errors/AppError'
import { RawSimulatedEvent, RawSimulatedEventInput } from './RawSimulatedEvent'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockRawSimulatedEventInput() {
  const mockValidInput: RawSimulatedEventInput = {
    pk: 'mockPk',
    sk: 'mockSk',
    eventName: 'mockEventName',
    eventData: 'mockEventData',
    createdAt: mockDate,
    updatedAt: mockDate,
  }
  return mockValidInput
}

describe(`Testing Service SimulateRawEventApi RawSimulatedEvent tests`, () => {
  //
  // Test RawSimulatedEventData edge cases
  //
  it(`does not throw if the input RawSimulatedEventInput is valid`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    expect(() => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)).not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEventInput is undefined`, () => {
    const mockRawSimulatedEventInput = undefined as unknown as RawSimulatedEventInput
    const testingFunc = () => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEventInput is null`, () => {
    const mockRawSimulatedEventInput = null as unknown as RawSimulatedEventInput
    const testingFunc = () => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test RawSimulatedEventData.pk edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEventInput.pk is missing`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    delete mockRawSimulatedEventInput.pk
    const testingFunc = () => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEventInput.pk is undefined`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.pk = undefined
    const testingFunc = () => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEventInput.pk is null`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.pk = null
    const testingFunc = () => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEventInput.pk is empty`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.pk = ''
    const testingFunc = () => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEventInput.pk is blank`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.pk = '      '
    const testingFunc = () => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test RawSimulatedEventData.sk edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEventInput.sk is missing`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    delete mockRawSimulatedEventInput.sk
    const testingFunc = () => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEventInput.sk is undefined`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.sk = undefined
    const testingFunc = () => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEventInput.sk is null`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.sk = null
    const testingFunc = () => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEventInput.sk is empty`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.sk = ''
    const testingFunc = () => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEventInput.sk is blank`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.sk = '      '
    const testingFunc = () => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test RawSimulatedEventData.eventName edge cases
  //
  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEventInput.eventName is missing`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    delete mockRawSimulatedEventInput.eventName
    const testingFunc = () => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEventInput.eventName is undefined`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.eventName = undefined
    const testingFunc = () => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEventInput.eventName is null`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.eventName = null
    const testingFunc = () => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEventInput.eventName is empty`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.eventName = ''
    const testingFunc = () => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input RawSimulatedEventInput.eventName is blank`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.eventName = '      '
    const testingFunc = () => RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(testingFunc).toThrow(InvalidArgumentsError)
    expect(testingFunc).toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test RawSimulatedEventData.createdAt edge cases
  //
  it(`sets the current RawSimulatedEventInput.createdAt to the current date if it is missing`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    delete mockRawSimulatedEventInput.createdAt
    const simulateRawEvent = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(simulateRawEvent.createdAt).toBe(mockDate)
  })

  it(`sets the current RawSimulatedEventInput.createdAt to the current date if it is undefined`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.createdAt = undefined
    const simulateRawEvent = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(simulateRawEvent.createdAt).toBe(mockDate)
  })

  it(`sets the current RawSimulatedEventInput.createdAt to the current date if it is empty`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.createdAt = ''
    const simulateRawEvent = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(simulateRawEvent.createdAt).toBe(mockDate)
  })

  it(`sets the current RawSimulatedEventInput.createdAt to the current date if it is blank`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.createdAt = '      '
    const simulateRawEvent = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(simulateRawEvent.createdAt).toBe(mockDate)
  })

  //
  // Test RawSimulatedEventData.updatedAt edge cases
  //
  it(`sets the current RawSimulatedEventInput.updatedAt to the current date if it is missing`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    delete mockRawSimulatedEventInput.updatedAt
    const simulateRawEvent = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(simulateRawEvent.updatedAt).toBe(mockDate)
  })

  it(`sets the current RawSimulatedEventInput.updatedAt to the current date if it is undefined`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.updatedAt = undefined
    const simulateRawEvent = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(simulateRawEvent.updatedAt).toBe(mockDate)
  })

  it(`sets the current RawSimulatedEventInput.updatedAt to the current date if it is empty`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.updatedAt = ''
    const simulateRawEvent = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(simulateRawEvent.updatedAt).toBe(mockDate)
  })

  it(`sets the current RawSimulatedEventInput.updatedAt to the current date if it is blank`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    mockRawSimulatedEventInput.updatedAt = '      '
    const simulateRawEvent = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    expect(simulateRawEvent.updatedAt).toBe(mockDate)
  })

  //
  // Test expected results
  //
  it(`returns the expected RawSimulatedEvent with the expected data`, () => {
    const mockRawSimulatedEventInput = buildMockRawSimulatedEventInput()
    const rawSimulatedEvent = RawSimulatedEvent.validateAndBuild(mockRawSimulatedEventInput)
    const expectedResult: RawSimulatedEvent = {
      pk: mockRawSimulatedEventInput.pk,
      sk: mockRawSimulatedEventInput.sk,
      eventName: mockRawSimulatedEventInput.eventName,
      eventData: mockRawSimulatedEventInput.eventData,
      createdAt: mockRawSimulatedEventInput.createdAt,
      updatedAt: mockRawSimulatedEventInput.updatedAt,
      _tn: '#EVENT',
    }
    expect(rawSimulatedEvent).toMatchObject(expectedResult)
  })
})
