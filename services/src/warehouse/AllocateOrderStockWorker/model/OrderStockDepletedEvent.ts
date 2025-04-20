import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { ValueValidators } from '../../model/ValueValidators'
import { WarehouseEvent } from '../../model/WarehouseEvent'
import { WarehouseEventName } from '../../model/WarehouseEventName'

export type OrderStockDepletedEventInput = TypeUtilsPretty<
  Pick<OrderAllocationData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type OrderStockDepletedEventData = TypeUtilsPretty<
  Pick<OrderAllocationData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

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
    const currentDate = new Date().toISOString()
    const orderStockDepletedEventProps: OrderStockDepletedEventProps = {
      eventName: WarehouseEventName.ORDER_STOCK_DEPLETED_EVENT,
      eventData: { orderId, sku, units, price, userId },
      createdAt: currentDate,
      updatedAt: currentDate,
    }
    return orderStockDepletedEventProps
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
