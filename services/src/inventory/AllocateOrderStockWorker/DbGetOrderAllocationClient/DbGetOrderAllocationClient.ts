import { DynamoDBDocumentClient, GetCommand, NativeAttributeValue } from '@aws-sdk/lib-dynamodb'
import { InvalidArgumentsError, UnrecognizedError } from '../../errors/AppError'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { GetOrderAllocationCommand } from '../model/GetOrderAllocationCommand'

export interface IDbGetOrderAllocationClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  getOrderAllocation: (getOrderAllocationCommand: GetOrderAllocationCommand) => Promise<OrderAllocationData>
}

/**
 *
 */
export class DbGetOrderAllocationClient implements IDbGetOrderAllocationClient {
  /**
   *
   */
  constructor(private readonly ddbDocClient: DynamoDBDocumentClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  public async getOrderAllocation(getOrderAllocationCommand: GetOrderAllocationCommand): Promise<OrderAllocationData> {
    const logContext = 'DbGetOrderAllocationClient.getOrderAllocation'
    console.info(`${logContext} init:`, { getOrderAllocationCommand })

    try {
      this.validateInput(getOrderAllocationCommand)
      const ddbCommand = this.buildDdbCommand(getOrderAllocationCommand)
      const orderAllocationData = await this.sendDdbCommand(ddbCommand)
      console.info(`${logContext} exit success:`, { orderAllocationData, ddbCommand, getOrderAllocationCommand })
      return orderAllocationData
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, getOrderAllocationCommand })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(getOrderAllocationCommand: GetOrderAllocationCommand): void {
    const logContext = 'DbCreateOrderClient.validateInput'

    if (getOrderAllocationCommand instanceof GetOrderAllocationCommand === false) {
      const errorMessage = `Expected GetOrderAllocationCommand but got ${getOrderAllocationCommand}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, getOrderAllocationCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildDdbCommand(getOrderAllocationCommand: GetOrderAllocationCommand): GetCommand {
    const logContext = 'DbGetOrderAllocationClient.buildDdbCommand'

    try {
      const tableName = process.env.INVENTORY_TABLE_NAME

      const { orderId, sku } = getOrderAllocationCommand.commandData

      const allocationPk = `INVENTORY#SKU#${sku}`
      const allocationSk = `SKU#${sku}#ORDER_ID#${orderId}#ALLOCATION`

      const ddbCommand = new GetCommand({
        TableName: tableName,
        Key: {
          pk: allocationPk,
          sk: allocationSk,
        },
      })
      return ddbCommand
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, getOrderAllocationCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {UnrecognizedError}
   */
  private async sendDdbCommand(ddbCommand: GetCommand): Promise<OrderAllocationData> {
    const logContext = 'DbGetOrderAllocationClient.sendDdbCommand'
    console.info(`${logContext} init:`, { ddbCommand })

    try {
      const ddbOutput = await this.ddbDocClient.send(ddbCommand)
      if (!ddbOutput.Item) {
        const orderAllocationData: OrderAllocationData = null
        console.info(`${logContext} exit success: null-Item:`, { orderAllocationData })
        return orderAllocationData
      } else {
        const orderAllocationData = this.buildOrderAllocationData(ddbOutput.Item)
        console.info(`${logContext} exit success:`, { orderAllocationData })
        return orderAllocationData
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
  private buildOrderAllocationData(ddbItem: Record<string, NativeAttributeValue>): OrderAllocationData {
    const orderAllocationData: OrderAllocationData = {
      orderId: ddbItem.orderId,
      sku: ddbItem.sku,
      units: ddbItem.units,
      price: ddbItem.price,
      userId: ddbItem.userId,
      createdAt: ddbItem.createdAt,
      updatedAt: ddbItem.updatedAt,
      allocationStatus: ddbItem.allocationStatus,
    }
    return orderAllocationData
  }
}
