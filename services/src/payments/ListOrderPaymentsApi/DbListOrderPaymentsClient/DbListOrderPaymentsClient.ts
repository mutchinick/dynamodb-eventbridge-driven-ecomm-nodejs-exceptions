import { DynamoDBDocumentClient, NativeAttributeValue, QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { SortDirection } from '../../model/SortDirection'
import { ListOrderPaymentsCommand } from '../model/ListOrderPaymentsCommand'

export interface IDbListOrderPaymentsClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  listOrderPayments: (listOrderPaymentsCommand: ListOrderPaymentsCommand) => Promise<OrderPaymentData[]>
}

/**
 *
 */
export class DbListOrderPaymentsClient implements IDbListOrderPaymentsClient {
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
  public async listOrderPayments(listOrderPaymentsCommand: ListOrderPaymentsCommand): Promise<OrderPaymentData[]> {
    const logContext = 'DbListOrderPaymentsClient.listOrderPayments'
    console.info(`${logContext} init:`, { listOrderPaymentsCommand })

    try {
      this.validateInput(listOrderPaymentsCommand)
      const ddbCommand = this.buildDdbCommand(listOrderPaymentsCommand)
      const orderPaymentData = await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { orderPaymentData, ddbCommand, listOrderPaymentsCommand })
      return orderPaymentData
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, listOrderPaymentsCommand })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(listOrderPaymentsCommand: ListOrderPaymentsCommand): void {
    const logContext = 'DbListOrderPaymentsClient.validateInput'

    if (listOrderPaymentsCommand instanceof ListOrderPaymentsCommand === false) {
      const errorMessage = `Expected ListOrderPaymentsCommand but got ${listOrderPaymentsCommand}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, listOrderPaymentsCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(listOrderPaymentsCommand: ListOrderPaymentsCommand): QueryCommand {
    const logContext = 'DbListOrderPaymentsClient.buildDdbCommand'

    // Perhaps we can prevent all errors by validating the arguments, but QueryCommand
    // is an external dependency and we don't know what happens internally, so we try-catch
    try {
      const tableName = process.env.PAYMENTS_TABLE_NAME

      const { orderId, sortDirection, limit } = listOrderPaymentsCommand.commandData

      let params: QueryCommandInput
      if (orderId) {
        const listPk = `PAYMENTS#ORDER_ID#${orderId}`
        const listSk = `ORDER_ID#${orderId}#PAYMENT`
        params = {
          TableName: tableName,
          KeyConditionExpression: '#pk = :pk AND #sk = :sk',
          ExpressionAttributeNames: {
            '#pk': 'pk',
            '#sk': 'sk',
          },
          ExpressionAttributeValues: {
            ':pk': listPk,
            ':sk': listSk,
          },
        }
      } else {
        const listIndexName = 'gsi1pk-gsi1sk-index'
        const listGsi1pk = `PAYMENTS#PAYMENT`
        const listSortDirection = SortDirection[sortDirection] ?? DbListOrderPaymentsClient.DEFAULT_SORT_DIRECTION
        const listScanIndexForward = listSortDirection === DbListOrderPaymentsClient.DEFAULT_SORT_DIRECTION
        const listLimit = limit || DbListOrderPaymentsClient.DEFAULT_LIMIT
        params = {
          TableName: tableName,
          IndexName: listIndexName,
          KeyConditionExpression: '#gsi1pk = :gsi1pk',
          ExpressionAttributeNames: {
            '#gsi1pk': 'gsi1pk',
          },
          ExpressionAttributeValues: {
            ':gsi1pk': listGsi1pk,
          },
          ScanIndexForward: listScanIndexForward,
          Limit: listLimit,
        }
      }

      const ddbCommand = new QueryCommand(params)
      return ddbCommand
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, listOrderPaymentsCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: QueryCommand): Promise<OrderPaymentData[]> {
    const logContext = 'DbListOrderPaymentsClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      const ddbResult = await this.ddbDocClient.send(ddbCommand)
      if (!ddbResult.Items) {
        const orderPayments: OrderPaymentData[] = []
        console.info(`${logContext} exit success: null-Items:`, { orderPayments, ddbResult, ddbCommand })
        return orderPayments
      } else {
        const orderPayments = this.buildOrderPaymentData(ddbResult.Items)
        console.info(`${logContext} exit success:`, { orderPayments, ddbResult, ddbCommand })
        return orderPayments
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
  private buildOrderPaymentData(items: Record<string, NativeAttributeValue>[]): OrderPaymentData[] {
    const orderPayments: OrderPaymentData[] = items.map((item) => ({
      orderId: item.orderId,
      sku: item.sku,
      units: item.units,
      price: item.price,
      userId: item.userId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      paymentId: item.paymentId,
      paymentStatus: item.paymentStatus,
      paymentRetries: item.paymentRetries,
    }))
    return orderPayments
  }
}
