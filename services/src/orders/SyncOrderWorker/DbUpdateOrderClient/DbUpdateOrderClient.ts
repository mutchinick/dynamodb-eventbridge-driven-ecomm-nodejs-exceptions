import { DynamoDBDocumentClient, NativeAttributeValue, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { UpdateOrderCommand } from '../model/UpdateOrderCommand'

export interface IDbUpdateOrderClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  updateOrder: (updateOrderCommand: UpdateOrderCommand) => Promise<OrderData>
}

/**
 *
 */
export class DbUpdateOrderClient implements IDbUpdateOrderClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  public async updateOrder(updateOrderCommand: UpdateOrderCommand): Promise<OrderData> {
    const logContext = 'DbUpdateOrderClient.updateOrder'
    console.info(`${logContext} init:`, { updateOrderCommand })
    try {
      const ddbCommand = this.buildDdbCommand(updateOrderCommand)
      const orderData = await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { orderData, ddbCommand, updateOrderCommand })
      return orderData
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, updateOrderCommand })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(updateOrderCommand: UpdateOrderCommand): UpdateCommand {
    const logContext = 'DbUpdateOrderClient.buildDdbCommand'

    try {
      return new UpdateCommand({
        TableName: process.env.ORDER_TABLE_NAME,
        Key: {
          pk: `ORDER_ID#${updateOrderCommand.orderData.orderId}`,
          sk: `ORDER_ID#${updateOrderCommand.orderData.orderId}`,
        },
        UpdateExpression: 'SET #orderStatus = :orderStatus, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#orderStatus': 'orderStatus',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':orderStatus': updateOrderCommand.orderData.orderStatus,
          ':updatedAt': updateOrderCommand.orderData.updatedAt,
        },
        ConditionExpression: '#orderStatus <> :orderStatus',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        ReturnValues: 'ALL_NEW',
      })
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, updateOrderCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: UpdateCommand): Promise<OrderData> {
    const logContext = 'DbUpdateOrderClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      const { Attributes } = await this.ddbDocClient.send(ddbCommand)
      const orderData = this.buildOrderData(Attributes)
      console.info(`${logContext} exit success:`, { orderData, ddbCommand })
      return orderData
    } catch (error) {
      if (DynamoDbUtils.isConditionalCheckFailedException(error)) {
        const attributes = unmarshall(error.Item)
        const orderData = this.buildOrderData(attributes)
        console.info(`${logContext} exit success: from-error:`, { orderData, error, ddbCommand })
        return orderData
      }

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
