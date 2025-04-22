import { DuplicateEventRaisedError, InvalidArgumentsError } from '../../errors/AppError'
import { IEsRaiseRawSimulatedEventClient } from '../EsRaiseRawSimulatedEventClient/EsRaiseRawSimulatedEventClient'
import { IncomingSimulateRawEventRequest } from '../model/IncomingSimulateRawEventRequest'
import { RawSimulatedEvent, RawSimulatedEventInput } from '../model/RawSimulatedEvent'

export interface ISimulateRawEventApiService {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  simulateRawEvent: (incomingSimulateRawEventRequest: IncomingSimulateRawEventRequest) => Promise<object>
}

export type SimulateRawEventApiServiceOutput = IncomingSimulateRawEventRequest

/**
 *
 */
export class SimulateRawEventApiService implements ISimulateRawEventApiService {
  /**
   *
   */
  constructor(private readonly esRaiseRawSimulatedEventClient: IEsRaiseRawSimulatedEventClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  public async simulateRawEvent(incomingSimulateRawEventRequest: IncomingSimulateRawEventRequest): Promise<object> {
    const logContext = 'SimulateRawEventApiService.simulateRawEvent'
    console.info(`${logContext} init:`, { incomingSimulateRawEventRequest })

    try {
      this.validateInput(incomingSimulateRawEventRequest)
      await this.raiseRawSimulatedEvent(incomingSimulateRawEventRequest)
      const serviceOutput: SimulateRawEventApiServiceOutput = { ...incomingSimulateRawEventRequest }
      console.info(`${logContext} exit success:`, { serviceOutput, incomingSimulateRawEventRequest })
      return serviceOutput
    } catch (error) {
      if (error instanceof DuplicateEventRaisedError) {
        const serviceOutput: SimulateRawEventApiServiceOutput = { ...incomingSimulateRawEventRequest }
        console.info(`${logContext} exit success: from-error:`, {
          error,
          serviceOutput,
          incomingSimulateRawEventRequest,
        })
        return serviceOutput
      }

      console.error(`${logContext} exit error:`, { error, incomingSimulateRawEventRequest })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(incomingSimulateRawEventRequest: IncomingSimulateRawEventRequest): void {
    const logContext = 'SimulateRawEventApiService.validateInput'

    if (incomingSimulateRawEventRequest instanceof IncomingSimulateRawEventRequest === false) {
      const errorMessage = `Expected IncomingPlaceOrderRequest but got ${incomingSimulateRawEventRequest}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingSimulateRawEventRequest })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async raiseRawSimulatedEvent(
    incomingSimulateRawEventRequest: IncomingSimulateRawEventRequest,
  ): Promise<void> {
    const logContext = 'SimulateRawEventApiService.raiseRawSimulatedEvent'
    console.info(`${logContext} init:`, { incomingSimulateRawEventRequest })

    try {
      const { pk, sk, eventName, eventData, createdAt, updatedAt } = incomingSimulateRawEventRequest
      const rawSimulatedEventInput: RawSimulatedEventInput = { pk, sk, eventName, eventData, createdAt, updatedAt }
      const rawSimulatedEvent = RawSimulatedEvent.validateAndBuild(rawSimulatedEventInput)
      await this.esRaiseRawSimulatedEventClient.raiseRawSimulatedEvent(rawSimulatedEvent)
      console.info(`${logContext} exit success:`, { rawSimulatedEvent, rawSimulatedEventInput })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingSimulateRawEventRequest })
      throw error
    }
  }
}
