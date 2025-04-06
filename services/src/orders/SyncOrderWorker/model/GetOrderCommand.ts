import { z } from 'zod'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { ValueValidators } from '../../model/ValueValidators'

export type GetOrderCommandInput = Pick<OrderData, 'orderId'>

type GetOrderCommandData = Pick<OrderData, 'orderId'>

type GetOrderCommandProps = {
  readonly commandData: GetOrderCommandData
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
    public readonly commandData: GetOrderCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(getOrderCommandInput: GetOrderCommandInput): GetOrderCommand {
    const logContext = 'GetOrderCommand.validateAndBuild'
    console.info(`${logContext} init:`, { getOrderCommandInput })

    try {
      const { commandData, options } = this.buildProps(getOrderCommandInput)
      const getOrderCommand = new GetOrderCommand(commandData, options)
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
    const getOrderCommandProps: GetOrderCommandProps = {
      commandData: { orderId },
      options: {},
    }
    return getOrderCommandProps
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
