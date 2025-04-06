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
      this.validateInput(createOrderCommand)
      const ddbCommand = this.buildDdbCommand(createOrderCommand)
      const orderData = await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { ddbCommand, orderData, createOrderCommand })
      return orderData
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, createOrderCommand })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(createOrderCommand: CreateOrderCommand): void {
    const logContext = 'DbCreateOrderClient.validateInput'

    if (createOrderCommand instanceof CreateOrderCommand === false) {
      const errorMessage = `Expected CreateOrderCommand but got ${createOrderCommand}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, createOrderCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(createOrderCommand: CreateOrderCommand): UpdateCommand {
    const logContext = 'DbCreateOrderClient.buildDdbCommand'

    try {
      const tableName = process.env.ORDERS_TABLE_NAME

      const { commandData } = createOrderCommand
      const { orderId, orderStatus, sku, units, price, userId, createdAt, updatedAt } = commandData

      const orderItemPk = `ORDERS#ORDER_ID#${orderId}`
      const orderItemSk = `ORDER_ID#${orderId}`
      const orderItemTn = `ORDERS#ORDER`
      const orderItemSn = `ORDERS`
      const orderItemGsi1Pk = `ORDERS#ORDER`
      const orderItemGsi1Sk = `CREATED_AT#${createdAt}`

      const ddbCommand = new UpdateCommand({
        TableName: tableName,
        Key: {
          pk: orderItemPk,
          sk: orderItemSk,
        },
        UpdateExpression:
          'SET ' +
          '#orderId = :orderId, ' +
          '#orderStatus = :orderStatus, ' +
          '#sku = :sku, ' +
          '#units = :units, ' +
          '#price = :price, ' +
          '#userId = :userId, ' +
          '#createdAt = :createdAt, ' +
          '#updatedAt = :updatedAt, ' +
          '#_tn = :_tn, ' +
          '#_sn = :_sn, ' +
          '#gsi1pk = :gsi1pk, ' +
          '#gsi1sk = :gsi1sk',
        ExpressionAttributeNames: {
          '#orderId': 'orderId',
          '#orderStatus': 'orderStatus',
          '#sku': 'sku',
          '#units': 'units',
          '#price': 'price',
          '#userId': 'userId',
          '#createdAt': 'createdAt',
          '#updatedAt': 'updatedAt',
          '#_tn': '_tn',
          '#_sn': '_sn',
          '#gsi1pk': 'gsi1pk',
          '#gsi1sk': 'gsi1sk',
        },
        ExpressionAttributeValues: {
          ':orderId': orderId,
          ':orderStatus': orderStatus,
          ':sku': sku,
          ':units': units,
          ':price': price,
          ':userId': userId,
          ':createdAt': createdAt,
          ':updatedAt': updatedAt,
          ':_tn': orderItemTn,
          ':_sn': orderItemSn,
          ':gsi1pk': orderItemGsi1Pk,
          ':gsi1sk': orderItemGsi1Sk,
        },
        ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        ReturnValues: 'ALL_NEW',
      })
      return ddbCommand
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
