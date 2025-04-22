import { DuplicateEventRaisedError, InvalidArgumentsError } from '../../errors/AppError'
import { IEsRaiseOrderPlacedEventClient } from '../EsRaiseOrderPlacedEventClient/EsRaiseOrderPlacedEventClient'
import { IncomingPlaceOrderRequest } from '../model/IncomingPlaceOrderRequest'
import { OrderPlacedEvent, OrderPlacedEventInput } from '../model/OrderPlacedEvent'

export interface IPlaceOrderApiService {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  placeOrder: (incomingPlaceOrderRequest: IncomingPlaceOrderRequest) => Promise<PlaceOrderApiServiceOutput>
}

export type PlaceOrderApiServiceOutput = IncomingPlaceOrderRequest

/**
 *
 */
export class PlaceOrderApiService implements IPlaceOrderApiService {
  /**
   *
   */
  constructor(private readonly esRaiseOrderPlacedEventClient: IEsRaiseOrderPlacedEventClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  public async placeOrder(incomingPlaceOrderRequest: IncomingPlaceOrderRequest): Promise<PlaceOrderApiServiceOutput> {
    const logContext = 'PlaceOrderApiService.placeOrder'
    console.info(`${logContext} init:`, { incomingPlaceOrderRequest })

    try {
      this.validateInput(incomingPlaceOrderRequest)
      await this.raiseOrderPlacedEvent(incomingPlaceOrderRequest)
      const serviceOutput: PlaceOrderApiServiceOutput = { ...incomingPlaceOrderRequest }
      console.info(`${logContext} exit success:`, { serviceOutput, incomingPlaceOrderRequest })
      return serviceOutput
    } catch (error) {
      if (error instanceof DuplicateEventRaisedError) {
        const serviceOutput: PlaceOrderApiServiceOutput = { ...incomingPlaceOrderRequest }
        console.info(`${logContext} exit success: from-error:`, { error, serviceOutput, incomingPlaceOrderRequest })
        return serviceOutput
      }

      console.error(`${logContext} exit error:`, { error, incomingPlaceOrderRequest })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(incomingPlaceOrderRequest: IncomingPlaceOrderRequest): void {
    const logContext = 'PlaceOrderApiService.validateInput'

    if (incomingPlaceOrderRequest instanceof IncomingPlaceOrderRequest === false) {
      const errorMessage = `Expected IncomingPlaceOrderRequest but got ${incomingPlaceOrderRequest}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingPlaceOrderRequest })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async raiseOrderPlacedEvent(incomingPlaceOrderRequest: IncomingPlaceOrderRequest): Promise<void> {
    const logContext = 'PlaceOrderApiService.raiseOrderPlacedEvent'
    console.info(`${logContext} init:`, { incomingPlaceOrderRequest })

    try {
      const { orderId, sku, units, price, userId } = incomingPlaceOrderRequest
      const orderPlacedEventInput: OrderPlacedEventInput = { orderId, sku, units, price, userId }
      const orderPlacedEvent = OrderPlacedEvent.validateAndBuild(orderPlacedEventInput)
      await this.esRaiseOrderPlacedEventClient.raiseOrderPlacedEvent(orderPlacedEvent)
      console.info(`${logContext} exit success:`, { orderPlacedEvent, incomingPlaceOrderRequest })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingPlaceOrderRequest })
      throw error
    }
  }
}
