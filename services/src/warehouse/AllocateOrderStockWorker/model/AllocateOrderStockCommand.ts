import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { AllocationStatus } from '../../model/AllocationStatus'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingOrderCreatedEvent } from './IncomingOrderCreatedEvent'

export type AllocateOrderStockCommandInput = {
  incomingOrderCreatedEvent: IncomingOrderCreatedEvent
}

type AllocateOrderStockCommandData = TypeUtilsPretty<
  OrderAllocationData & {
    allocationStatus: AllocationStatus<'ALLOCATED'>
  }
>

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
  ): AllocateOrderStockCommand {
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
  ): AllocateOrderStockCommandProps {
    this.validateInput(allocateOrderStockCommandInput)

    const { incomingOrderCreatedEvent } = allocateOrderStockCommandInput
    const { orderId, sku, units, price, userId } = incomingOrderCreatedEvent.eventData
    const date = new Date().toISOString()
    const allocateOrderStockCommandProps: AllocateOrderStockCommandProps = {
      allocateOrderStockData: {
        orderId,
        sku,
        units,
        price,
        userId,
        createdAt: date,
        updatedAt: date,
        allocationStatus: 'ALLOCATED',
      },
      options: {},
    }
    return allocateOrderStockCommandProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(allocateOrderStockCommandInput: AllocateOrderStockCommandInput): void {
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
