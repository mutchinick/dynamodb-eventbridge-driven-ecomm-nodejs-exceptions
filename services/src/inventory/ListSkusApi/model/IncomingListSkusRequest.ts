import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { SkuData } from '../../model/SkuData'
import { SortParams } from '../../model/SortParams'
import { ValueValidators } from '../../model/ValueValidators'

export type IncomingListSkusRequestInput = TypeUtilsPretty<Partial<Pick<SkuData, 'sku'> & SortParams>>

type IncomingListSkusRequestProps = TypeUtilsPretty<Partial<Pick<SkuData, 'sku'> & SortParams>>

/**
 *
 */
export class IncomingListSkusRequest implements IncomingListSkusRequestProps {
  /**
   *
   */
  private constructor(
    public readonly sku?: string,
    public readonly sortDirection?: 'asc' | 'desc',
    public readonly limit?: number,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(incomingListSkusRequestInput: IncomingListSkusRequestInput): IncomingListSkusRequest {
    const logContext = 'IncomingListSkusRequest.validateAndBuild'
    console.info(`${logContext} init:`, { incomingListSkusRequestInput })

    try {
      const { sku, sortDirection, limit } = this.buildProps(incomingListSkusRequestInput)
      const incomingListSkusRequest = new IncomingListSkusRequest(sku, sortDirection, limit)
      console.info(`${logContext} exit success:`, { incomingListSkusRequest, incomingListSkusRequestInput })
      return incomingListSkusRequest
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingListSkusRequestInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(incomingListSkusRequestInput: IncomingListSkusRequestInput): IncomingListSkusRequestProps {
    this.validateInput(incomingListSkusRequestInput)
    const { sku, sortDirection, limit } = incomingListSkusRequestInput
    const incomingListSkusRequestProps: IncomingListSkusRequestProps = {
      sku,
      sortDirection,
      limit,
    }
    return incomingListSkusRequestProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(incomingListSkusRequestInput: IncomingListSkusRequestInput): void {
    const logContext = 'IncomingListSkusRequest.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      sku: ValueValidators.validSku().optional(),
      sortDirection: ValueValidators.validSortDirection().optional(),
      limit: ValueValidators.validLimit().optional(),
    })

    try {
      schema.parse(incomingListSkusRequestInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingListSkusRequestInput })
      throw invalidArgumentsError
    }
  }
}
