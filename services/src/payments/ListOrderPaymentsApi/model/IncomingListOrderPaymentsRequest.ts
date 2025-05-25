import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { SortParams } from '../../model/SortParams'
import { ValueValidators } from '../../model/ValueValidators'

export type IncomingListOrderPaymentsRequestInput = TypeUtilsPretty<
  Partial<Pick<OrderPaymentData, 'orderId'> & SortParams>
>

type IncomingListOrderPaymentsRequestProps = TypeUtilsPretty<Partial<Pick<OrderPaymentData, 'orderId'> & SortParams>>

/**
 *
 */
export class IncomingListOrderPaymentsRequest implements IncomingListOrderPaymentsRequestProps {
  /**
   *
   */
  private constructor(
    public readonly orderId?: string,
    public readonly sortDirection?: 'asc' | 'desc',
    public readonly limit?: number,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    incomingListOrderPaymentsRequestInput: IncomingListOrderPaymentsRequestInput,
  ): IncomingListOrderPaymentsRequest {
    const logContext = 'IncomingListOrderPaymentsRequest.validateAndBuild'
    console.info(`${logContext} init:`, { incomingListOrderPaymentsRequestInput })

    try {
      const { orderId, sortDirection, limit } = this.buildProps(incomingListOrderPaymentsRequestInput)
      const incomingListOrderPaymentsRequest = new IncomingListOrderPaymentsRequest(orderId, sortDirection, limit)
      console.info(`${logContext} exit success:`, {
        incomingListOrderPaymentsRequest,
        incomingListOrderPaymentsRequestInput,
      })
      return incomingListOrderPaymentsRequest
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingListOrderPaymentsRequestInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    incomingListOrderPaymentsRequestInput: IncomingListOrderPaymentsRequestInput,
  ): IncomingListOrderPaymentsRequestProps {
    this.validateInput(incomingListOrderPaymentsRequestInput)
    const { orderId, sortDirection, limit } = incomingListOrderPaymentsRequestInput
    const incomingListOrderPaymentsRequestProps: IncomingListOrderPaymentsRequestProps = {
      orderId,
      sortDirection,
      limit,
    }
    return incomingListOrderPaymentsRequestProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(incomingListOrderPaymentsRequestInput: IncomingListOrderPaymentsRequestInput): void {
    const logContext = 'IncomingListOrderPaymentsRequest.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId().optional(),
      sortDirection: ValueValidators.validSortDirection().optional(),
      limit: ValueValidators.validLimit().optional(),
    })

    try {
      schema.parse(incomingListOrderPaymentsRequestInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingListOrderPaymentsRequestInput })
      throw invalidArgumentsError
    }
  }
}
