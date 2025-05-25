import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { PaymentAlreadyAcceptedError, PaymentAlreadyRejectedError, InvalidArgumentsError } from '../../errors/AppError'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { ValueValidators } from '../../model/ValueValidators'

export type RecordOrderPaymentCommandInput = {
  existingOrderPaymentData?: OrderPaymentData
  newOrderPaymentFields: TypeUtilsPretty<
    Pick<OrderPaymentData, 'orderId' | 'sku' | 'units' | 'price' | 'userId' | 'paymentId' | 'paymentStatus'>
  >
}

type RecordOrderPaymentCommandProps = {
  readonly commandData: OrderPaymentData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class RecordOrderPaymentCommand implements RecordOrderPaymentCommandProps {
  private static readonly ERROR_PAYMENT_ID_PREFIX = 'ERROR:ORDER_ID:'

  /**
   *
   */
  private constructor(
    public readonly commandData: OrderPaymentData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {PaymentAlreadyRejectedError}
   * @throws {PaymentAlreadyAcceptedError}
   */
  public static validateAndBuild(
    recordOrderPaymentCommandInput: RecordOrderPaymentCommandInput,
  ): RecordOrderPaymentCommand {
    const logContext = 'RecordOrderPaymentCommand.validateAndBuild'
    console.info(`${logContext} init:`, { recordOrderPaymentCommandInput })

    try {
      const { commandData, options } = this.buildProps(recordOrderPaymentCommandInput)
      const recordOrderPaymentCommand = new RecordOrderPaymentCommand(commandData, options)
      console.info(`${logContext} exit success:`, { recordOrderPaymentCommand, recordOrderPaymentCommandInput })
      return recordOrderPaymentCommand
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, recordOrderPaymentCommandInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {PaymentAlreadyRejectedError}
   * @throws {PaymentAlreadyAcceptedError}
   */
  private static buildProps(
    recordOrderPaymentCommandInput: RecordOrderPaymentCommandInput,
  ): RecordOrderPaymentCommandProps {
    this.validateInput(recordOrderPaymentCommandInput)
    const qualifiedOrderPaymentData = this.computeQualifiedOrderPaymentData(recordOrderPaymentCommandInput)
    const { orderId, sku, units, price, userId, createdAt, updatedAt } = qualifiedOrderPaymentData
    const { paymentId, paymentStatus, paymentRetries } = qualifiedOrderPaymentData
    const recordOrderPaymentCommandProps: RecordOrderPaymentCommandProps = {
      commandData: {
        orderId,
        sku,
        units,
        price,
        userId,
        createdAt,
        updatedAt,
        paymentId,
        paymentStatus,
        paymentRetries,
      },
      options: {},
    }
    return recordOrderPaymentCommandProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(recordOrderPaymentCommandInput: RecordOrderPaymentCommandInput): void {
    const logContext = 'RecordOrderPaymentCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const existingOrderPaymentDataSchema = z
      .object({
        orderId: ValueValidators.validOrderId(),
        sku: ValueValidators.validSku(),
        units: ValueValidators.validUnits(),
        price: ValueValidators.validPrice(),
        userId: ValueValidators.validUserId(),
        createdAt: ValueValidators.validCreatedAt(),
        updatedAt: ValueValidators.validUpdatedAt(),
        paymentId: ValueValidators.validPaymentId().optional(),
        paymentStatus: ValueValidators.validPaymentStatus(),
        paymentRetries: ValueValidators.validPaymentRetries(),
      })
      .optional()

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const newOrderPaymentFieldsSchema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
      paymentId: ValueValidators.validPaymentId().optional(),
      paymentStatus: ValueValidators.validPaymentStatus(),
    })

    const schema = z.object({
      existingOrderPaymentData: existingOrderPaymentDataSchema,
      newOrderPaymentFields: newOrderPaymentFieldsSchema,
    })

    try {
      schema.parse(recordOrderPaymentCommandInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, recordOrderPaymentCommandInput })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {PaymentAlreadyRejectedError}
   * @throws {PaymentAlreadyAcceptedError}
   */
  private static computeQualifiedOrderPaymentData(
    recordOrderPaymentCommandInput: RecordOrderPaymentCommandInput,
  ): OrderPaymentData {
    const logContext = 'RecordOrderPaymentCommand.computeQualifiedOrderPaymentData'

    const currentDate = new Date().toISOString()
    const { existingOrderPaymentData, newOrderPaymentFields } = recordOrderPaymentCommandInput

    const newPaymentId = newOrderPaymentFields.paymentId || this.generateErrorPaymentId(newOrderPaymentFields.orderId)

    if (!existingOrderPaymentData) {
      const qualifiedOrderPaymentData: OrderPaymentData = {
        orderId: newOrderPaymentFields.orderId,
        sku: newOrderPaymentFields.sku,
        units: newOrderPaymentFields.units,
        price: newOrderPaymentFields.price,
        userId: newOrderPaymentFields.userId,
        createdAt: currentDate,
        updatedAt: currentDate,
        paymentId: newPaymentId,
        paymentStatus: newOrderPaymentFields.paymentStatus,
        paymentRetries: 0,
      }
      return qualifiedOrderPaymentData
    }

    if (existingOrderPaymentData.paymentStatus === 'PAYMENT_REJECTED') {
      const errorMessage = `Cannot modify the record of an already rejected payment.`
      const paymentError = PaymentAlreadyRejectedError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { paymentError, recordOrderPaymentCommandInput })
      throw paymentError
    }

    if (existingOrderPaymentData.paymentStatus === 'PAYMENT_ACCEPTED') {
      const errorMessage = `Cannot modify the record of an already accepted payment.`
      const paymentError = PaymentAlreadyAcceptedError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { paymentError, recordOrderPaymentCommandInput })
      throw paymentError
    }

    const qualifiedOrderPaymentData: OrderPaymentData = {
      orderId: existingOrderPaymentData.orderId,
      sku: existingOrderPaymentData.sku,
      units: existingOrderPaymentData.units,
      price: existingOrderPaymentData.price,
      userId: existingOrderPaymentData.userId,
      createdAt: existingOrderPaymentData.createdAt,
      updatedAt: currentDate,
      paymentId: newPaymentId,
      paymentStatus: newOrderPaymentFields.paymentStatus,
      paymentRetries: existingOrderPaymentData.paymentRetries + 1,
    }
    return qualifiedOrderPaymentData
  }

  /**
   *
   */
  private static generateErrorPaymentId(orderId: string): string {
    const errorPaymentId = `${this.ERROR_PAYMENT_ID_PREFIX}${orderId}`
    return errorPaymentId
  }
}
