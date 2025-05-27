import { DynamoDBDocumentClient, NativeAttributeValue, QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { SortDirection } from '../../model/SortDirection'
import { ListOrdersCommand } from '../model/ListOrdersCommand'

export interface IDbListOrdersClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  listOrders: (listOrdersCommand: ListOrdersCommand) => Promise<OrderData[]>
}

/**
 *
 */
export class DbListOrdersClient implements IDbListOrdersClient {
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
  public async listOrders(listOrdersCommand: ListOrdersCommand): Promise<OrderData[]> {
    const logContext = 'DbListOrdersClient.listOrders'
    console.info(`${logContext} init:`, { listOrdersCommand })

    try {
      this.validateInput(listOrdersCommand)
      const ddbCommand = this.buildDdbCommand(listOrdersCommand)
      const orderData = await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { orderData, ddbCommand, listOrdersCommand })
      return orderData
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, listOrdersCommand })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(listOrdersCommand: ListOrdersCommand): void {
    const logContext = 'DbListOrdersClient.validateInput'

    if (listOrdersCommand instanceof ListOrdersCommand === false) {
      const errorMessage = `Expected ListOrdersCommand but got ${listOrdersCommand}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, listOrdersCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(listOrdersCommand: ListOrdersCommand): QueryCommand {
    const logContext = 'DbListOrdersClient.buildDdbCommand'

    // Perhaps we can prevent all errors by validating the arguments, but QueryCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.ORDERS_TABLE_NAME

      const { orderId, sortDirection, limit } = listOrdersCommand.commandData

      let params: QueryCommandInput
      if (orderId) {
        const orderListPk = `ORDERS#ORDER_ID#${orderId}`
        const orderListSk = `ORDER_ID#${orderId}`
        params = {
          TableName: tableName,
          KeyConditionExpression: '#pk = :pk AND #sk = :sk',
          ExpressionAttributeNames: {
            '#pk': 'pk',
            '#sk': 'sk',
          },
          ExpressionAttributeValues: {
            ':pk': orderListPk,
            ':sk': orderListSk,
          },
        }
      } else {
        const orderListIndexName = 'gsi1pk-gsi1sk-index'
        const orderListGsi1pk = `ORDERS#ORDER`
        const orderListSortDirection = SortDirection[sortDirection] ?? DbListOrdersClient.DEFAULT_SORT_DIRECTION
        const orderListScanIndexForward = orderListSortDirection === DbListOrdersClient.DEFAULT_SORT_DIRECTION
        const orderListLimit = limit || DbListOrdersClient.DEFAULT_LIMIT
        params = {
          TableName: tableName,
          IndexName: orderListIndexName,
          KeyConditionExpression: '#gsi1pk = :gsi1pk',
          ExpressionAttributeNames: {
            '#gsi1pk': 'gsi1pk',
          },
          ExpressionAttributeValues: {
            ':gsi1pk': orderListGsi1pk,
          },
          ScanIndexForward: orderListScanIndexForward,
          Limit: orderListLimit,
        }
      }

      const ddbCommand = new QueryCommand(params)
      return ddbCommand
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, listOrdersCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: QueryCommand): Promise<OrderData[]> {
    const logContext = 'DbListOrdersClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      const ddbResult = await this.ddbDocClient.send(ddbCommand)
      if (!ddbResult.Items) {
        const orders: OrderData[] = []
        console.info(`${logContext} exit success: null-Items:`, { orders, ddbResult, ddbCommand })
        return orders
      } else {
        const orders = this.buildOrderData(ddbResult.Items)
        console.info(`${logContext} exit success:`, { orderData: orders, ddbResult, ddbCommand })
        return orders
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
  private buildOrderData(items: Record<string, NativeAttributeValue>[]): OrderData[] {
    const orders: OrderData[] = items.map((item) => ({
      orderId: item.orderId,
      orderStatus: item.orderStatus,
      sku: item.sku,
      units: item.units,
      price: item.price,
      userId: item.userId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
    return orders
  }
}
