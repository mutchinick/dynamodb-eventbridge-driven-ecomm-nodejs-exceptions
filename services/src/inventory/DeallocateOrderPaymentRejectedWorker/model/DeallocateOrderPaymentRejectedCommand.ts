import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { AllocationStatus } from '../../model/AllocationStatus'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { ValueValidators } from '../../model/ValueValidators'
import { InventoryEventName } from '../../model/InventoryEventName'
import { IncomingOrderPaymentRejectedEvent } from './IncomingOrderPaymentRejectedEvent'

export type DeallocateOrderPaymentRejectedCommandInput = {
  existingOrderAllocationData: OrderAllocationData
  incomingOrderPaymentRejectedEvent: IncomingOrderPaymentRejectedEvent
}

type DeallocateOrderPaymentRejectedCommandData = TypeUtilsPretty<
  Pick<OrderAllocationData, 'orderId' | 'sku' | 'units' | 'updatedAt' | 'allocationStatus'> & {
    allocationStatus: AllocationStatus<'PAYMENT_REJECTED'>
    expectedAllocationStatus: AllocationStatus<'ALLOCATED'>
  }
>

type DeallocateOrderPaymentRejectedCommandProps = {
  readonly commandData: DeallocateOrderPaymentRejectedCommandData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class DeallocateOrderPaymentRejectedCommand implements DeallocateOrderPaymentRejectedCommandProps {
  /**
   *
   */
  private constructor(
    public readonly commandData: DeallocateOrderPaymentRejectedCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    deallocateOrderPaymentRejectedCommandInput: DeallocateOrderPaymentRejectedCommandInput,
  ): DeallocateOrderPaymentRejectedCommand {
    const logContext = 'DeallocateOrderPaymentRejectedCommand.validateAndBuild'
    console.info(`${logContext} init:`, { deallocateOrderPaymentRejectedCommandInput })

    try {
      const { commandData, options } = this.buildProps(deallocateOrderPaymentRejectedCommandInput)
      const deallocateOrderPaymentRejectedCommand = new DeallocateOrderPaymentRejectedCommand(commandData, options)
      console.info(`${logContext} exit success:`, { deallocateOrderPaymentRejectedCommand })
      return deallocateOrderPaymentRejectedCommand
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, deallocateOrderPaymentRejectedCommandInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    deallocateOrderPaymentRejectedCommandInput: DeallocateOrderPaymentRejectedCommandInput,
  ): DeallocateOrderPaymentRejectedCommandProps {
    this.validateInput(deallocateOrderPaymentRejectedCommandInput)

    const { existingOrderAllocationData } = deallocateOrderPaymentRejectedCommandInput
    const { incomingOrderPaymentRejectedEvent } = deallocateOrderPaymentRejectedCommandInput
    const currentDate = new Date().toISOString()
    const deallocateOrderPaymentRejectedCommandProps: DeallocateOrderPaymentRejectedCommandProps = {
      commandData: {
        orderId: incomingOrderPaymentRejectedEvent.eventData.orderId,
        sku: incomingOrderPaymentRejectedEvent.eventData.sku,
        units: existingOrderAllocationData.units,
        updatedAt: currentDate,
        allocationStatus: 'PAYMENT_REJECTED',
        expectedAllocationStatus: 'ALLOCATED',
      },
      options: {},
    }
    return deallocateOrderPaymentRejectedCommandProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(
    deallocateOrderPaymentRejectedCommandInput: DeallocateOrderPaymentRejectedCommandInput,
  ): void {
    const logContext = 'DeallocateOrderPaymentRejectedCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const existingOrderAllocationDataSchema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
      createdAt: ValueValidators.validCreatedAt(),
      updatedAt: ValueValidators.validUpdatedAt(),
      allocationStatus: ValueValidators.validAllocationStatus('ALLOCATED'),
    })

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const incomingOrderPaymentRejectedEventSchema = z.object({
      eventName: ValueValidators.validOrderEventNameGroup([InventoryEventName.ORDER_PAYMENT_REJECTED_EVENT]),
      eventData: z.object({
        orderId: ValueValidators.validOrderId(),
        sku: ValueValidators.validSku(),
        units: ValueValidators.validUnits(),
        price: ValueValidators.validPrice(),
        userId: ValueValidators.validUserId(),
      }),
      createdAt: ValueValidators.validCreatedAt(),
      updatedAt: ValueValidators.validUpdatedAt(),
    })

    const schema = z.object({
      existingOrderAllocationData: existingOrderAllocationDataSchema,
      incomingOrderPaymentRejectedEvent: incomingOrderPaymentRejectedEventSchema,
    })

    try {
      schema.parse(deallocateOrderPaymentRejectedCommandInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, deallocateOrderPaymentRejectedCommandInput })
      throw invalidArgumentsError
    }
  }
}
