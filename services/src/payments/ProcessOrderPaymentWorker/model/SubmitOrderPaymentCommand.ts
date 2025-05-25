import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { PaymentAlreadyAcceptedError, PaymentAlreadyRejectedError, InvalidArgumentsError } from '../../errors/AppError'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { ValueValidators } from '../../model/ValueValidators'

export type SubmitOrderPaymentCommandInput = TypeUtilsPretty<
  Pick<OrderPaymentData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'> & {
    existingPaymentStatus?: OrderPaymentData['paymentStatus']
  }
>

type SubmitOrderPaymentCommandData = TypeUtilsPretty<
  Pick<OrderPaymentData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>
>

type SubmitOrderPaymentCommandProps = {
  readonly commandData: SubmitOrderPaymentCommandData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class SubmitOrderPaymentCommand implements SubmitOrderPaymentCommandProps {
  /**
   *
   */
  private constructor(
    public readonly commandData: SubmitOrderPaymentCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {PaymentAlreadyRejectedError}
   * @throws {PaymentAlreadyAcceptedError}
   */
  public static validateAndBuild(
    submitOrderPaymentCommandInput: SubmitOrderPaymentCommandInput,
  ): SubmitOrderPaymentCommand {
    const logContext = 'SubmitOrderPaymentCommand.validateAndBuild'
    console.info(`${logContext} init:`, { submitOrderPaymentCommandInput })

    try {
      const { commandData, options } = this.buildProps(submitOrderPaymentCommandInput)
      const submitOrderPaymentCommand = new SubmitOrderPaymentCommand(commandData, options)
      console.info(`${logContext} exit success:`, { submitOrderPaymentCommand, submitOrderPaymentCommandInput })
      return submitOrderPaymentCommand
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, submitOrderPaymentCommandInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {PaymentAlreadyRejectedError}
   * @throws {PaymentAlreadyAcceptedError}
   */
  private static buildProps(
    submitOrderPaymentCommandInput: SubmitOrderPaymentCommandInput,
  ): SubmitOrderPaymentCommandProps {
    this.validateInput(submitOrderPaymentCommandInput)
    this.validatePaymentStatus(submitOrderPaymentCommandInput)
    const { orderId, sku, units, price, userId } = submitOrderPaymentCommandInput
    const submitOrderPaymentCommandProps: SubmitOrderPaymentCommandProps = {
      commandData: {
        orderId,
        sku,
        units,
        price,
        userId,
      },
      options: {},
    }
    return submitOrderPaymentCommandProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(submitOrderPaymentCommandInput: SubmitOrderPaymentCommandInput): void {
    const logContext = 'SubmitOrderPaymentCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
      existingPaymentStatus: ValueValidators.validPaymentStatus().optional(),
    })

    try {
      schema.parse(submitOrderPaymentCommandInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, submitOrderPaymentCommandInput })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {PaymentAlreadyRejectedError}
   * @throws {PaymentAlreadyAcceptedError}
   */
  private static validatePaymentStatus(submitOrderPaymentCommandInput: SubmitOrderPaymentCommandInput): void {
    const logContext = 'SubmitOrderPaymentCommand.validatePaymentStatus'

    if (submitOrderPaymentCommandInput.existingPaymentStatus === 'PAYMENT_REJECTED') {
      const errorMessage = `Cannot modify the record of an already rejected payment.`
      const paymentError = PaymentAlreadyRejectedError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { paymentError, submitOrderPaymentCommandInput })
      throw paymentError
    }

    if (submitOrderPaymentCommandInput.existingPaymentStatus === 'PAYMENT_ACCEPTED') {
      const errorMessage = `Cannot modify the record of an already accepted payment.`
      const paymentError = PaymentAlreadyAcceptedError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { paymentError, submitOrderPaymentCommandInput })
      throw paymentError
    }
  }
}
