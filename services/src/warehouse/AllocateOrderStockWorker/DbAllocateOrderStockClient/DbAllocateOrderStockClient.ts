import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import {
  AsyncResult,
  DepletedStockAllocationError,
  DuplicateStockAllocationError,
  InvalidArgumentsError,
  Result,
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
  allocateOrderStock: (
    allocateOrderStockCommand: AllocateOrderStockCommand,
  ) => AsyncResult<
    void,
    InvalidArgumentsError | DuplicateStockAllocationError | DepletedStockAllocationError | UnrecognizedError
  >
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
  public async allocateOrderStock(
    allocateOrderStockCommand: AllocateOrderStockCommand,
  ): AsyncResult<
    void,
    InvalidArgumentsError | DuplicateStockAllocationError | DepletedStockAllocationError | UnrecognizedError
  > {
    const logContext = 'DbAllocateOrderStockClient.allocateOrderStock'
    console.info(`${logContext} init:`, { allocateOrderStockCommand })
    const ddbUpdateCommand = this.buildDdbUpdateCommand(allocateOrderStockCommand)
    await this.sendDdbUpdateCommand(ddbUpdateCommand)
    console.info(`${logContext} exit success:`, { allocateOrderStockCommand })
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbUpdateCommand(
    allocateOrderStockCommand: AllocateOrderStockCommand,
  ): Result<TransactWriteCommand, InvalidArgumentsError> {
    try {
      const tableName = process.env.WAREHOUSE_TABLE_NAME
      const { sku, units, orderId, createdAt, updatedAt } = allocateOrderStockCommand.allocateOrderStockData
      const status = 'ALLOCATED'
      const ddbUpdateCommand = new TransactWriteCommand({
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
      return ddbUpdateCommand
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {DuplicateStockAllocationError}
   * @throws {DepletedStockAllocationError}
   * @throws {UnrecognizedError}
   */
  private async sendDdbUpdateCommand(
    ddbUpdateCommand: TransactWriteCommand,
  ): AsyncResult<void, DuplicateStockAllocationError | DepletedStockAllocationError | UnrecognizedError> {
    const logContext = 'DbAllocateOrderStockClient.sendDdbUpdateCommand'
    console.info(`${logContext} init:`, { ddbUpdateCommand })

    try {
      await this.ddbDocClient.send(ddbUpdateCommand)
      console.info(`${logContext} exit success:`, { ddbUpdateCommand })
    } catch (error) {
      console.error(`${logContext} error log:`, { error: JSON.stringify(error) })

      // When possible multiple transaction errors:
      // Prioritize tagging the "Duplicate Errors", because if we get one, this means that the operation
      // has already executed successfully, thus we don't care about other possible transaction errors
      if (this.isDuplicateAllocationError(error)) {
        const duplicationError = DuplicateStockAllocationError.from(error)
        console.error(`${logContext} exit error:`, { duplicationError, ddbUpdateCommand })
        throw duplicationError
      }

      if (this.isDepletedStockError(error)) {
        const depletionError = DepletedStockAllocationError.from(error)
        console.error(`${logContext} exit error:`, { depletionError, ddbUpdateCommand })
        throw depletionError
      }

      const unrecognizedError = UnrecognizedError.from(error)
      console.error(`${logContext} exit error:`, { unrecognizedError, ddbUpdateCommand })
      throw unrecognizedError
    }
  }

  /**
   *
   */
  private isDuplicateAllocationError(error: unknown): boolean {
    const errorCode = DynamoDbUtils.getTransactionCancellationCode(error, 0)
    return errorCode === 'ConditionalCheckFailed'
  }

  /**
   *
   */
  private isDepletedStockError(error: unknown): boolean {
    const errorCode = DynamoDbUtils.getTransactionCancellationCode(error, 1)
    return errorCode === 'ConditionalCheckFailed'
  }
}
