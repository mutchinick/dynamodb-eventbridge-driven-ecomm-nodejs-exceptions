import { z } from 'zod'
import { InvalidArgumentsError } from '../../errors/AppError'
import { RestockSkuData } from '../../model/RestockSkuData'
import { ValueValidators } from '../../model/ValueValidators'
import { type SortDirection } from '../../model/SortDirection'

type IncomingListSkusRequestData = Partial<
  Pick<RestockSkuData, 'sku'> & { sortDirection: SortDirection } & { limit: number }
>

export type IncomingListSkusRequestInput = IncomingListSkusRequestData

type IncomingListSkusRequestProps = IncomingListSkusRequestData

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
