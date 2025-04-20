import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { RestockSkuData } from '../../model/RestockSkuData'
import { SortParams } from '../../model/SortParams'
import { ValueValidators } from '../../model/ValueValidators'

export type ListSkusCommandInput = TypeUtilsPretty<Partial<Pick<RestockSkuData, 'sku'> & SortParams>>

type ListSkusCommandData = TypeUtilsPretty<Partial<Pick<RestockSkuData, 'sku'> & SortParams>>

type ListSkusCommandProps = {
  readonly commandData: ListSkusCommandData
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
    public readonly commandData: ListSkusCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(listSkusCommandInput: ListSkusCommandInput): ListSkusCommand {
    const logContext = 'ListSkusCommand.validateAndBuild'
    console.info(`${logContext} init:`, { listSkusCommandInput })

    try {
      const { commandData, options } = this.buildProps(listSkusCommandInput)
      const listSkusCommand = new ListSkusCommand(commandData, options)
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

    const { sku, sortDirection, limit } = listSkusCommandInput
    const listSkusCommandProps: ListSkusCommandProps = {
      commandData: { sku, sortDirection, limit },
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
      sortDirection: ValueValidators.validSortDirection().optional(),
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
