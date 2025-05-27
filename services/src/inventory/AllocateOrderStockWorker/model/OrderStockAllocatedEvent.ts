import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { ValueValidators } from '../../model/ValueValidators'
import { InventoryEvent } from '../../model/InventoryEvent'
import { InventoryEventName } from '../../model/InventoryEventName'

export type OrderStockAllocatedEventInput = TypeUtilsPretty<
  Pick<OrderAllocationData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type OrderStockAllocatedEventData = TypeUtilsPretty<
  Pick<OrderAllocationData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type OrderStockAllocatedEventProps = InventoryEvent<
  InventoryEventName.ORDER_STOCK_ALLOCATED_EVENT,
  OrderStockAllocatedEventData
>

/**
 *
 */
export class OrderStockAllocatedEvent implements OrderStockAllocatedEventProps {
  /**
   *
   */
  private constructor(
    public readonly eventName: InventoryEventName.ORDER_STOCK_ALLOCATED_EVENT,
    public readonly eventData: OrderStockAllocatedEventData,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    orderStockAllocatedEventInput: OrderStockAllocatedEventInput,
  ): OrderStockAllocatedEvent {
    const logContext = 'OrderStockAllocatedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { orderStockAllocatedEventInput })

    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildProps(orderStockAllocatedEventInput)
      const orderStockAllocatedEvent = new OrderStockAllocatedEvent(eventName, eventData, createdAt, updatedAt)
      console.info(`${logContext} exit success:`, { orderStockAllocatedEvent, orderStockAllocatedEventInput })
      return orderStockAllocatedEvent
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, orderStockAllocatedEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    orderStockAllocatedEventInput: OrderStockAllocatedEventInput,
  ): OrderStockAllocatedEventProps {
    this.validateInput(orderStockAllocatedEventInput)

    const { orderId, sku, units, price, userId } = orderStockAllocatedEventInput
    const currentDate = new Date().toISOString()
    const orderStockAllocatedEventProps: OrderStockAllocatedEventProps = {
      eventName: InventoryEventName.ORDER_STOCK_ALLOCATED_EVENT,
      eventData: { orderId, sku, units, price, userId },
      createdAt: currentDate,
      updatedAt: currentDate,
    }
    return orderStockAllocatedEventProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(orderStockAllocatedEventInput: OrderStockAllocatedEventInput): void {
    const logContext = 'OrderStockAllocatedEvent.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
    })

    try {
      schema.parse(orderStockAllocatedEventInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, orderStockAllocatedEventInput })
      throw invalidArgumentsError
    }
  }
}
