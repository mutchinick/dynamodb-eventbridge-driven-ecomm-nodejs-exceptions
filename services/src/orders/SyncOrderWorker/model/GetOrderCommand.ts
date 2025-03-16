import { z } from 'zod'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { ValueValidators } from '../../model/ValueValidators'

export type GetOrderCommandInput = Pick<OrderData, 'orderId'>

type GetOrderCommandProps = {
  readonly orderId: string
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class GetOrderCommand implements GetOrderCommandProps {
  /**
   *
   */
  private constructor(
    public readonly orderId: string,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(getOrderCommandInput: GetOrderCommandInput): GetOrderCommand {
    const logContext = 'GetOrderCommand.validateAndBuild'
    console.info(`${logContext} init:`, { getOrderCommandInput })

    try {
      const { orderId, options } = this.buildProps(getOrderCommandInput)
      const getOrderCommand = new GetOrderCommand(orderId, options)
      console.info(`${logContext} exit success:`, { getOrderCommand, getOrderCommandInput })
      return getOrderCommand
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, getOrderCommandInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(getOrderCommandInput: GetOrderCommandInput): GetOrderCommandProps {
    this.validateInput(getOrderCommandInput)

    const { orderId } = getOrderCommandInput
    return {
      orderId,
      options: {},
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(getOrderCommandInput: GetOrderCommandInput): void {
    const logContext = 'GetOrderCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
    })

    try {
      schema.parse(getOrderCommandInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, getOrderCommandInput })
      throw invalidArgumentsError
    }
  }
}
