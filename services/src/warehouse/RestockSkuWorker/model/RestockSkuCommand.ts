import { z } from 'zod'
import { InvalidArgumentsError, Result } from '../../errors/AppError'
import { RestockSkuData } from '../../model/RestockSkuData'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingSkuRestockedEvent } from './IncomingSkuRestockedEvent'

export type RestockSkuCommandInput = {
  incomingSkuRestockedEvent: IncomingSkuRestockedEvent
}

type RestockSkuCommandData = RestockSkuData

type RestockSkuCommandProps = {
  readonly restockSkuData: RestockSkuCommandData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class RestockSkuCommand implements RestockSkuCommandProps {
  /**
   *
   */
  private constructor(
    public readonly restockSkuData: RestockSkuCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    restockSkuCommandInput: RestockSkuCommandInput,
  ): Result<RestockSkuCommand, InvalidArgumentsError> {
    const logContext = 'RestockSkuCommand.validateAndBuild'
    console.info(`${logContext} init:`, { restockSkuCommandInput })

    try {
      const { restockSkuData, options } = this.buildProps(restockSkuCommandInput)
      const restockSkuCommand = new RestockSkuCommand(restockSkuData, options)
      console.info(`${logContext} exit success:`, { restockSkuCommand })
      return restockSkuCommand
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
      console.error(`${logContext} exit error:`, { error, restockSkuCommandInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    restockSkuCommandInput: RestockSkuCommandInput,
  ): Result<RestockSkuCommandProps, InvalidArgumentsError> {
    this.validateInput(restockSkuCommandInput)

    const { incomingSkuRestockedEvent } = restockSkuCommandInput
    const { sku, units, lotId } = incomingSkuRestockedEvent.eventData
    const date = new Date().toISOString()
    return {
      restockSkuData: {
        sku,
        units,
        lotId,
        createdAt: date,
        updatedAt: date,
      },
      options: {},
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(restockSkuCommandInput: RestockSkuCommandInput): Result<void, InvalidArgumentsError> {
    const logContext = 'RestockSkuCommand.buildProps'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      incomingSkuRestockedEvent: z.object({
        eventName: ValueValidators.validSkuRestockedEventName(),
        eventData: z.object({
          sku: ValueValidators.validSku(),
          units: ValueValidators.validUnits(),
          lotId: ValueValidators.validLotId(),
        }),
        createdAt: ValueValidators.validCreatedAt(),
        updatedAt: ValueValidators.validUpdatedAt(),
      }),
    })

    try {
      schema.parse(restockSkuCommandInput)
    } catch (error) {
      console.error(`${logContext} error caught:`, { error })
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, restockSkuCommandInput })
      throw invalidArgumentsError
    }
  }
}
