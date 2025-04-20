import { z } from 'zod'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { RawEventProps } from './RawEventProps'

export type IncomingSimulateRawEventRequestInput = TypeUtilsPretty<RawEventProps>

type IncomingSimulateRawEventRequestProps = TypeUtilsPretty<RawEventProps>

/**
 *
 */
export class IncomingSimulateRawEventRequest implements IncomingSimulateRawEventRequestProps {
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
  public static validateAndBuild(
    incomingSimulateRawEventRequestInput: IncomingSimulateRawEventRequestInput,
  ): IncomingSimulateRawEventRequest {
    const logContext = 'IncomingSimulateRawEventRequest.validateAndBuild'
    console.info(`${logContext} init:`, { incomingSimulateRawEventRequestInput })

    try {
      const { pk, sk, eventName, eventData, createdAt, updatedAt } = this.buildProps(
        incomingSimulateRawEventRequestInput,
      )

      const incomingSimulateRawEventRequest = new IncomingSimulateRawEventRequest(
        pk,
        sk,
        eventName,
        eventData,
        createdAt,
        updatedAt,
      )

      console.info(`${logContext} exit success:`, { incomingSimulateRawEventRequest })
      return incomingSimulateRawEventRequest
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingSimulateRawEventRequestInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    incomingSimulateRawEventRequestInput: IncomingSimulateRawEventRequestInput,
  ): IncomingSimulateRawEventRequestProps {
    this.validateInput(incomingSimulateRawEventRequestInput)
    return incomingSimulateRawEventRequestInput
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(incomingSimulateRawEventRequestInput: IncomingSimulateRawEventRequestInput): void {
    const logContext = 'IncomingSimulateRawEventRequest.validateInput'

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
      schema.strict().parse(incomingSimulateRawEventRequestInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingSimulateRawEventRequestInput })
      throw invalidArgumentsError
    }
  }
}
