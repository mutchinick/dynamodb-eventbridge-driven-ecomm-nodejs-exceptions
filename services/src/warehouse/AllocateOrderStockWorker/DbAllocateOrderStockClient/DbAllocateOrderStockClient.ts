import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import {
  DepletedStockAllocationError,
  DuplicateStockAllocationError,
  InvalidArgumentsError,
  UnrecognizedError,
} from '../../errors/AppError'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { AllocateOrderStockCommand } from '../model/AllocateOrderStockCommand'

export interface IDbAllocateOrderStockClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateStockAllocationError}
   * @throws {DepletedStockAllocationError}
   * @throws {UnrecognizedError}
   */
  allocateOrderStock: (allocateOrderStockCommand: AllocateOrderStockCommand) => Promise<void>
}

/**
 *
 */
export class DbAllocateOrderStockClient implements IDbAllocateOrderStockClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateStockAllocationError}
   * @throws {DepletedStockAllocationError}
   * @throws {UnrecognizedError}
   */
  public async allocateOrderStock(allocateOrderStockCommand: AllocateOrderStockCommand): Promise<void> {
    const logContext = 'DbAllocateOrderStockClient.allocateOrderStock'
    console.info(`${logContext} init:`, { allocateOrderStockCommand })

    try {
      this.validateInput(allocateOrderStockCommand)
      const ddbCommand = this.buildDdbCommand(allocateOrderStockCommand)
      await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand, allocateOrderStockCommand })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, allocateOrderStockCommand })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(allocateOrderStockCommand: AllocateOrderStockCommand): void {
    const logContext = 'DbAllocateOrderStockClient.validateInput'

    if (allocateOrderStockCommand instanceof AllocateOrderStockCommand === false) {
      const errorMessage = `Expected AllocateOrderStockCommand but got ${allocateOrderStockCommand}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, allocateOrderStockCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(allocateOrderStockCommand: AllocateOrderStockCommand): TransactWriteCommand {
    const logContext = 'DbAllocateOrderStockClient.buildDdbCommand'

    try {
      const tableName = process.env.WAREHOUSE_TABLE_NAME

      const { allocateOrderStockData } = allocateOrderStockCommand
      const { orderId, sku, units, price, userId, createdAt, updatedAt } = allocateOrderStockData

      const allocationPk = `WAREHOUSE#SKU#${sku}`
      const allocationSk = `SKU#${sku}#ORDER_ID#${orderId}#ALLOCATION`
      const allocationTn = `WAREHOUSE#ALLOCATION`
      const allocationSn = `WAREHOUSE`
      const allocationGsi1Pk = `WAREHOUSE#ALLOCATION`
      const allocationGsi1Sk = `CREATED_AT#${createdAt}`
      const allocationStatus = `ALLOCATED`

      const skuItemPk = `WAREHOUSE#SKU#${sku}`
      const skuItemSk = `SKU#${sku}`

      const ddbCommand = new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: tableName,
              Item: {
                pk: allocationPk,
                sk: allocationSk,
                sku,
                orderId,
                units,
                price,
                userId,
                allocationStatus,
                createdAt,
                updatedAt,
                _tn: allocationTn,
                _sn: allocationSn,
                gsi1pk: allocationGsi1Pk,
                gsi1sk: allocationGsi1Sk,
              },
              ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
            },
          },
          {
            Update: {
              TableName: tableName,
              Key: {
                pk: skuItemPk,
                sk: skuItemSk,
              },
              UpdateExpression: `SET #units = #units - :units, #updatedAt = :updatedAt`,
              ExpressionAttributeNames: {
                '#units': 'units',
                '#updatedAt': 'updatedAt',
              },
              ExpressionAttributeValues: {
                ':units': units,
                ':updatedAt': updatedAt,
              },
              ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk) and #units >= :units',
            },
          },
        ],
      })
      return ddbCommand
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, allocateOrderStockCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {DuplicateStockAllocationError}
   * @throws {DepletedStockAllocationError}
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: TransactWriteCommand): Promise<void> {
    const logContext = 'DbAllocateOrderStockClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand })
    } catch (error) {
      // When possible multiple transaction errors can occur:
      // Prioritize tagging the "Duplicate Errors", because if we get one, this means that the operation
      // has already executed successfully, thus we don't care about other possible transaction errors
      if (this.isDuplicateStockAllocationError(error)) {
        const duplicationError = DuplicateStockAllocationError.from(error)
        console.error(`${logContext} exit error:`, { duplicationError, ddbCommand })
        throw duplicationError
      }

      if (this.isDepletedStockAllocationError(error)) {
        const depletionError = DepletedStockAllocationError.from(error)
        console.error(`${logContext} exit error:`, { depletionError, ddbCommand })
        throw depletionError
      }

      const unrecognizedError = UnrecognizedError.from(error)
      console.error(`${logContext} exit error:`, { unrecognizedError, ddbCommand })
      throw unrecognizedError
    }
  }

  /**
   *
   */
  private isDuplicateStockAllocationError(error: unknown): boolean {
    const errorCode = DynamoDbUtils.getTransactionCancellationCode(error, 0)
    return errorCode === 'ConditionalCheckFailed'
  }

  /**
   *
   */
  private isDepletedStockAllocationError(error: unknown): boolean {
    const errorCode = DynamoDbUtils.getTransactionCancellationCode(error, 1)
    return errorCode === 'ConditionalCheckFailed'
  }
}
