import { DuplicateEventRaisedError } from '../../errors/AppError'
import { IEsRaiseRawSimulatedEventClient } from '../EsRaiseRawSimulatedEventClient/EsRaiseRawSimulatedEventClient'
import { IncomingSimulateRawEventRequest } from '../model/IncomingSimulateRawEventRequest'
import { RawSimulatedEvent } from '../model/RawSimulatedEvent'

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
  constructor(private readonly ddbRawSimulatedEventClient: IEsRaiseRawSimulatedEventClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  public async simulateRawEvent(incomingSimulateRawEventRequest: IncomingSimulateRawEventRequest): Promise<object> {
    const logContext = 'SimulateRawEventApiService.simulateRawEvent'
    console.info(`${logContext} init:`, { incomingSimulateRawEventRequest })

    try {
      await this.raiseRawSimulatedEvent(incomingSimulateRawEventRequest)
      const serviceOutput: SimulateRawEventApiServiceOutput = { ...incomingSimulateRawEventRequest }
      console.info(`${logContext} exit success:`, { serviceOutput })
      return serviceOutput
    } catch (error) {
      if (error instanceof DuplicateEventRaisedError) {
        const serviceOutput: SimulateRawEventApiServiceOutput = { ...incomingSimulateRawEventRequest }
        console.info(`${logContext} exit success: from-error:`, {
          serviceOutput,
          error,
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
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async raiseRawSimulatedEvent(
    incomingSimulateRawEventRequest: IncomingSimulateRawEventRequest,
  ): Promise<void> {
    const logContext = 'SimulateRawEventApiService.raiseRawSimulatedEvent'
    console.info(`${logContext} init:`, { incomingSimulateRawEventRequest })

    try {
      const rawSimulatedEvent = RawSimulatedEvent.validateAndBuild(incomingSimulateRawEventRequest)
      await this.ddbRawSimulatedEventClient.raiseRawSimulatedEvent(rawSimulatedEvent)
      console.info(`${logContext} exit success:`, { rawSimulatedEvent })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingSimulateRawEventRequest })
      throw error
    }
  }
}
