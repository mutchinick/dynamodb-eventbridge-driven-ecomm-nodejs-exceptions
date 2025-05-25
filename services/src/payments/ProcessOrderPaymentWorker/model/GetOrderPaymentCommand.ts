import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { ValueValidators } from '../../model/ValueValidators'

export type GetOrderPaymentCommandInput = TypeUtilsPretty<Pick<OrderPaymentData, 'orderId'>>

type GetOrderPaymentCommandData = TypeUtilsPretty<Pick<OrderPaymentData, 'orderId'>>

type GetOrderPaymentCommandProps = {
  readonly commandData: GetOrderPaymentCommandData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class GetOrderPaymentCommand implements GetOrderPaymentCommandProps {
  /**
   *
   */
  private constructor(
    public readonly commandData: GetOrderPaymentCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(getOrderPaymentCommandInput: GetOrderPaymentCommandInput): GetOrderPaymentCommand {
    const logContext = 'GetOrderPaymentCommand.validateAndBuild'
    console.info(`${logContext} init:`, { getOrderPaymentCommandInput })

    try {
      const { commandData, options } = this.buildProps(getOrderPaymentCommandInput)
      const getOrderPaymentCommand = new GetOrderPaymentCommand(commandData, options)
      console.info(`${logContext} exit success:`, { getOrderPaymentCommand })
      return getOrderPaymentCommand
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, getOrderPaymentCommandInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(getOrderPaymentCommandInput: GetOrderPaymentCommandInput): GetOrderPaymentCommandProps {
    this.validateInput(getOrderPaymentCommandInput)

    const { orderId } = getOrderPaymentCommandInput
    const getOrderPaymentCommandProps: GetOrderPaymentCommandProps = {
      commandData: { orderId },
      options: {},
    }
    return getOrderPaymentCommandProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(getOrderPaymentCommandInput: GetOrderPaymentCommandInput): void {
    const logContext = 'GetOrderPaymentCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
    })

    try {
      schema.parse(getOrderPaymentCommandInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, getOrderPaymentCommandInput })
      throw invalidArgumentsError
    }
  }
}
