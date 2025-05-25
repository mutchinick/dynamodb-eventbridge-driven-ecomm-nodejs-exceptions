import { DynamoDBDocumentClient, GetCommand, NativeAttributeValue } from '@aws-sdk/lib-dynamodb'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { GetOrderPaymentCommand } from '../model/GetOrderPaymentCommand'

export interface IDbGetOrderPaymentClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  getOrderPayment: (getOrderPaymentCommand: GetOrderPaymentCommand) => Promise<OrderPaymentData>
}

/**
 *
 */
export class DbGetOrderPaymentClient implements IDbGetOrderPaymentClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  public async getOrderPayment(getOrderPaymentCommand: GetOrderPaymentCommand): Promise<OrderPaymentData> {
    const logContext = 'DbGetOrderPaymentClient.getOrderPayment'
    console.info(`${logContext} init:`, { getOrderPaymentCommand })

    try {
      this.validateInput(getOrderPaymentCommand)
      const ddbCommand = this.buildDdbCommand(getOrderPaymentCommand)
      const orderPaymentData = await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { orderPaymentData, ddbCommand, getOrderPaymentCommand })
      return orderPaymentData
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, getOrderPaymentCommand })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(getOrderPaymentCommand: GetOrderPaymentCommand): void {
    const logContext = 'DbGetOrderPaymentClient.validateInput'

    if (getOrderPaymentCommand instanceof GetOrderPaymentCommand === false) {
      const errorMessage = `Expected GetOrderPaymentCommand but got ${getOrderPaymentCommand}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, getOrderPaymentCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(getOrderPaymentCommand: GetOrderPaymentCommand): GetCommand {
    const logContext = 'DbGetOrderPaymentClient.buildDdbCommand'

    try {
      const tableName = process.env.PAYMENTS_TABLE_NAME

      const { orderId } = getOrderPaymentCommand.commandData

      const paymentPk = `PAYMENTS#ORDER_ID#${orderId}`
      const paymentSk = `ORDER_ID#${orderId}#PAYMENT`

      const ddbCommand = new GetCommand({
        TableName: tableName,
        Key: {
          pk: paymentPk,
          sk: paymentSk,
        },
      })
      return ddbCommand
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, getOrderPaymentCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: GetCommand): Promise<OrderPaymentData> {
    const logContext = 'DbGetOrderPaymentClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      const ddbOutput = await this.ddbDocClient.send(ddbCommand)
      if (!ddbOutput.Item) {
        const orderPaymentData: OrderPaymentData = null
        console.info(`${logContext} exit success: null-Item:`, { orderPaymentData })
        return orderPaymentData
      } else {
        const orderPaymentData = this.buildOrderPaymentData(ddbOutput.Item)
        console.info(`${logContext} exit success:`, { orderPaymentData })
        return orderPaymentData
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
  private buildOrderPaymentData(ddbItem: Record<string, NativeAttributeValue>): OrderPaymentData {
    const orderPaymentData: OrderPaymentData = {
      orderId: ddbItem.orderId,
      sku: ddbItem.sku,
      units: ddbItem.units,
      price: ddbItem.price,
      userId: ddbItem.userId,
      createdAt: ddbItem.createdAt,
      updatedAt: ddbItem.updatedAt,
      paymentId: ddbItem.paymentId,
      paymentStatus: ddbItem.paymentStatus,
      paymentRetries: ddbItem.paymentRetries,
    }
    return orderPaymentData
  }
}
