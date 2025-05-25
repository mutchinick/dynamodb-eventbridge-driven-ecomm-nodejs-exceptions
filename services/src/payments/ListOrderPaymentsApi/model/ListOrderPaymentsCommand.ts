import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { SortParams } from '../../model/SortParams'
import { ValueValidators } from '../../model/ValueValidators'

export type ListOrderPaymentsCommandInput = TypeUtilsPretty<Partial<Pick<OrderPaymentData, 'orderId'> & SortParams>>

type ListOrderPaymentsCommandData = TypeUtilsPretty<Partial<Pick<OrderPaymentData, 'orderId'> & SortParams>>

type ListOrderPaymentsCommandProps = {
  readonly commandData: ListOrderPaymentsCommandData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class ListOrderPaymentsCommand implements ListOrderPaymentsCommandProps {
  /**
   *
   */
  private constructor(
    public readonly commandData: ListOrderPaymentsCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    listOrderPaymentsCommandInput: ListOrderPaymentsCommandInput,
  ): ListOrderPaymentsCommand {
    const logContext = 'ListOrderPaymentsCommand.validateAndBuild'
    console.info(`${logContext} init:`, { listOrderPaymentsCommandInput })

    try {
      const { commandData, options } = this.buildProps(listOrderPaymentsCommandInput)
      const listOrderPaymentsCommand = new ListOrderPaymentsCommand(commandData, options)
      console.info(`${logContext} exit success:`, { listOrderPaymentsCommand, listOrderPaymentsCommandInput })
      return listOrderPaymentsCommand
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, listOrderPaymentsCommandInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    listOrderPaymentsCommandInput: ListOrderPaymentsCommandInput,
  ): ListOrderPaymentsCommandProps {
    this.validateInput(listOrderPaymentsCommandInput)

    const { orderId, sortDirection, limit } = listOrderPaymentsCommandInput
    const listOrderPaymentsCommandProps: ListOrderPaymentsCommandProps = {
      commandData: { orderId, sortDirection, limit },
      options: {},
    }
    return listOrderPaymentsCommandProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(listOrderPaymentsCommandInput: ListOrderPaymentsCommandInput): void {
    const logContext = 'ListOrderPaymentsCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId().optional(),
      sortDirection: ValueValidators.validSortDirection().optional(),
      limit: ValueValidators.validLimit().optional(),
    })

    try {
      schema.parse(listOrderPaymentsCommandInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, listOrderPaymentsCommandInput })
      throw invalidArgumentsError
    }
  }
}
