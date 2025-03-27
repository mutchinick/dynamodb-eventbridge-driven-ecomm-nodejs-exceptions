import { DynamoDBDocumentClient, GetCommand, NativeAttributeValue } from '@aws-sdk/lib-dynamodb'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { GetOrderCommand } from '../model/GetOrderCommand'

export interface IDbGetOrderClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  getOrder: (getOrderCommand: GetOrderCommand) => Promise<OrderData>
}

/**
 *
 */
export class DbGetOrderClient implements IDbGetOrderClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  public async getOrder(getOrderCommand: GetOrderCommand): Promise<OrderData> {
    const logContext = 'DbGetOrderClient.getOrder'
    console.info(`${logContext} init:`, { getOrderCommand })

    try {
      this.validateInput(getOrderCommand)
      const ddbCommand = this.buildDdbCommand(getOrderCommand)
      const orderData = await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { orderData, ddbCommand, getOrderCommand })
      return orderData
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, getOrderCommand })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(getOrderCommand: GetOrderCommand): void {
    const logContext = 'DbCreateOrderClient.validateInput'

    if (getOrderCommand instanceof GetOrderCommand === false) {
      const errorMessage = `Expected GetOrderCommand but got ${getOrderCommand}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, getOrderCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(getOrderCommand: GetOrderCommand): GetCommand {
    const logContext = 'DbGetOrderClient.buildDdbCommand'

    try {
      const tableName = process.env.ORDERS_TABLE_NAME

      const orderItemPk = `ORDERS#ORDER_ID#${getOrderCommand.orderData.orderId}`
      const orderItemSk = `ORDER_ID#${getOrderCommand.orderData.orderId}`

      const ddbCommand = new GetCommand({
        TableName: tableName,
        Key: {
          pk: orderItemPk,
          sk: orderItemSk,
        },
      })
      return ddbCommand
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, getOrderCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: GetCommand): Promise<OrderData> {
    const logContext = 'DbGetOrderClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      const ddbResult = await this.ddbDocClient.send(ddbCommand)
      if (!ddbResult.Item) {
        console.info(`${logContext} exit success: null-orderItem:`, { orderData: null, ddbResult, ddbCommand })
        return null
      }
      const orderData = this.buildOrderData(ddbResult.Item)
      console.info(`${logContext} exit success:`, { orderData, ddbResult, ddbCommand })
      return orderData
    } catch (error) {
      const unrecognizedError = UnrecognizedError.from(error)
      console.error(`${logContext} exit error:`, { unrecognizedError, ddbCommand })
      throw unrecognizedError
    }
  }

  /**
   *
   */
  private buildOrderData(attributes: Record<string, NativeAttributeValue>): OrderData {
    const orderData: OrderData = {
      orderId: attributes.orderId,
      orderStatus: attributes.orderStatus,
      sku: attributes.sku,
      units: attributes.units,
      price: attributes.price,
      userId: attributes.userId,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt,
    }
    return orderData
  }
}
