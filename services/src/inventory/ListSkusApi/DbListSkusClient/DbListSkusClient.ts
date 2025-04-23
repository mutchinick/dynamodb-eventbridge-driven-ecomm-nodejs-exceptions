import { DynamoDBDocumentClient, NativeAttributeValue, QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { RestockSkuData } from '../../model/RestockSkuData'
import { SortDirection } from '../../model/SortDirection'
import { ListSkusCommand } from '../model/ListSkusCommand'

export interface IDbListSkusClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  listSkus: (listSkusCommand: ListSkusCommand) => Promise<RestockSkuData[]>
}

/**
 *
 */
export class DbListSkusClient implements IDbListSkusClient {
  public static readonly DEFAULT_LIMIT = 50
  public static readonly DEFAULT_SORT_DIRECTION = SortDirection['asc']

  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  public async listSkus(listSkusCommand: ListSkusCommand): Promise<RestockSkuData[]> {
    const logContext = 'DbListSkusClient.listSkus'
    console.info(`${logContext} init:`, { listSkusCommand })

    try {
      this.validateInput(listSkusCommand)
      const ddbCommand = this.buildDdbCommand(listSkusCommand)
      const skuData = await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { skuData, ddbCommand, listSkusCommand })
      return skuData
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, listSkusCommand })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(listSkusCommand: ListSkusCommand): void {
    const logContext = 'DbListSkusClient.validateInput'

    if (listSkusCommand instanceof ListSkusCommand === false) {
      const errorMessage = `Expected ListSkusCommand but got ${listSkusCommand}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, listSkusCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(listSkusCommand: ListSkusCommand): QueryCommand {
    const logContext = 'DbListSkusClient.buildDdbCommand'

    try {
      const tableName = process.env.INVENTORY_TABLE_NAME

      const { sku, sortDirection, limit } = listSkusCommand.commandData

      let params: QueryCommandInput
      if (sku) {
        const skuListPk = `INVENTORY#SKU#${sku}`
        const skuListSk = `SKU#${sku}`
        params = {
          TableName: tableName,
          KeyConditionExpression: '#pk = :pk AND #sk = :sk',
          ExpressionAttributeNames: {
            '#pk': 'pk',
            '#sk': 'sk',
          },
          ExpressionAttributeValues: {
            ':pk': skuListPk,
            ':sk': skuListSk,
          },
        }
      } else {
        const skuListIndexName = 'gsi1pk-gsi1sk-index'
        const skuListGsi1pk = `INVENTORY#SKU`
        const skuListSortDirection = SortDirection[sortDirection] ?? DbListSkusClient.DEFAULT_SORT_DIRECTION
        const skuListScanIndexForward = skuListSortDirection === DbListSkusClient.DEFAULT_SORT_DIRECTION
        const skuListLimit = limit || DbListSkusClient.DEFAULT_LIMIT
        params = {
          TableName: tableName,
          IndexName: skuListIndexName,
          KeyConditionExpression: '#gsi1pk = :gsi1pk',
          ExpressionAttributeNames: {
            '#gsi1pk': 'gsi1pk',
          },
          ExpressionAttributeValues: {
            ':gsi1pk': skuListGsi1pk,
          },
          ScanIndexForward: skuListScanIndexForward,
          Limit: skuListLimit,
        }
      }

      const ddbCommand = new QueryCommand(params)
      return ddbCommand
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, listSkusCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: QueryCommand): Promise<RestockSkuData[]> {
    const logContext = 'DbListSkusClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      const ddbResult = await this.ddbDocClient.send(ddbCommand)
      if (!ddbResult.Items) {
        const skus: RestockSkuData[] = []
        console.info(`${logContext} exit success: null-Items:`, { skus, ddbResult, ddbCommand })
        return skus
      } else {
        const skus = this.buildRestockSkuData(ddbResult.Items)
        console.info(`${logContext} exit success:`, { skuData: skus, ddbResult, ddbCommand })
        return skus
      }
    } catch (error) {
      const unrecognizedError = UnrecognizedError.from(error)
      console.error(`${logContext} exit error:`, { unrecognizedError, ddbCommand })
      throw unrecognizedError
    }
  }

  /**
   *
   */
  private buildRestockSkuData(items: Record<string, NativeAttributeValue>[]): RestockSkuData[] {
    const skus: RestockSkuData[] = items.map((item) => ({
      sku: item.sku,
      units: item.units,
      lotId: item.lotId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
    return skus
  }
}
