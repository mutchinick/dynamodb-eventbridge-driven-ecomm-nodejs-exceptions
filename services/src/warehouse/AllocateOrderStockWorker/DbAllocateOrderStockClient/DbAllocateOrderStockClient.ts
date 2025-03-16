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
      const ddbCommand = this.buildDdbCommand(allocateOrderStockCommand)
      await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand })
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
      console.error(`${logContext} exit error:`, { error, allocateOrderStockCommand })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(allocateOrderStockCommand: AllocateOrderStockCommand): TransactWriteCommand {
    const logContext = 'DbAllocateOrderStockClient.buildDdbCommand'

    try {
      const tableName = process.env.WAREHOUSE_TABLE_NAME
      const { sku, units, orderId, createdAt, updatedAt } = allocateOrderStockCommand.allocateOrderStockData
      const status = 'ALLOCATED'
      const ddbCommand = new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: tableName,
              Item: {
                pk: `SKU_ID#${sku}#ORDER_ID#${orderId}#STOCK_ALLOCATION`,
                sk: `SKU_ID#${sku}#ORDER_ID#${orderId}#STOCK_ALLOCATION`,
                sku,
                units,
                orderId,
                status,
                createdAt,
                updatedAt,
                _tn: 'WAREHOUSE#STOCK_ALLOCATION',
              },
              ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
            },
          },
          {
            Update: {
              TableName: tableName,
              Key: {
                pk: `SKU#${sku}`,
                sk: `SKU#${sku}`,
              },
              UpdateExpression:
                `SET ` +
                `#sku = :sku, ` +
                `#units = #units - :units, ` +
                `#createdAt = if_not_exists(#createdAt, :createdAt), ` +
                `#updatedAt = :updatedAt, ` +
                `#_tn = :_tn`,
              ExpressionAttributeNames: {
                '#sku': 'sku',
                '#units': 'units',
                '#createdAt': 'createdAt',
                '#updatedAt': 'updatedAt',
                '#_tn': '_tn',
              },
              ExpressionAttributeValues: {
                ':sku': sku,
                ':units': units,
                ':createdAt': createdAt,
                ':updatedAt': updatedAt,
                ':_tn': 'WAREHOUSE#SKU',
              },
              ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk) and #units >= :units',
            },
          },
        ],
      })
      return ddbCommand
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
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
      console.error(`${logContext} error caught:`, { error })

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
