import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { DuplicateRestockOperationError, InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { RestockSkuCommand } from '../model/RestockSkuCommand'

export interface IDbRestockSkuClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateRestockOperationError}
   * @throws {UnrecognizedError}
   */
  restockSku: (restockSkuCommand: RestockSkuCommand) => Promise<void>
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
  public async restockSku(restockSkuCommand: RestockSkuCommand): Promise<void> {
    const logContext = 'DbRestockSkuClient.restockSku'
    console.info(`${logContext} init:`, { restockSkuCommand })

    try {
      // TODO: this.validateInput(...)
      this.validateInput(restockSkuCommand)
      const ddbCommand = this.buildDdbCommand(restockSkuCommand)
      await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand, restockSkuCommand })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, restockSkuCommand })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(restockSkuCommand: RestockSkuCommand): void {
    const logContext = 'DbRestockSkuClient.validateInput'

    if (restockSkuCommand instanceof RestockSkuCommand === false) {
      const errorMessage = `Expected RestockSkuCommand but got ${restockSkuCommand}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, restockSkuCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(restockSkuCommand: RestockSkuCommand): TransactWriteCommand {
    const logContext = 'DbRestockSkuClient.buildDdbCommand'

    try {
      const tableName = process.env.WAREHOUSE_TABLE_NAME
      const { sku, units, lotId, createdAt, updatedAt } = restockSkuCommand.restockSkuData
      const ddbCommand = new TransactWriteCommand({
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
      return ddbCommand
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, restockSkuCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {DuplicateRestockOperationError}
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: TransactWriteCommand): Promise<void> {
    const logContext = 'DbRestockSkuClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      await this.ddbDocClient.send(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand })
    } catch (error) {
      // When possible multiple transaction errors can occur:
      // Prioritize tagging the "Duplicate Errors", because if we get one, this means that the operation
      // has already executed successfully, thus we don't care about other possible transaction errors
      if (this.isDuplicateRestockOperationError(error)) {
        const duplicationError = DuplicateRestockOperationError.from(error)
        console.error(`${logContext} exit error:`, { duplicationError, ddbCommand })
        throw duplicationError
      }

      const unrecognizedError = UnrecognizedError.from(error)
      console.error(`${logContext} exit error:`, { unrecognizedError, ddbCommand })
      throw unrecognizedError
    }
  }

  /**
   *
   */
  private isDuplicateRestockOperationError(error: unknown): boolean {
    const errorCode = DynamoDbUtils.getTransactionCancellationCode(error, 0)
    return errorCode === 'ConditionalCheckFailed'
  }
}
