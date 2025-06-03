import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { FixedAllocationStatus } from '../../model/AllocationStatus'
import { InventoryEventName } from '../../model/InventoryEventName'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingOrderPaymentAcceptedEvent } from './IncomingOrderPaymentAcceptedEvent'

export type CompleteOrderPaymentAcceptedCommandInput = {
  existingOrderAllocationData: OrderAllocationData
  incomingOrderPaymentAcceptedEvent: IncomingOrderPaymentAcceptedEvent
}

type CompleteOrderPaymentAcceptedCommandData = TypeUtilsPretty<
  Pick<OrderAllocationData, 'orderId' | 'sku' | 'units' | 'updatedAt' | 'allocationStatus'> & {
    allocationStatus: FixedAllocationStatus<'COMPLETED_PAYMENT_ACCEPTED'>
    expectedAllocationStatus: FixedAllocationStatus<'ALLOCATED'>
  }
>

type CompleteOrderPaymentAcceptedCommandProps = {
  readonly commandData: CompleteOrderPaymentAcceptedCommandData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class CompleteOrderPaymentAcceptedCommand implements CompleteOrderPaymentAcceptedCommandProps {
  /**
   *
   */
  private constructor(
    public readonly commandData: CompleteOrderPaymentAcceptedCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    completeOrderPaymentAcceptedCommandInput: CompleteOrderPaymentAcceptedCommandInput,
  ): CompleteOrderPaymentAcceptedCommand {
    const logContext = 'CompleteOrderPaymentAcceptedCommand.validateAndBuild'
    console.info(`${logContext} init:`, { completeOrderPaymentAcceptedCommandInput })

    try {
      const { commandData, options } = this.buildProps(completeOrderPaymentAcceptedCommandInput)
      const completeOrderPaymentAcceptedCommand = new CompleteOrderPaymentAcceptedCommand(commandData, options)
      console.info(`${logContext} exit success:`, { completeOrderPaymentAcceptedCommand })
      return completeOrderPaymentAcceptedCommand
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, completeOrderPaymentAcceptedCommandInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    completeOrderPaymentAcceptedCommandInput: CompleteOrderPaymentAcceptedCommandInput,
  ): CompleteOrderPaymentAcceptedCommandProps {
    this.validateInput(completeOrderPaymentAcceptedCommandInput)

    const { existingOrderAllocationData } = completeOrderPaymentAcceptedCommandInput
    const { incomingOrderPaymentAcceptedEvent } = completeOrderPaymentAcceptedCommandInput
    const currentDate = new Date().toISOString()
    const completeOrderPaymentAcceptedCommandProps: CompleteOrderPaymentAcceptedCommandProps = {
      commandData: {
        orderId: incomingOrderPaymentAcceptedEvent.eventData.orderId,
        sku: incomingOrderPaymentAcceptedEvent.eventData.sku,
        units: existingOrderAllocationData.units,
        updatedAt: currentDate,
        allocationStatus: 'COMPLETED_PAYMENT_ACCEPTED',
        expectedAllocationStatus: 'ALLOCATED',
      },
      options: {},
    }
    return completeOrderPaymentAcceptedCommandProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(
    completeOrderPaymentAcceptedCommandInput: CompleteOrderPaymentAcceptedCommandInput,
  ): void {
    const logContext = 'CompleteOrderPaymentAcceptedCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const existingOrderAllocationDataSchema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
      createdAt: ValueValidators.validCreatedAt(),
      updatedAt: ValueValidators.validUpdatedAt(),
      allocationStatus: ValueValidators.validAllocationStatus().and(z.literal('ALLOCATED')),
    })

    // COMBAK: Maybe some schemas can be converted to shared models at some point
    const incomingOrderPaymentAcceptedEventSchema = z.object({
      eventName: ValueValidators.validInventoryEventNameLiteral(InventoryEventName.ORDER_PAYMENT_ACCEPTED_EVENT),
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
      incomingOrderPaymentAcceptedEvent: incomingOrderPaymentAcceptedEventSchema,
    })

    try {
      schema.parse(completeOrderPaymentAcceptedCommandInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, completeOrderPaymentAcceptedCommandInput })
      throw invalidArgumentsError
    }
  }
}
