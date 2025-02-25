import { z } from 'zod'
import { InvalidArgumentsError, Result } from '../../errors/AppError'
import { AllocateOrderStockData } from '../../model/AllocateOrderStockData'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingOrderCreatedEvent } from './IncomingOrderCreatedEvent'

export interface AllocateOrderStockCommandInput {
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
    try {
      const { allocateOrderStockData, options } = this.buildProps(allocateOrderStockCommandInput)
      return new AllocateOrderStockCommand(allocateOrderStockData, options)
    } catch (error) {
      console.error('AllocateOrderStockCommand.validateAndBuild exit error:', { error, allocateOrderStockCommandInput })
      throw error
    }
  }

  /**
   *
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
    try {
      z.object({
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
      }).parse(allocateOrderStockCommandInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      throw invalidArgumentsError
    }
  }
}
