import { DynamoDBDocumentClient, NativeAttributeValue, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { DynamoDbUtils } from '../../shared/DynamoDbUtils'
import { CreateOrderCommand } from '../model/CreateOrderCommand'

export interface IDbCreateOrderClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  createOrder: (createOrderCommand: CreateOrderCommand) => Promise<OrderData>
}

/**
 *
 */
export class DbCreateOrderClient implements IDbCreateOrderClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  public async createOrder(createOrderCommand: CreateOrderCommand): Promise<OrderData> {
    const logContext = 'DbCreateOrderClient.createOrder'
    console.info(`${logContext} init:`, { createOrderCommand })

    try {
      const ddbCommand = this.buildDdbCommand(createOrderCommand)
      const orderData = await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { orderData })
      return orderData
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, createOrderCommand })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(createOrderCommand: CreateOrderCommand): UpdateCommand {
    const logContext = 'DbCreateOrderClient.buildDdbCommand'

    try {
      return new UpdateCommand({
        TableName: process.env.ORDER_TABLE_NAME,
        Key: {
          pk: `ORDER_ID#${createOrderCommand.orderData.orderId}`,
          sk: `ORDER_ID#${createOrderCommand.orderData.orderId}`,
        },
        UpdateExpression:
          'SET ' +
          '#_tn = :_tn, ' +
          '#orderId = :orderId, ' +
          '#orderStatus = :orderStatus, ' +
          '#sku = :sku, ' +
          '#units = :units, ' +
          '#price = :price, ' +
          '#userId = :userId, ' +
          '#createdAt = :createdAt, ' +
          '#updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#_tn': '_tn',
          '#orderId': 'orderId',
          '#orderStatus': 'orderStatus',
          '#sku': 'sku',
          '#units': 'units',
          '#price': 'price',
          '#userId': 'userId',
          '#createdAt': 'createdAt',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':_tn': 'ORDERS#ORDER',
          ':orderId': createOrderCommand.orderData.orderId,
          ':orderStatus': createOrderCommand.orderData.orderStatus,
          ':sku': createOrderCommand.orderData.sku,
          ':units': createOrderCommand.orderData.units,
          ':price': createOrderCommand.orderData.price,
          ':userId': createOrderCommand.orderData.userId,
          ':createdAt': createOrderCommand.orderData.createdAt,
          ':updatedAt': createOrderCommand.orderData.updatedAt,
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        ReturnValues: 'ALL_NEW',
      })
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, createOrderCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: UpdateCommand): Promise<OrderData> {
    const logContext = 'DbCreateOrderClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      const { Attributes } = await this.ddbDocClient.send(ddbCommand)
      const orderData = this.buildOrderData(Attributes)
      console.info(`${logContext} exit success:`, { orderData })
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
