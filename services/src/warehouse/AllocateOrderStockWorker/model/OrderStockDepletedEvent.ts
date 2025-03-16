import { z } from 'zod'
import { InvalidArgumentsError, Result } from '../../errors/AppError'
import { AllocateOrderStockData } from '../../model/AllocateOrderStockData'
import { ValueValidators } from '../../model/ValueValidators'
import { WarehouseEvent } from '../../model/WarehouseEvent'
import { WarehouseEventName } from '../../model/WarehouseEventName'

export type OrderStockDepletedEventData = Pick<AllocateOrderStockData, 'orderId' | 'sku' | 'units'>

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
  public static validateAndBuild(
    orderStockDepletedEventInput: OrderStockDepletedEventInput,
  ): Result<OrderStockDepletedEvent, InvalidArgumentsError> {
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
  private static buildProps(
    orderStockDepletedEventInput: OrderStockDepletedEventInput,
  ): Result<OrderStockDepletedEventProps, InvalidArgumentsError> {
    this.validateInput(orderStockDepletedEventInput)

    const { orderId, sku, units } = orderStockDepletedEventInput
    const date = new Date().toISOString()
    const orderStockDepletedEventData: OrderStockDepletedEventData = {
      orderId,
      sku,
      units,
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
