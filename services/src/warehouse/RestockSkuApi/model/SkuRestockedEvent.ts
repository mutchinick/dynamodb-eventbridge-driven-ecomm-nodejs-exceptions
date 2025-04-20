import { z } from 'zod'
import { InvalidArgumentsError } from '../../errors/AppError'
import { RestockSkuData } from '../../model/RestockSkuData'
import { ValueValidators } from '../../model/ValueValidators'
import { WarehouseEvent } from '../../model/WarehouseEvent'
import { WarehouseEventName } from '../../model/WarehouseEventName'

type SkuRestockedEventData = Pick<RestockSkuData, 'sku' | 'units' | 'lotId'>

export type SkuRestockedEventInput = Pick<RestockSkuData, 'sku' | 'units' | 'lotId'>

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
  public static validateAndBuild(skuRestockedEventInput: SkuRestockedEventInput): SkuRestockedEvent {
    const logContext = 'SkuRestockedEvent.validateAndBuild'
    console.info(`${logContext} init:`, { skuRestockedEventInput })

    try {
      const { eventName, eventData, createdAt, updatedAt } = this.buildProps(skuRestockedEventInput)
      const skuRestockedEvent = new SkuRestockedEvent(eventName, eventData, createdAt, updatedAt)
      console.info(`${logContext} exit success:`, { skuRestockedEvent, skuRestockedEventInput })
      return skuRestockedEvent
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, skuRestockedEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(skuRestockedEventInput: SkuRestockedEventInput): SkuRestockedEventProps {
    this.validateInput(skuRestockedEventInput)

    const { sku, units, lotId } = skuRestockedEventInput
    const date = new Date().toISOString()
    const skuRestockedEventProps: SkuRestockedEventProps = {
      eventName: WarehouseEventName.SKU_RESTOCKED_EVENT,
      eventData: { sku, units, lotId },
      createdAt: date,
      updatedAt: date,
    }
    return skuRestockedEventProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(skuRestockedEventInput: SkuRestockedEventData): void {
    const logContext = 'SkuRestockedEvent.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      lotId: ValueValidators.validLotId(),
    })

    try {
      schema.parse(skuRestockedEventInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, skuRestockedEventInput })
      throw invalidArgumentsError
    }
  }
}
