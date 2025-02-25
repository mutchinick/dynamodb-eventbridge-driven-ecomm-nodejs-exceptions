import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import {
  AsyncResult,
  InvalidArgumentsError,
  DuplicateRestockOperationError,
  Result,
  UnrecognizedError,
} from '../../errors/AppError'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { RestockSkuCommand } from '../model/RestockSkuCommand'

export interface IDbRestockSkuClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateRestockOperationError}
   * @throws {UnrecognizedError}
   */
  restockSku: (
    restockSkuCommand: RestockSkuCommand,
  ) => AsyncResult<void, InvalidArgumentsError | DuplicateRestockOperationError | UnrecognizedError>
}

/**
 *
 */
export class DbRestockSkuClient implements IDbRestockSkuClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateRestockOperationError}
   * @throws {UnrecognizedError}
   */
  public async restockSku(
    restockSkuCommand: RestockSkuCommand,
  ): AsyncResult<void, InvalidArgumentsError | DuplicateRestockOperationError | UnrecognizedError> {
    const ddbUpdateCommand = this.buildDdbUpdateCommand(restockSkuCommand)
    await this.sendDdbUpdateCommand(ddbUpdateCommand)
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbUpdateCommand(
    restockSkuCommand: RestockSkuCommand,
  ): Result<TransactWriteCommand, InvalidArgumentsError> {
    try {
      const tableName = process.env.WAREHOUSE_TABLE_NAME
      const { sku, units, lotId, createdAt, updatedAt } = restockSkuCommand.restockSkuData
      const ddbUpdateCommand = new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: tableName,
              Item: {
                pk: `LOT_ID#${lotId}`,
                sk: `LOT_ID#${lotId}`,
                sku,
                units,
                lotId,
                createdAt,
                updatedAt,
                _tn: 'WAREHOUSE#LOT',
              },
              ConditionExpression: 'attribute_not_exists(pk)',
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
                `#units = if_not_exists(#units, :zero) + :units, ` +
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
                ':zero': 0,
                ':_tn': 'WAREHOUSE#SKU',
              },
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
   * @throws {DuplicateRestockOperationError}
   * @throws {UnrecognizedError}
   */
  private async sendDdbUpdateCommand(
    ddbUpdateCommand: TransactWriteCommand,
  ): AsyncResult<void, DuplicateRestockOperationError | UnrecognizedError> {
    try {
      await this.ddbDocClient.send(ddbUpdateCommand)
    } catch (error) {
      // When possible multiple transaction errors:
      // Prioritize tagging the "Duplicate Errors", because if we get one, this means that the operation
      // has already executed successfully, thus we don't care about other possible transaction errors
      if (this.isDuplicateRestockError(error)) {
        const duplicationError = DuplicateRestockOperationError.from(error)
        throw duplicationError
      }

      const unrecognizedError = UnrecognizedError.from(error)
      throw unrecognizedError
    }
  }

  /**
   *
   */
  private isDuplicateRestockError(error: unknown): boolean {
    const errorCode = DynamoDbUtils.getTransactionCancellationCode(error, 0)
    return errorCode === 'ConditionalCheckFailed'
  }
}
