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
  private static readonly _defaultMessage = 'Duplicate event raise operation error.'

  public static from(cause?: unknown, message?: string): DuplicateEventRaisedError {
    return new DuplicateEventRaisedError(message ?? this._defaultMessage, false, cause)
  }
}

/*
 *
 */
export class RedundantOrderStatusTransitionError extends AppError {
  private static readonly _defaultMessage = 'Redundant order status transition error.'

  public static from(cause?: unknown, message?: string): RedundantOrderStatusTransitionError {
    return new RedundantOrderStatusTransitionError(message ?? this._defaultMessage, false, cause)
  }
}

/*
 *
 */
export class NotFoundOrderStatusTransitionError extends AppError {
  private static readonly _defaultMessage = 'Not found order status transition error.'

  public static from(cause?: unknown, message?: string): NotFoundOrderStatusTransitionError {
    return new NotFoundOrderStatusTransitionError(message ?? this._defaultMessage, false, cause)
  }
}

/*
 *
 */
export class NotReadyOrderStatusTransitionError extends AppError {
  private static readonly _defaultMessage = 'Not ready order status transition error.'

  public static from(cause?: unknown, message?: string): NotReadyOrderStatusTransitionError {
    return new NotReadyOrderStatusTransitionError(message ?? this._defaultMessage, true, cause)
  }
}

/*
 *
 */
export class ForbiddenOrderStatusTransitionError extends AppError {
  private static readonly _defaultMessage = 'Forbidden order status transition error.'

  public static from(cause?: unknown, message?: string): ForbiddenOrderStatusTransitionError {
    return new ForbiddenOrderStatusTransitionError(message ?? this._defaultMessage, false, cause)
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
