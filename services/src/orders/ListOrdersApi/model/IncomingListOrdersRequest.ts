import { z } from 'zod'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { ValueValidators } from '../../model/ValueValidators'
import { type SortOrder } from '../../model/SortOrder'

type IncomingListOrdersRequestData = Partial<Pick<OrderData, 'orderId'> & { sortOrder: SortOrder } & { limit: number }>

export type IncomingListOrdersRequestInput = IncomingListOrdersRequestData

type IncomingListOrdersRequestProps = IncomingListOrdersRequestData

/**
 *
 */
export class IncomingListOrdersRequest implements IncomingListOrdersRequestProps {
  /**
   *
   */
  private constructor(
    public readonly orderId?: string,
    public readonly sortOrder?: 'asc' | 'desc',
    public readonly limit?: number,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    incomingListOrdersRequestInput: IncomingListOrdersRequestInput,
  ): IncomingListOrdersRequest {
    const logContext = 'IncomingListOrdersRequest.validateAndBuild'
    console.info(`${logContext} init:`, { incomingListOrdersRequestInput })

    try {
      const { orderId, sortOrder, limit } = this.buildProps(incomingListOrdersRequestInput)
      const incomingListOrdersRequest = new IncomingListOrdersRequest(orderId, sortOrder, limit)
      console.info(`${logContext} exit success:`, { incomingListOrdersRequest, incomingListOrdersRequestInput })
      return incomingListOrdersRequest
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingListOrdersRequestInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    incomingListOrdersRequestInput: IncomingListOrdersRequestInput,
  ): IncomingListOrdersRequestProps {
    this.validateInput(incomingListOrdersRequestInput)
    const { orderId, sortOrder, limit } = incomingListOrdersRequestInput
    const incomingListOrdersRequestProps: IncomingListOrdersRequestProps = {
      orderId,
      sortOrder,
      limit,
    }
    return incomingListOrdersRequestProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(incomingListOrdersRequestInput: IncomingListOrdersRequestInput): void {
    const logContext = 'IncomingListOrdersRequest.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId().optional(),
      sortOrder: ValueValidators.validSortOrder().optional(),
      limit: ValueValidators.validLimit().optional(),
    })

    try {
      schema.parse(incomingListOrdersRequestInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingListOrdersRequestInput })
      throw invalidArgumentsError
    }
  }
}
