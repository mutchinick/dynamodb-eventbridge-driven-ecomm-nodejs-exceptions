import { z } from 'zod'
import { InvalidArgumentsError } from '../../errors/AppError'
import { RestockSkuData } from '../../model/RestockSkuData'
import { SortOrder } from '../../model/SortOrder'
import { ValueValidators } from '../../model/ValueValidators'

type ListSkusCommandQueryData = Partial<Pick<RestockSkuData, 'sku'> & { sortOrder: SortOrder } & { limit: number }>

export type ListSkusCommandInput = ListSkusCommandQueryData

type ListSkusCommandProps = {
  readonly queryData: ListSkusCommandQueryData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class ListSkusCommand implements ListSkusCommandProps {
  /**
   *
   */
  private constructor(
    public readonly queryData: ListSkusCommandQueryData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(listSkusCommandInput: ListSkusCommandInput): ListSkusCommand {
    const logContext = 'ListSkusCommand.validateAndBuild'
    console.info(`${logContext} init:`, { listSkusCommandInput })

    try {
      const { queryData, options } = this.buildProps(listSkusCommandInput)
      const listSkusCommand = new ListSkusCommand(queryData, options)
      console.info(`${logContext} exit success:`, { listSkusCommand, listSkusCommandInput })
      return listSkusCommand
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, listSkusCommandInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(listSkusCommandInput: ListSkusCommandInput): ListSkusCommandProps {
    this.validateInput(listSkusCommandInput)

    const { sku, sortOrder, limit } = listSkusCommandInput
    const listSkusCommandProps: ListSkusCommandProps = {
      queryData: { sku, sortOrder, limit },
      options: {},
    }
    return listSkusCommandProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(listSkusCommandInput: ListSkusCommandInput): void {
    const logContext = 'ListSkusCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      sku: ValueValidators.validSku().optional(),
      sortOrder: ValueValidators.validSortOrder().optional(),
      limit: ValueValidators.validLimit().optional(),
    })

    try {
      schema.parse(listSkusCommandInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, listSkusCommandInput })
      throw invalidArgumentsError
    }
  }
}
