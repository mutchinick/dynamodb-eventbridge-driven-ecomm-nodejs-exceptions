import { z } from 'zod'
import { InvalidArgumentsError } from '../../errors/AppError'
import { AllocateOrderStockData } from '../../model/AllocateOrderStockData'
import { ValueValidators } from '../../model/ValueValidators'
import { WarehouseEvent } from '../../model/WarehouseEvent'
import { WarehouseEventName } from '../../model/WarehouseEventName'

// TODO: Not all events provide the full Order data
// https://github.com/mutchinick/dynamodb-eventbridge-driven-ecomm-nodejs-exceptions/issues/1
export type OrderStockDepletedEventData = Pick<AllocateOrderStockData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
// export type OrderStockDepletedEventData = Pick<AllocateOrderStockData, 'orderId' | 'sku' | 'units'>

export type OrderStockDepletedEventInput = OrderStockDepletedEventData

type OrderStockDepletedEventProps = WarehouseEvent<
  WarehouseEventName.ORDER_STOCK_DEPLETED_EVENT,
  OrderStockDepletedEventData
>

/**
 *
 */
export class OrderStockDepletedEvent implements OrderStockDepletedEventProps {
  /**
   *
   */
  private constructor(
    public readonly eventName: WarehouseEventName.ORDER_STOCK_DEPLETED_EVENT,
    public readonly eventData: OrderStockDepletedEventData,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(orderStockDepletedEventInput: OrderStockDepletedEventInput): OrderStockDepletedEvent {
    const logContext = 'OrderStockDepletedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { orderStockDepletedEventInput })

    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildProps(orderStockDepletedEventInput)
      const orderStockDepletedEvent = new OrderStockDepletedEvent(eventName, eventData, createdAt, updatedAt)
      console.info(`${logContext} exit success:`, { orderStockDepletedEvent, orderStockDepletedEventInput })
      return orderStockDepletedEvent
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, orderStockDepletedEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(orderStockDepletedEventInput: OrderStockDepletedEventInput): OrderStockDepletedEventProps {
    this.validateInput(orderStockDepletedEventInput)

    const { orderId, sku, units, price, userId } = orderStockDepletedEventInput
    const date = new Date().toISOString()
    const orderStockDepletedEventData: OrderStockDepletedEventData = {
      orderId,
      sku,
      units,
      price,
      userId,
    }

    return {
      eventName: WarehouseEventName.ORDER_STOCK_DEPLETED_EVENT,
      eventData: orderStockDepletedEventData,
      createdAt: date,
      updatedAt: date,
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(orderStockDepletedEventInput: OrderStockDepletedEventInput): void {
    const logContext = 'OrderStockDepletedEvent.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
    })

    try {
      schema.parse(orderStockDepletedEventInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderStockDepletedEventInput })
      throw invalidArgumentsError
    }
  }
}
