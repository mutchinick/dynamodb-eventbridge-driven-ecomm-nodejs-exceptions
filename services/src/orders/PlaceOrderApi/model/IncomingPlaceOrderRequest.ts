import { z } from 'zod'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { ValueValidators } from '../../model/ValueValidators'

export type IncomingPlaceOrderRequestInput = Pick<OrderData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>

type IncomingPlaceOrderRequestProps = Pick<OrderData, 'orderId' | 'sku' | 'units' | 'price' | 'userId'>

/**
 *
 */
export class IncomingPlaceOrderRequest implements IncomingPlaceOrderRequestProps {
  /**
   *
   */
  private constructor(
    public readonly orderId: string,
    public readonly sku: string,
    public readonly units: number,
    public readonly price: number,
    public readonly userId: string,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    incomingPlaceOrderRequestInput: IncomingPlaceOrderRequestInput,
  ): IncomingPlaceOrderRequest {
    const logContext = 'IncomingPlaceOrderRequest.validateAndBuild'
    console.info(`${logContext} init:`, { incomingPlaceOrderRequestInput })

    try {
      const { orderId, sku, units, price, userId } = this.buildProps(incomingPlaceOrderRequestInput)
      const incomingPlaceOrderRequest = new IncomingPlaceOrderRequest(orderId, sku, units, price, userId)
      console.info(`${logContext} exit success:`, { incomingPlaceOrderRequest, incomingPlaceOrderRequestInput })
      return incomingPlaceOrderRequest
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingPlaceOrderRequestInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    incomingPlaceOrderRequestInput: IncomingPlaceOrderRequestInput,
  ): IncomingPlaceOrderRequestProps {
    this.validateInput(incomingPlaceOrderRequestInput)
    const { orderId, sku, units, price, userId } = incomingPlaceOrderRequestInput
    return {
      orderId,
      sku,
      units,
      price,
      userId,
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(incomingPlaceOrderRequestInput: IncomingPlaceOrderRequestInput): void {
    const logContext = 'IncomingPlaceOrderRequest.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      orderId: ValueValidators.validOrderId(),
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      price: ValueValidators.validPrice(),
      userId: ValueValidators.validUserId(),
    })

    try {
      schema.parse(incomingPlaceOrderRequestInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingPlaceOrderRequestInput })
      throw invalidArgumentsError
    }
  }
}
