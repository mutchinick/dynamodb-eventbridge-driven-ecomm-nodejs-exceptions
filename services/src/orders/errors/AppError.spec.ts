// Review error handling
import {
  AppError,
  DuplicateEventRaisedError,
  ForbiddenOrderStatusTransitionError,
  InvalidArgumentsError,
  InvalidOperationError,
  NotFoundOrderStatusTransitionError,
  NotReadyOrderStatusTransitionError,
  RedundantOrderStatusTransitionError,
  UnrecognizedError,
  isTransientError,
} from './AppError'

type ErrorTestCase<T extends AppError> = {
  name: string
  from: (cause?: unknown, message?: string) => T
  expectedMessage: string
  expectedTransient: boolean
  expectedInstance: new (message: string, transient: boolean, cause?: unknown) => T
}

const testCases: ErrorTestCase<AppError>[] = [
  {
    name: 'InvalidOperationError (transient)',
    from: (cause, message) => InvalidOperationError.from('transient', cause, message),
    expectedMessage: 'Invalid operation error.',
    expectedTransient: true,
    expectedInstance: InvalidOperationError,
  },
  {
    name: 'InvalidOperationError (non-transient)',
    from: (cause, message) => InvalidOperationError.from('non_transient', cause, message),
    expectedMessage: 'Invalid operation error.',
    expectedTransient: false,
    expectedInstance: InvalidOperationError,
  },
  {
    name: 'UnrecognizedError',
    from: (cause, message) => UnrecognizedError.from(cause, message),
    expectedMessage: 'Unrecognized error.',
    expectedTransient: true,
    expectedInstance: UnrecognizedError,
  },
  {
    name: 'InvalidArgumentsError',
    from: (cause, message) => InvalidArgumentsError.from(cause, message),
    expectedMessage: 'Invalid arguments error.',
    expectedTransient: false,
    expectedInstance: InvalidArgumentsError,
  },
  {
    name: 'DuplicateEventRaisedError',
    from: (cause, message) => DuplicateEventRaisedError.from(cause, message),
    expectedMessage: 'Duplicate event raise operation error.',
    expectedTransient: false,
    expectedInstance: DuplicateEventRaisedError,
  },
  {
    name: 'RedundantOrderStatusTransitionError',
    from: (cause, message) => RedundantOrderStatusTransitionError.from(cause, message),
    expectedMessage: 'Redundant order status transition error.',
    expectedTransient: false,
    expectedInstance: RedundantOrderStatusTransitionError,
  },
  {
    name: 'NotFoundOrderStatusTransitionError',
    from: (cause, message) => NotFoundOrderStatusTransitionError.from(cause, message),
    expectedMessage: 'Not found order status transition error.',
    expectedTransient: false,
    expectedInstance: NotFoundOrderStatusTransitionError,
  },
  {
    name: 'NotReadyOrderStatusTransitionError',
    from: (cause, message) => NotReadyOrderStatusTransitionError.from(cause, message),
    expectedMessage: 'Not ready order status transition error.',
    expectedTransient: true,
    expectedInstance: NotReadyOrderStatusTransitionError,
  },
  {
    name: 'ForbiddenOrderStatusTransitionError',
    from: (cause, message) => ForbiddenOrderStatusTransitionError.from(cause, message),
    expectedMessage: 'Forbidden order status transition error.',
    expectedTransient: false,
    expectedInstance: ForbiddenOrderStatusTransitionError,
  },
]

describe(`Orders Service AppError tests`, () => {
  //
  // Test AppError subclasses builder functions
  //
  describe.each(
    testCases.map((testCase) => [
      testCase.name,
      testCase.from,
      testCase.expectedMessage,
      testCase.expectedTransient,
      testCase.expectedInstance,
    ]),
  )(
    'Test AppError subclasses builder functions',
    (name, from, expectedMessage, expectedTransient, expectedInstance) => {
      it(`${name} is an instance of ${expectedInstance.name}`, () => {
        const err = from()
        expect(err).toBeInstanceOf(expectedInstance)
      })

      it(`${name} is an instance of AppError`, () => {
        const err = from()
        expect(err).toBeInstanceOf(AppError)
      })

      it(`${name} has the expected default message: "${expectedMessage}"`, () => {
        const err = from()
        expect(err.message).toBe(expectedMessage)
      })

      it(`${name} is ${expectedTransient ? 'transient' : 'non-transient'}`, () => {
        const err = from()
        expect(err.transient).toBe(expectedTransient)
      })

      it(`${name} stores expected custom message`, () => {
        const customMessage = 'Mock message'
        const errWithCustomMessage = from(undefined, customMessage)
        expect(errWithCustomMessage.message).toBe(customMessage)
      })

      it(`${name} stores expected cause`, () => {
        const cause = new Error('Root cause')
        const errWithCause = from(cause)
        expect(errWithCause.cause).toBe(cause)
      })
    },
  )

  //
  // Test isTransientError Function
  //
  describe('Test isTransientError Function', () => {
    it('isTransientError returns true for transient errors', () => {
      const err = UnrecognizedError.from()
      expect(isTransientError(err)).toBe(true)
    })

    it('isTransientError returns false for non-transient errors', () => {
      const err = InvalidArgumentsError.from()
      expect(isTransientError(err)).toBe(false)
    })

    it('isTransientError returns true for non-AppError values (defaulting to transient)', () => {
      expect(isTransientError('Mock error')).toBe(true)
      expect(isTransientError(undefined)).toBe(true)
      expect(isTransientError(null)).toBe(true)
      expect(isTransientError(new Error('Mock error'))).toBe(true)
    })
  })
})
