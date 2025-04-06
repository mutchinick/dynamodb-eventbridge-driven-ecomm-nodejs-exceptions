import { z } from 'zod'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { ValueValidators } from '../../model/ValueValidators'

export type GetOrderAllocationCommandInput = Pick<OrderAllocationData, 'orderId' | 'sku'>

export type GetOrderAllocationCommandData = Pick<OrderAllocationData, 'orderId' | 'sku'>

type GetOrderAllocationCommandProps = {
  readonly commandData: GetOrderAllocationCommandData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class GetOrderAllocationCommand implements GetOrderAllocationCommandProps {
  /**
   *
   */
  private constructor(
    public readonly commandData: GetOrderAllocationCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    getOrderAllocationCommandInput: GetOrderAllocationCommandInput,
  ): GetOrderAllocationCommand {
    const logContext = 'GetOrderAllocationCommand.validateAndBuild'
    console.info(`${logContext} init:`, { getOrderAllocationCommandInput })

    try {
      const { commandData, options } = this.buildProps(getOrderAllocationCommandInput)
      const getOrderAllocationCommand = new GetOrderAllocationCommand(commandData, options)
      console.info(`${logContext} exit success:`, { getOrderAllocationCommand })
      return getOrderAllocationCommand
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, getOrderAllocationCommandInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    getOrderAllocationCommandInput: GetOrderAllocationCommandInput,
  ): GetOrderAllocationCommandProps {
    this.validateInput(getOrderAllocationCommandInput)

    const { orderId, sku } = getOrderAllocationCommandInput
    const getOrderAllocationCommandProps: GetOrderAllocationCommandProps = {
      commandData: { orderId, sku },
      options: {},
    }
    return getOrderAllocationCommandProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(getOrderAllocationCommandInput: GetOrderAllocationCommandInput): void {
    const logContext = 'GetOrderAllocationCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
    })

    try {
      schema.parse(getOrderAllocationCommandInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, getOrderAllocationCommandInput })
      throw invalidArgumentsError
    }
  }
}
