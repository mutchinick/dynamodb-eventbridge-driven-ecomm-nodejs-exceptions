import { z } from 'zod'
import { InvalidArgumentsError, Result } from '../../errors/AppError'
import { AllocateOrderStockData } from '../../model/AllocateOrderStockData'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingOrderCreatedEvent } from './IncomingOrderCreatedEvent'

export type AllocateOrderStockCommandInput = {
  incomingOrderCreatedEvent: IncomingOrderCreatedEvent
}

type AllocateOrderStockCommandData = AllocateOrderStockData

type AllocateOrderStockCommandProps = {
  readonly allocateOrderStockData: AllocateOrderStockCommandData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class AllocateOrderStockCommand implements AllocateOrderStockCommandProps {
  /**
   *
   */
  private constructor(
    public readonly allocateOrderStockData: AllocateOrderStockCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    allocateOrderStockCommandInput: AllocateOrderStockCommandInput,
  ): Result<AllocateOrderStockCommand, InvalidArgumentsError> {
    const logContext = 'AllocateOrderStockCommand.validateAndBuild'
    console.info(`${logContext} init:`, { allocateOrderStockCommandInput })

    try {
      const { allocateOrderStockData, options } = this.buildProps(allocateOrderStockCommandInput)
      const allocateOrderStockCommand = new AllocateOrderStockCommand(allocateOrderStockData, options)
      console.info(`${logContext} exit success:`, { allocateOrderStockCommand, allocateOrderStockCommandInput })
      return allocateOrderStockCommand
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, allocateOrderStockCommandInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    allocateOrderStockCommandInput: AllocateOrderStockCommandInput,
  ): Result<AllocateOrderStockCommandProps, InvalidArgumentsError> {
    this.validateInput(allocateOrderStockCommandInput)

    const { incomingOrderCreatedEvent } = allocateOrderStockCommandInput
    const { sku, orderId, units } = incomingOrderCreatedEvent.eventData
    const date = new Date().toISOString()
    return {
      allocateOrderStockData: {
        sku,
        units,
        orderId,
        createdAt: date,
        updatedAt: date,
      },
      options: {},
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(
    allocateOrderStockCommandInput: AllocateOrderStockCommandInput,
  ): Result<void, InvalidArgumentsError> {
    const logContext = 'AllocateOrderStockCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      incomingOrderCreatedEvent: z.object({
        eventName: ValueValidators.validOrderCreatedEventName(),
        eventData: z.object({
          sku: ValueValidators.validSku(),
          units: ValueValidators.validUnits(),
          orderId: ValueValidators.validOrderId(),
        }),
        createdAt: ValueValidators.validCreatedAt(),
        updatedAt: ValueValidators.validUpdatedAt(),
      }),
    })

    try {
      schema.parse(allocateOrderStockCommandInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, allocateOrderStockCommandInput })
      throw invalidArgumentsError
    }
  }
}
