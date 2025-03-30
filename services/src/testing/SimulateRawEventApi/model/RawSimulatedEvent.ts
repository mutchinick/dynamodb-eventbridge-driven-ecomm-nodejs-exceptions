import { z } from 'zod'
import { InvalidArgumentsError } from '../../errors/AppError'
import { EventProps } from './EventProps'

export type RawSimulatedEventInput = EventProps

type RawSimulatedEventProps = EventProps

/**
 *
 */
export class RawSimulatedEvent implements RawSimulatedEventProps {
  /**
   *
   */
  private constructor(
    readonly pk: string,
    readonly sk: string,
    readonly eventName: string,
    readonly eventData: unknown,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(rawSimulatedEventInput: RawSimulatedEventInput): RawSimulatedEvent {
    const logContext = 'RawSimulatedEvent.validateInput'
    console.info(`${logContext} init:`, { rawSimulatedEventInput })

    try {
      const { pk, sk, eventName, eventData, createdAt, updatedAt } = this.buildProps(rawSimulatedEventInput)
      const rawSimulatedEvent = new RawSimulatedEvent(pk, sk, eventName, eventData, createdAt, updatedAt)
      console.info(`${logContext} exit success:`, { rawSimulatedEvent })
      return rawSimulatedEvent
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, rawSimulatedEventInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(rawSimulatedEventInput: RawSimulatedEventInput): RawSimulatedEventProps {
    this.validateInput(rawSimulatedEventInput)

    const date = new Date().toISOString()
    const { pk, sk, eventName, eventData, createdAt, updatedAt } = rawSimulatedEventInput
    const rawSimulatedEventProps: RawSimulatedEventProps = {
      pk,
      sk,
      eventName,
      eventData,
      createdAt: createdAt?.trim() || date,
      updatedAt: updatedAt?.trim() || date,
    }
    return rawSimulatedEventProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(rawSimulatedEventInput: RawSimulatedEventInput): void {
    const logContext = 'RawSimulatedEvent.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      pk: z.string().trim().min(1),
      sk: z.string().trim().min(1),
      eventName: z.string().trim().min(1),
      eventData: z.any().optional(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
    })

    try {
      schema.strict().parse(rawSimulatedEventInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, rawSimulatedEventInput })
      throw invalidArgumentsError
    }
  }
}
