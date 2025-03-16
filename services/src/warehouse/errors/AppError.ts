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
  private static readonly _defaultMessage = 'Unrecognized error.'

  public static from(
    transitivity: 'transient' | 'non-transient',
    cause?: unknown,
    message?: string,
  ): InvalidOperationError {
    return new InvalidOperationError(message ?? this._defaultMessage, transitivity === 'transient', cause)
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

  public static from(cause?: unknown, message?: string): UnrecognizedError {
    return new InvalidArgumentsError(message ?? this._defaultMessage, false, cause)
  }
}

/*
 *
 */
export class DuplicateEventRaisedError extends AppError {
  private static readonly _defaultMessage = 'Duplicate event raise operation error.'

  public static from(cause?: unknown, message?: string): UnrecognizedError {
    return new DuplicateEventRaisedError(message ?? this._defaultMessage, false, cause)
  }
}

/*
 *
 */
export class DuplicateRestockOperationError extends AppError {
  private static readonly _defaultMessage = 'Duplicate restock operation error.'

  public static from(cause?: unknown, message?: string): DuplicateRestockOperationError {
    return new DuplicateRestockOperationError(message ?? this._defaultMessage, false, cause)
  }
}

/*
 *
 */
export class DepletedStockAllocationError extends AppError {
  private static readonly _defaultMessage = 'Depleted restock operation error.'

  public static from(cause?: unknown, message?: string): DepletedStockAllocationError {
    return new DepletedStockAllocationError(message ?? this._defaultMessage, false, cause)
  }
}

/*
 *
 */
export class DuplicateStockAllocationError extends AppError {
  private static readonly _defaultMessage = 'Duplicate stock allocation operation error.'

  public static from(cause?: unknown, message?: string): DuplicateStockAllocationError {
    return new DuplicateStockAllocationError(message ?? this._defaultMessage, false, cause)
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

/*
 *
 */
export type Result<T, E extends AppError = never> = E extends never ? T : T & { __throws?: E }
export type AsyncResult<T, E extends AppError = never> = Promise<Result<T, E extends never ? never : E>>
