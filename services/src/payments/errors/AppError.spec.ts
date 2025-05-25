import {
  AppError,
  DuplicateEventRaisedError,
  InvalidArgumentsError,
  InvalidOperationError,
  PaymentAlreadyAcceptedError,
  PaymentAlreadyRejectedError,
  PaymentFailedError,
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
    from: (cause, message) => InvalidOperationError.transient(cause, message),
    expectedMessage: 'Invalid operation error.',
    expectedTransient: true,
    expectedInstance: InvalidOperationError,
  },
  {
    name: 'InvalidOperationError (non-transient)',
    from: (cause, message) => InvalidOperationError.nonTransient(cause, message),
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
    expectedMessage: 'Duplicate event raised error.',
    expectedTransient: false,
    expectedInstance: DuplicateEventRaisedError,
  },
  {
    name: 'PaymentFailedError',
    from: (cause, message) => PaymentFailedError.from(cause, message),
    expectedMessage: 'Payment failed error.',
    expectedTransient: true,
    expectedInstance: PaymentFailedError,
  },
  {
    name: 'PaymentAlreadyRejectedError',
    from: (cause, message) => PaymentAlreadyRejectedError.from(cause, message),
    expectedMessage: 'Payment already rejected error.',
    expectedTransient: false,
    expectedInstance: PaymentAlreadyRejectedError,
  },
  {
    name: 'PaymentAlreadyAcceptedError',
    from: (cause, message) => PaymentAlreadyAcceptedError.from(cause, message),
    expectedMessage: 'Payment already accepted error.',
    expectedTransient: false,
    expectedInstance: PaymentAlreadyAcceptedError,
  },
]

describe(`Payments Service AppError tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test AppError subclasses builder functions
   ************************************************************/
  describe(`Test AppError subclasses builder functions`, () => {
    testCases.forEach(({ name, from, expectedMessage, expectedTransient, expectedInstance }) => {
      describe(name, () => {
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

        it(`${name} sets expected custom message`, () => {
          const customMessage = 'Mock message'
          const errWithCustomMessage = from(undefined, customMessage)
          expect(errWithCustomMessage.message).toBe(customMessage)
        })

        it(`${name} sets expected cause`, () => {
          const cause = new Error('Root cause')
          const errWithCause = from(cause)
          expect(errWithCause.cause).toBe(cause)
        })
      })
    })
  })

  /*
   *
   *
   ************************************************************
   * Test isTransientError Function
   ************************************************************/
  describe(`Test isTransientError Function`, () => {
    it(`isTransientError returns true for transient errors`, () => {
      const err = InvalidOperationError.transient()
      expect(isTransientError(err)).toBe(true)
    })

    it(`isTransientError returns false for non-transient errors`, () => {
      const err = InvalidOperationError.nonTransient()
      expect(isTransientError(err)).toBe(false)
    })

    it(`isTransientError returns true for non-AppError values (defaulting to transient)`, () => {
      expect(isTransientError('Mock error')).toBe(true)
      expect(isTransientError(undefined)).toBe(true)
      expect(isTransientError(null)).toBe(true)
      expect(isTransientError(new Error('Mock error'))).toBe(true)
    })
  })
})
