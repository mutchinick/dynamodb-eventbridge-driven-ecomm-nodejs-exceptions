import { z } from 'zod'
import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderStatus } from '../../model/OrderStatus'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingOrderEvent } from './IncomingOrderEvent'

export type CreateOrderCommandInput = {
  incomingOrderEvent: IncomingOrderEvent
}

type CreateOrderCommandData = OrderData

type CreateOrderCommandProps = {
  readonly commandData: CreateOrderCommandData
  readonly options?: Record<string, unknown>
}

/**
 *
 */
export class CreateOrderCommand implements CreateOrderCommandProps {
  /**
   *
   */
  private constructor(
    public readonly commandData: CreateOrderCommandData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(createOrderCommandInput: CreateOrderCommandInput): CreateOrderCommand {
    const logContext = 'CreateOrderCommand.validateAndBuild'
    console.info(`${logContext} init:`, { createOrderCommandInput })

    try {
      const { commandData, options } = this.buildProps(createOrderCommandInput)
      const createOrderCommand = new CreateOrderCommand(commandData, options)
      console.info(`${logContext} exit success:`, { createOrderCommand, createOrderCommandInput })
      return createOrderCommand
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, createOrderCommandInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(createOrderCommandInput: CreateOrderCommandInput): CreateOrderCommandProps {
    this.validateInput(createOrderCommandInput)

    const { incomingOrderEvent } = createOrderCommandInput
    const { orderId, sku, units, price, userId } = incomingOrderEvent.eventData
    const currentDate = new Date().toISOString()
    const createOrderCommandProps: CreateOrderCommandProps = {
      commandData: {
        orderId,
        orderStatus: OrderStatus.ORDER_CREATED_STATUS,
        sku,
        units,
        price,
        userId,
        createdAt: currentDate,
        updatedAt: currentDate,
      },
      options: {},
    }
    return createOrderCommandProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(createOrderCommandInput: CreateOrderCommandInput): void {
    const logContext = 'CreateOrderCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      incomingOrderEvent: z.object({
        eventName: ValueValidators.validOrderPlacedEventName(),
        eventData: z.object({
          orderId: ValueValidators.validOrderId(),
          sku: ValueValidators.validSku(),
          units: ValueValidators.validUnits(),
          price: ValueValidators.validPrice(),
          userId: ValueValidators.validUserId(),
        }),
        createdAt: ValueValidators.validCreatedAt(),
        updatedAt: ValueValidators.validUpdatedAt(),
      }),
    })

    try {
      schema.parse(createOrderCommandInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, createOrderCommandInput })
      throw invalidArgumentsError
    }
  }
}
