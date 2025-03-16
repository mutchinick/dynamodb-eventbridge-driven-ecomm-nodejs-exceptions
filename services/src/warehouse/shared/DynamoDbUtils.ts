import { ConditionalCheckFailedException, TransactionCanceledException } from '@aws-sdk/client-dynamodb'

/**
 *
 */
export class DynamoDbUtils {
  /**
   *
   */
  public static getTransactionCancellationCode(error: unknown, n: number): string {
    if (error instanceof TransactionCanceledException) {
      return error.CancellationReasons?.[n]?.Code || null
    }
    return null
  }

  /**
   *
   */
  public static isConditionalCheckFailedException(error: unknown): error is ConditionalCheckFailedException {
    if (error instanceof ConditionalCheckFailedException) {
      return true
    }
    return false
  }
}
