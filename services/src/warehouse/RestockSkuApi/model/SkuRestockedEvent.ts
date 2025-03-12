import { z } from 'zod'
import { InvalidArgumentsError, Result } from '../../errors/AppError'
import { RestockSkuData } from '../../model/RestockSkuData'
import { ValueValidators } from '../../model/ValueValidators'
import { WarehouseEvent } from '../../model/WarehouseEvent'
import { WarehouseEventName } from '../../model/WarehouseEventName'

export type SkuRestockedEventData = Pick<RestockSkuData, 'sku' | 'units' | 'lotId'>

export type SkuRestockedEventInput = SkuRestockedEventData

type SkuRestockedEventProps = WarehouseEvent<WarehouseEventName.SKU_RESTOCKED_EVENT, SkuRestockedEventData>

/**
 *
 */
export class SkuRestockedEvent implements SkuRestockedEventProps {
  /**
   *
   */
  private constructor(
    public readonly eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
    public readonly eventData: SkuRestockedEventData,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    skuRestockedEventInput: SkuRestockedEventInput,
  ): Result<SkuRestockedEvent, InvalidArgumentsError> {
    const logContext = 'SkuRestockedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { skuRestockedEventInput })

    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildProps(skuRestockedEventInput)
      const skuRestockedEvent = new SkuRestockedEvent(eventName, eventData, createdAt, updatedAt)
      console.info(`${logContext} exit success:`, { skuRestockedEventInput })
      return skuRestockedEvent
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
      console.error(`${logContext} exit error:`, { error, skuRestockedEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    skuRestockedEventInput: SkuRestockedEventInput,
  ): Result<SkuRestockedEventProps, InvalidArgumentsError> {
    const logContext = 'SkuRestockedEvent.buildProps'

    try {
      this.validateInput(skuRestockedEventInput)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, skuRestockedEventInput })
      throw invalidArgumentsError
    }

    const { sku, units, lotId } = skuRestockedEventInput
    const date = new Date().toISOString()
    return {
      eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
      eventData: { sku, units, lotId },
      createdAt: date,
      updatedAt: date,
    }
  }

  /**
   *
   */
  private static validateInput(skuRestockedEventInput: SkuRestockedEventData): void {
    z.object({
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      lotId: ValueValidators.validLotId(),
    }).parse(skuRestockedEventInput)
  }
}
