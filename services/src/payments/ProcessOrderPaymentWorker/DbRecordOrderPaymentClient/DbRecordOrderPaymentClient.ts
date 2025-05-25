import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import {
  InvalidArgumentsError,
  PaymentAlreadyAcceptedError,
  PaymentAlreadyRejectedError,
  UnrecognizedError,
} from '../../errors/AppError'
import { PaymentStatus } from '../../model/PaymentStatus'
import { RecordOrderPaymentCommand } from '../model/RecordOrderPaymentCommand'

export interface IDbRecordOrderPaymentClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {PaymentAlreadyRejectedError}
   * @throws {PaymentAlreadyAcceptedError}
   * @throws {UnrecognizedError}
   */
  recordOrderPayment: (recordOrderPaymentCommand: RecordOrderPaymentCommand) => Promise<void>
}

/**
 *
 */
export class DbRecordOrderPaymentClient implements IDbRecordOrderPaymentClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {PaymentAlreadyRejectedError}
   * @throws {PaymentAlreadyAcceptedError}
   * @throws {UnrecognizedError}
   */
  public async recordOrderPayment(recordOrderPaymentCommand: RecordOrderPaymentCommand): Promise<void> {
    const logContext = 'DbRecordOrderPaymentClient.recordOrderPayment'
    console.info(`${logContext} init:`, { recordOrderPaymentCommand })

    try {
      this.validateInput(recordOrderPaymentCommand)
      const ddbCommand = this.buildDdbCommand(recordOrderPaymentCommand)
      await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand, recordOrderPaymentCommand })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, recordOrderPaymentCommand })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(recordOrderPaymentCommand: RecordOrderPaymentCommand): void {
    const logContext = 'DbRecordOrderPaymentClient.validateInput'

    if (recordOrderPaymentCommand instanceof RecordOrderPaymentCommand === false) {
      const errorMessage = `Expected RecordOrderPaymentCommand but got ${recordOrderPaymentCommand}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, recordOrderPaymentCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(recordOrderPaymentCommand: RecordOrderPaymentCommand): UpdateCommand {
    const logContext = 'DbRecordOrderPaymentClient.buildDdbCommand'

    // Perhaps we can prevent all errors by validating the arguments, but UpdateCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.PAYMENTS_TABLE_NAME

      const { commandData } = recordOrderPaymentCommand
      const { orderId, sku, units, price, userId, createdAt, updatedAt } = commandData
      const { paymentId, paymentStatus, paymentRetries } = commandData

      const paymentPk = `PAYMENTS#ORDER_ID#${orderId}`
      const paymentSk = `ORDER_ID#${orderId}#PAYMENT`
      const paymentTn = `PAYMENTS#PAYMENT`
      const paymentSn = `PAYMENTS`
      const paymentGsi1Pk = `PAYMENTS#PAYMENT`
      const paymentGsi1Sk = `CREATED_AT#${createdAt}`

      const paymentAcceptedStatus: PaymentStatus = 'PAYMENT_ACCEPTED'
      const paymentRejectedStatus: PaymentStatus = 'PAYMENT_REJECTED'

      const ddbCommand = new UpdateCommand({
        TableName: tableName,
        Key: {
          pk: paymentPk,
          sk: paymentSk,
        },
        UpdateExpression:
          'SET ' +
          '#orderId = :orderId, ' +
          '#sku = :sku, ' +
          '#units = :units, ' +
          '#price = :price, ' +
          '#userId = :userId, ' +
          '#paymentId = :paymentId, ' +
          '#paymentStatus = :paymentStatus, ' +
          '#paymentRetries = :paymentRetries, ' +
          '#updatedAt = :updatedAt, ' +
          '#createdAt = if_not_exists(#createdAt, :createdAt), ' +
          '#_tn = :_tn, ' +
          '#_sn = :_sn, ' +
          '#gsi1pk = :gsi1pk, ' +
          '#gsi1sk = :gsi1sk',
        ExpressionAttributeNames: {
          '#orderId': 'orderId',
          '#sku': 'sku',
          '#units': 'units',
          '#price': 'price',
          '#userId': 'userId',
          '#paymentId': 'paymentId',
          '#paymentStatus': 'paymentStatus',
          '#paymentRetries': 'paymentRetries',
          '#updatedAt': 'updatedAt',
          '#createdAt': 'createdAt',
          '#_tn': '_tn',
          '#_sn': '_sn',
          '#gsi1pk': 'gsi1pk',
          '#gsi1sk': 'gsi1sk',
        },
        ExpressionAttributeValues: {
          ':orderId': orderId,
          ':sku': sku,
          ':units': units,
          ':price': price,
          ':userId': userId,
          ':paymentId': paymentId,
          ':paymentStatus': paymentStatus,
          ':paymentRetries': paymentRetries,
          ':updatedAt': updatedAt,
          ':createdAt': createdAt,
          ':_tn': paymentTn,
          ':_sn': paymentSn,
          ':gsi1pk': paymentGsi1Pk,
          ':gsi1sk': paymentGsi1Sk,
          ':paymentAcceptedStatus': paymentAcceptedStatus,
          ':paymentRejectedStatus': paymentRejectedStatus,
        },
        ConditionExpression: '#paymentStatus <> :paymentAcceptedStatus AND #paymentStatus <> :paymentRejectedStatus',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
      })
      return ddbCommand
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, recordOrderPaymentCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {PaymentAlreadyRejectedError}
   * @throws {PaymentAlreadyAcceptedError}
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: UpdateCommand): Promise<void> {
    const logContext = 'DbRecordOrderPaymentClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand })
    } catch (error) {
      // When the existing payment has already been rejected then the status is final.
      // The record must not be updated, so it throws a non-transient PaymentAlreadyRejectedError to prevent retries.
      // Although this check exists when building the RecordOrderPaymentCommand, it's repeated here
      // to catch race conditions where other events may have already rejected the payment.
      if (this.isPaymentAlreadyRejectedError(error)) {
        const paymentError = PaymentAlreadyRejectedError.from(error)
        console.error(`${logContext} exit error:`, { paymentError, ddbCommand })
        throw paymentError
      }

      // When the existing payment has already been accepted then the status is final.
      // The record must not be updated, so it throws a non-transient PaymentAlreadyAcceptedError to prevent retries.
      // Although this check exists when building the RecordOrderPaymentCommand, it's repeated here
      // to catch race conditions where other events may have already accepted the payment.
      if (this.isPaymentAlreadyAcceptedError(error)) {
        const paymentError = PaymentAlreadyAcceptedError.from(error)
        console.error(`${logContext} exit error:`, { paymentError, ddbCommand })
        throw paymentError
      }

      const unrecognizedError = UnrecognizedError.from(error)
      console.error(`${logContext} exit error:`, { unrecognizedError, ddbCommand })
      throw unrecognizedError
    }
  }

  /**
   *
   */
  private isPaymentAlreadyRejectedError(error: unknown): boolean {
    if (error instanceof ConditionalCheckFailedException) {
      const reason = error?.Item?.paymentStatus as unknown as PaymentStatus
      return reason === 'PAYMENT_REJECTED'
    }
    return false
  }

  /**
   *
   */
  private isPaymentAlreadyAcceptedError(error: unknown): boolean {
    if (error instanceof ConditionalCheckFailedException) {
      const reason = error?.Item?.paymentStatus as unknown as PaymentStatus
      return reason === 'PAYMENT_ACCEPTED'
    }
    return false
  }
}
