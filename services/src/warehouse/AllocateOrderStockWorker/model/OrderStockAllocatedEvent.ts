import { z } from 'zod'
import { InvalidArgumentsError, Result } from '../../errors/AppError'
import { AllocateOrderStockData } from '../../model/AllocateOrderStockData'
import { ValueValidators } from '../../model/ValueValidators'
import { WarehouseEvent } from '../../model/WarehouseEvent'
import { WarehouseEventName } from '../../model/WarehouseEventName'

export type OrderStockAllocatedEventData = Pick<AllocateOrderStockData, 'orderId' | 'sku' | 'units'>

export type OrderStockAllocatedEventInput = OrderStockAllocatedEventData

type OrderStockAllocatedEventProps = WarehouseEvent<
  WarehouseEventName.ORDER_STOCK_ALLOCATED_EVENT,
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
    public readonly eventName: WarehouseEventName.ORDER_STOCK_ALLOCATED_EVENT,
    public readonly eventData: OrderStockAllocatedEventData,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    orderStockAllocatedEventInput: OrderStockAllocatedEventInput,
  ): Result<OrderStockAllocatedEvent, InvalidArgumentsError> {
    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildProps(orderStockAllocatedEventInput)
      return new OrderStockAllocatedEvent(eventName, eventData, createdAt, updatedAt)
    } catch (error) {
      console.error('OrderStockAllocatedEvent.validateAndBuild', { error, orderStockAllocatedEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    orderStockAllocatedEventInput: OrderStockAllocatedEventInput,
  ): Result<OrderStockAllocatedEventProps, InvalidArgumentsError> {
    try {
      z.object({
        orderId: ValueValidators.validOrderId(),
        sku: ValueValidators.validSku(),
        units: ValueValidators.validUnits(),
      }).parse(orderStockAllocatedEventInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      throw invalidArgumentsError
    }

    const { orderId, sku, units } = orderStockAllocatedEventInput
    const date = new Date().toISOString()
    const orderStockAllocatedEventData: OrderStockAllocatedEventData = {
      orderId,
      sku,
      units,
    }

    return {
      eventName: WarehouseEventName.ORDER_STOCK_ALLOCATED_EVENT,
      eventData: orderStockAllocatedEventData,
      createdAt: date,
      updatedAt: date,
    }
  }
}
