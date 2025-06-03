import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { InvalidArgumentsError, InvalidStockCompletionError, UnrecognizedError } from '../../errors/AppError'
import { CompleteOrderPaymentAcceptedCommand } from '../model/CompleteOrderPaymentAcceptedCommand'

export interface IDbCompleteOrderPaymentAcceptedClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {InvalidStockCompletionError}
   * @throws {UnrecognizedError}
   */
  completeOrder: (completeOrderPaymentAcceptedCommand: CompleteOrderPaymentAcceptedCommand) => Promise<void>
}

/**
 *
 */
export class DbCompleteOrderPaymentAcceptedClient implements IDbCompleteOrderPaymentAcceptedClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {InvalidStockCompletionError}
   * @throws {UnrecognizedError}
   */
  public async completeOrder(completeOrderPaymentAcceptedCommand: CompleteOrderPaymentAcceptedCommand): Promise<void> {
    const logContext = 'DbCompleteOrderPaymentAcceptedClient.completeOrder'
    console.info(`${logContext} init:`, { completeOrderPaymentAcceptedCommand })

    try {
      this.validateInput(completeOrderPaymentAcceptedCommand)
      const ddbCommand = this.buildDdbCommand(completeOrderPaymentAcceptedCommand)
      await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand, completeOrderPaymentAcceptedCommand })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, completeOrderPaymentAcceptedCommand })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(completeOrderPaymentAcceptedCommand: CompleteOrderPaymentAcceptedCommand): void {
    const logContext = 'DbCompleteOrderPaymentAcceptedClient.validateInput'

    if (completeOrderPaymentAcceptedCommand instanceof CompleteOrderPaymentAcceptedCommand === false) {
      const errorMessage = `Expected CompleteOrderPaymentAcceptedCommand but got ${completeOrderPaymentAcceptedCommand}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, completeOrderPaymentAcceptedCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(completeOrderPaymentAcceptedCommand: CompleteOrderPaymentAcceptedCommand): UpdateCommand {
    const logContext = 'DbCompleteOrderPaymentAcceptedClient.buildDdbCommand'

    // Perhaps we can prevent all errors by validating the arguments, but UpdateCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.INVENTORY_TABLE_NAME

      const { commandData } = completeOrderPaymentAcceptedCommand
      const { orderId, sku, units, updatedAt } = commandData
      const { allocationStatus, expectedAllocationStatus } = commandData

      const allocationPk = `INVENTORY#SKU#${sku}`
      const allocationSk = `SKU#${sku}#ORDER_ID#${orderId}#ORDER_ALLOCATION`

      const ddbCommand = new UpdateCommand({
        TableName: tableName,
        Key: {
          pk: allocationPk,
          sk: allocationSk,
        },
        UpdateExpression: 'SET #allocationStatus = :newAllocationStatus, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#orderId': 'orderId',
          '#sku': 'sku',
          '#units': 'units',
          '#updatedAt': 'updatedAt',
          '#allocationStatus': 'allocationStatus',
        },
        ExpressionAttributeValues: {
          ':orderId': orderId,
          ':sku': sku,
          ':units': units,
          ':updatedAt': updatedAt,
          ':newAllocationStatus': allocationStatus,
          ':expectedAllocationStatus': expectedAllocationStatus,
        },
        ConditionExpression:
          'attribute_exists(pk) AND ' +
          'attribute_exists(sk) AND ' +
          '#orderId = :orderId AND ' +
          '#sku = :sku AND ' +
          '#units = :units AND ' +
          '#allocationStatus = :expectedAllocationStatus',
      })
      return ddbCommand
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, completeOrderPaymentAcceptedCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidStockCompletionError}
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: UpdateCommand): Promise<void> {
    const logContext = 'DbCompleteOrderPaymentAcceptedClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand })
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        const completionError = InvalidStockCompletionError.from(error)
        console.error(`${logContext} exit error:`, { completionError, ddbCommand })
        throw completionError
      }

      const unrecognizedError = UnrecognizedError.from(error)
      console.error(`${logContext} exit error:`, { unrecognizedError, ddbCommand })
      throw unrecognizedError
    }
  }
}
