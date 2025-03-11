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
    const ddbCommand = this.buildDdbCommand(getOrderCommand.orderId)
    const orderData = await this.sendDdbCommand(ddbCommand)
    console.info(`${logContext} exit success:`, { orderData })
    return orderData
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(orderId: string): GetCommand {
    const logContext = 'DbGetOrderClient.buildDdbCommand'

    try {
      return new GetCommand({
        TableName: process.env.EVENT_STORE_TABLE_NAME,
        Key: {
          pk: `ORDER_ID#${orderId}`,
          sk: `ORDER_ID#${orderId}`,
        },
      })
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderId })
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
      const result = await this.ddbDocClient.send(ddbCommand)
      if (!result.Item) {
        console.info(`${logContext} exit success: null-item:`, { orderData: result.Item })
        return null
      }
      const orderData = this.buildOrderData(result.Item)
      console.info(`${logContext} exit success:`, { orderData })
      return orderData
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
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
