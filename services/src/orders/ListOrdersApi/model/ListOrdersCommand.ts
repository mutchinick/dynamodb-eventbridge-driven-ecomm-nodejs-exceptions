import { z } from 'zod'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { ValueValidators } from '../../model/ValueValidators'
import { SortOrder } from '../../model/SortOrder'

type ListOrdersCommandQueryData = Partial<Pick<OrderData, 'orderId'> & { sortOrder: SortOrder } & { limit: number }>

export type ListOrdersCommandInput = ListOrdersCommandQueryData

type ListOrdersCommandProps = {
  readonly queryData: ListOrdersCommandQueryData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class ListOrdersCommand implements ListOrdersCommandProps {
  /**
   *
   */
  private constructor(
    public readonly queryData: ListOrdersCommandQueryData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(listOrdersCommandInput: ListOrdersCommandInput): ListOrdersCommand {
    const logContext = 'ListOrdersCommand.validateAndBuild'
    console.info(`${logContext} init:`, { listOrdersCommandInput })

    try {
      const { queryData, options } = this.buildProps(listOrdersCommandInput)
      const listOrdersCommand = new ListOrdersCommand(queryData, options)
      console.info(`${logContext} exit success:`, { listOrdersCommand, listOrdersCommandInput })
      return listOrdersCommand
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, listOrdersCommandInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(listOrdersCommandInput: ListOrdersCommandInput): ListOrdersCommandProps {
    this.validateInput(listOrdersCommandInput)

    const { orderId, sortOrder, limit } = listOrdersCommandInput
    const listOrdersCommandProps: ListOrdersCommandProps = {
      queryData: { orderId, sortOrder, limit },
      options: {},
    }
    return listOrdersCommandProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(listOrdersCommandInput: ListOrdersCommandInput): void {
    const logContext = 'ListOrdersCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId().optional(),
      sortOrder: ValueValidators.validSortOrder().optional(),
      limit: ValueValidators.validLimit().optional(),
    })

    try {
      schema.parse(listOrdersCommandInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, listOrdersCommandInput })
      throw invalidArgumentsError
    }
  }
}
