import { DuplicateEventRaisedError, InvalidArgumentsError } from '../../errors/AppError'
import { IEsRaiseOrderPlacedEventClient } from '../EsRaiseOrderPlacedEventClient/EsRaiseOrderPlacedEventClient'
import { IncomingPlaceOrderRequest } from '../model/IncomingPlaceOrderRequest'
import { OrderPlacedEvent } from '../model/OrderPlacedEvent'

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
  constructor(private readonly ddbOrderPlacedEventClient: IEsRaiseOrderPlacedEventClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  public async placeOrder(incomingPlaceOrderRequest: IncomingPlaceOrderRequest): Promise<PlaceOrderApiServiceOutput> {
    const logContext = 'PlaceOrderApiService.placeOrder'
    console.info(`${logContext} init:`, { incomingPlaceOrderRequest })

    try {
      this.validateIncomingPlaceOrderRequest(incomingPlaceOrderRequest)
      await this.raiseOrderPlacedEvent(incomingPlaceOrderRequest)
      const serviceOutput: PlaceOrderApiServiceOutput = { ...incomingPlaceOrderRequest }
      console.info(`${logContext} exit success:`, { serviceOutput })
      return serviceOutput
    } catch (error) {
      if (error instanceof DuplicateEventRaisedError) {
        const serviceOutput: PlaceOrderApiServiceOutput = { ...incomingPlaceOrderRequest }
        console.info(`${logContext} exit success: from-error:`, { serviceOutput, error, incomingPlaceOrderRequest })
        return serviceOutput
      }

      console.error(`${logContext} exit error:`, { error, incomingPlaceOrderRequest })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateIncomingPlaceOrderRequest(incomingPlaceOrderRequest: IncomingPlaceOrderRequest): void {
    const logContext = 'PlaceOrderApiService.validateIncomingPlaceOrderRequest'

    if (incomingPlaceOrderRequest instanceof IncomingPlaceOrderRequest === false) {
      const invalidArgumentsError = InvalidArgumentsError.from()
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
      const orderPlacedEvent = OrderPlacedEvent.validateAndBuild(incomingPlaceOrderRequest)
      await this.ddbOrderPlacedEventClient.raiseOrderPlacedEvent(orderPlacedEvent)
      console.info(`${logContext} exit success:`, { orderPlacedEvent })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingPlaceOrderRequest })
      throw error
    }
  }
}
