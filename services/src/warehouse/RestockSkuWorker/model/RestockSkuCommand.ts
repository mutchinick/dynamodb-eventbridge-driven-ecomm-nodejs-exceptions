import { z } from 'zod'
import { InvalidArgumentsError } from '../../errors/AppError'
import { RestockSkuData } from '../../model/RestockSkuData'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingSkuRestockedEvent } from './IncomingSkuRestockedEvent'

export type RestockSkuCommandInput = {
  incomingSkuRestockedEvent: IncomingSkuRestockedEvent
}

type RestockSkuCommandData = RestockSkuData

type RestockSkuCommandProps = {
  readonly commandData: RestockSkuCommandData
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
    public readonly commandData: RestockSkuCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(restockSkuCommandInput: RestockSkuCommandInput): RestockSkuCommand {
    const logContext = 'RestockSkuCommand.validateAndBuild'
    console.info(`${logContext} init:`, { restockSkuCommandInput })

    try {
      const { commandData, options } = this.buildProps(restockSkuCommandInput)
      const restockSkuCommand = new RestockSkuCommand(commandData, options)
      console.info(`${logContext} exit success:`, { restockSkuCommand, restockSkuCommandInput })
      return restockSkuCommand
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, restockSkuCommandInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(restockSkuCommandInput: RestockSkuCommandInput): RestockSkuCommandProps {
    this.validateInput(restockSkuCommandInput)

    const { incomingSkuRestockedEvent } = restockSkuCommandInput
    const { sku, units, lotId } = incomingSkuRestockedEvent.eventData
    const currentDate = new Date().toISOString()
    const restockSkuCommandProps: RestockSkuCommandProps = {
      commandData: {
        sku,
        units,
        lotId,
        createdAt: currentDate,
        updatedAt: currentDate,
      },
      options: {},
    }
    return restockSkuCommandProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(restockSkuCommandInput: RestockSkuCommandInput): void {
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
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, restockSkuCommandInput })
      throw invalidArgumentsError
    }
  }
}
