/* eslint-disable jsdoc/require-jsdoc */
export abstract class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly transient: boolean,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = new.target.name
    this.cause = cause
    this.transient = transient
  }
}

/*
 *
 */
export class InvalidOperationError extends AppError {
  private static readonly _defaultMessage = 'Invalid operation error.'

  public static transient(cause?: unknown, message?: string): InvalidOperationError {
    return new InvalidOperationError(message ?? this._defaultMessage, true, cause)
  }

  public static nonTransient(cause?: unknown, message?: string): InvalidOperationError {
    return new InvalidOperationError(message ?? this._defaultMessage, false, cause)
  }
}

/*
 *
 */
export class UnrecognizedError extends AppError {
  private static readonly _defaultMessage = 'Unrecognized error.'

  public static from(cause?: unknown, message?: string): UnrecognizedError {
    return new UnrecognizedError(message ?? this._defaultMessage, true, cause)
  }
}

/*
 *
 */
export class InvalidArgumentsError extends AppError {
  private static readonly _defaultMessage = 'Invalid arguments error.'

  public static from(cause?: unknown, message?: string): InvalidArgumentsError {
    return new InvalidArgumentsError(message ?? this._defaultMessage, false, cause)
  }
}

/*
 *
 */
export class DuplicateEventRaisedError extends AppError {
  private static readonly _defaultMessage = 'Duplicate event raised error.'

  public static from(cause?: unknown, message?: string): DuplicateEventRaisedError {
    return new DuplicateEventRaisedError(message ?? this._defaultMessage, false, cause)
  }
}

/*
 *
 */
export class PaymentFailedError extends AppError {
  private static readonly _defaultMessage = 'Payment failed error.'

  public static from(cause?: unknown, message?: string): PaymentFailedError {
    return new PaymentFailedError(message ?? this._defaultMessage, true, cause)
  }
}

/*
 */
export class PaymentAlreadyRejectedError extends AppError {
  private static readonly _defaultMessage = 'Payment already rejected error.'

  public static from(cause?: unknown, message?: string): PaymentAlreadyRejectedError {
    return new PaymentAlreadyRejectedError(message ?? this._defaultMessage, false, cause)
  }
}

/*
 */
export class PaymentAlreadyAcceptedError extends AppError {
  private static readonly _defaultMessage = 'Payment already accepted error.'

  public static from(cause?: unknown, message?: string): PaymentAlreadyAcceptedError {
    return new PaymentAlreadyAcceptedError(message ?? this._defaultMessage, false, cause)
  }
}

/*
 *
 */
export function isTransientError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.transient
  }
  return true
}
