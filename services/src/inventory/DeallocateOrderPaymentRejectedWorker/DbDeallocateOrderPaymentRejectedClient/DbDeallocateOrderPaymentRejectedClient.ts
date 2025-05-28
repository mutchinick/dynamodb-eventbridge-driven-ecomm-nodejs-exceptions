import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { InvalidArgumentsError, InvalidStockDeallocationError, UnrecognizedError } from '../../errors/AppError'
import { DeallocateOrderPaymentRejectedCommand } from '../model/DeallocateOrderPaymentRejectedCommand'

export interface IDbDeallocateOrderPaymentRejectedClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {InvalidStockDeallocationError}
   * @throws {UnrecognizedError}
   */
  deallocateOrderStock: (deallocateOrderPaymentRejectedCommand: DeallocateOrderPaymentRejectedCommand) => Promise<void>
}

/**
 *
 */
export class DbDeallocateOrderPaymentRejectedClient implements IDbDeallocateOrderPaymentRejectedClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {InvalidStockDeallocationError}
   * @throws {UnrecognizedError}
   */
  public async deallocateOrderStock(
    deallocateOrderPaymentRejectedCommand: DeallocateOrderPaymentRejectedCommand,
  ): Promise<void> {
    const logContext = 'DbDeallocateOrderPaymentRejectedClient.deallocateOrderStock'
    console.info(`${logContext} init:`, { deallocateOrderPaymentRejectedCommand })

    try {
      this.validateInput(deallocateOrderPaymentRejectedCommand)
      const ddbCommand = this.buildDdbCommand(deallocateOrderPaymentRejectedCommand)
      await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand, deallocateOrderPaymentRejectedCommand })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, deallocateOrderPaymentRejectedCommand })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(deallocateOrderPaymentRejectedCommand: DeallocateOrderPaymentRejectedCommand): void {
    const logContext = 'DbDeallocateOrderPaymentRejectedClient.validateInput'

    if (deallocateOrderPaymentRejectedCommand instanceof DeallocateOrderPaymentRejectedCommand === false) {
      const errorMessage = `Expected DeallocateOrderPaymentRejectedCommand but got ${deallocateOrderPaymentRejectedCommand}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, deallocateOrderPaymentRejectedCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(
    deallocateOrderPaymentRejectedCommand: DeallocateOrderPaymentRejectedCommand,
  ): TransactWriteCommand {
    const logContext = 'DbDeallocateOrderPaymentRejectedClient.buildDdbCommand'

    // Perhaps we can prevent all errors by validating the arguments, but TransactWriteCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.INVENTORY_TABLE_NAME

      const { commandData } = deallocateOrderPaymentRejectedCommand
      const { orderId, sku, units, updatedAt } = commandData
      const { allocationStatus, expectedAllocationStatus } = commandData

      const allocationPk = `INVENTORY#SKU#${sku}`
      const allocationSk = `SKU#${sku}#ORDER_ID#${orderId}#ORDER_ALLOCATION`

      const skuItemPk = `INVENTORY#SKU#${sku}`
      const skuItemSk = `SKU#${sku}`

      const ddbCommand = new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
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
            },
          },
          {
            Update: {
              TableName: tableName,
              Key: {
                pk: skuItemPk,
                sk: skuItemSk,
              },
              UpdateExpression: 'SET #units = #units + :units, #updatedAt = :updatedAt',
              ExpressionAttributeNames: {
                '#units': 'units',
                '#updatedAt': 'updatedAt',
              },
              ExpressionAttributeValues: {
                ':units': units,
                ':updatedAt': updatedAt,
              },
              ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
            },
          },
        ],
      })
      return ddbCommand
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, deallocateOrderPaymentRejectedCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidStockDeallocationError}
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: TransactWriteCommand): Promise<void> {
    const logContext = 'DbDeallocateOrderPaymentRejectedClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand })
    } catch (error) {
      if (error instanceof TransactionCanceledException) {
        const deallocationError = InvalidStockDeallocationError.from(error)
        console.error(`${logContext} exit error:`, { deallocationError, ddbCommand })
        throw deallocationError
      }

      const unrecognizedError = UnrecognizedError.from(error)
      console.error(`${logContext} exit error:`, { unrecognizedError, ddbCommand })
      throw unrecognizedError
    }
  }
}
