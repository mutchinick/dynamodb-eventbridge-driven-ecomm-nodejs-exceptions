import {
  AppError,
  DepletedStockAllocationError,
  DuplicateEventRaisedError,
  DuplicateRestockOperationError,
  DuplicateStockAllocationError,
  InvalidArgumentsError,
  InvalidOperationError,
  InvalidStockDeallocationError,
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
    expectedMessage: 'Unrecognized error.',
    expectedTransient: true,
    expectedInstance: InvalidOperationError,
  },
  {
    name: 'InvalidOperationError (non-transient)',
    from: (cause, message) => InvalidOperationError.from('non-transient', cause, message),
    expectedMessage: 'Unrecognized error.',
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
    name: 'DuplicateRestockOperationError',
    from: (cause, message) => DuplicateRestockOperationError.from(cause, message),
    expectedMessage: 'Duplicate restock operation error.',
    expectedTransient: false,
    expectedInstance: DuplicateRestockOperationError,
  },
  {
    name: 'DepletedStockAllocationError',
    from: (cause, message) => DepletedStockAllocationError.from(cause, message),
    expectedMessage: 'Depleted restock allocation error.',
    expectedTransient: false,
    expectedInstance: DepletedStockAllocationError,
  },
  {
    name: 'DuplicateStockAllocationError',
    from: (cause, message) => DuplicateStockAllocationError.from(cause, message),
    expectedMessage: 'Duplicate stock allocation error.',
    expectedTransient: false,
    expectedInstance: DuplicateStockAllocationError,
  },
  {
    name: 'InvalidStockDeallocationError',
    from: (cause, message) => InvalidStockDeallocationError.from(cause, message),
    expectedMessage: 'Invalid stock deallocation error.',
    expectedTransient: false,
    expectedInstance: InvalidStockDeallocationError,
  },
]

describe(`Warehouse Service AppError tests`, () => {
  //
  // Test AppError subclasses builder functions
  //
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

  //
  // Test isTransientError Function
  //
  describe(`Test isTransientError Function`, () => {
    it(`isTransientError returns true for transient errors`, () => {
      const err = UnrecognizedError.from()
      expect(isTransientError(err)).toBe(true)
    })

    it(`isTransientError returns false for non-transient errors`, () => {
      const err = InvalidArgumentsError.from()
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
