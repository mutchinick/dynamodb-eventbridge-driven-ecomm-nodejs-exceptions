import { z } from 'zod'
import { ForbiddenOrderStatusTransitionError, InvalidArgumentsError } from '../../errors/AppError'
import { OrderData } from '../../model/OrderData'
import { OrderEventName } from '../../model/OrderEventName'
import { OrderStatus } from '../../model/OrderStatus'
import { ValueValidators } from '../../model/ValueValidators'
import { IncomingOrderEvent } from './IncomingOrderEvent'

export type CreateOrderCommandInput = {
  incomingOrderEvent: IncomingOrderEvent
}

type CreateOrderCommandProps = {
  readonly orderData: OrderData
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
    public readonly orderData: OrderData,
    public readonly options?: Record<string, unknown>,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {ForbiddenOrderStatusTransitionError}
   */
  public static validateAndBuild(createOrderCommandInput: CreateOrderCommandInput): CreateOrderCommand {
    const logContext = 'CreateOrderCommand.validateAndBuild'
    console.info(`${logContext} init:`, { createOrderCommandInput })

    try {
      const { orderData, options } = this.buildProps(createOrderCommandInput)
      const createOrderCommand = new CreateOrderCommand(orderData, options)
      console.info(`${logContext} exit success:`, { createOrderCommand, createOrderCommandInput })
      return createOrderCommand
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, createOrderCommandInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {ForbiddenOrderStatusTransitionError}
   */
  private static buildProps(createOrderCommandInput: CreateOrderCommandInput): CreateOrderCommandProps {
    this.validateInput(createOrderCommandInput)

    const { incomingOrderEvent } = createOrderCommandInput
    const { eventData, eventName } = incomingOrderEvent

    const { orderId, sku, units, price, userId } = eventData
    const newOrderStatus = this.getNewOrderStatus(eventName)
    const currentDate = new Date().toISOString()

    return {
      orderData: {
        orderId,
        orderStatus: newOrderStatus,
        sku,
        units,
        price,
        userId,
        createdAt: currentDate,
        updatedAt: currentDate,
      },
      options: {},
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(createOrderCommandInput: CreateOrderCommandInput): void {
    const logContext = 'CreateOrderCommand.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      incomingOrderEvent: z.object({
        eventName: ValueValidators.validIncomingEventName(),
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

  /**
   * @throws {ForbiddenOrderStatusTransitionError}
   */
  private static getNewOrderStatus(incomingEventName: OrderEventName): OrderStatus {
    const logContext = 'CreateOrderCommand.getNewOrderStatus'

    if (incomingEventName === OrderEventName.ORDER_PLACED_EVENT) {
      return OrderStatus.ORDER_CREATED_STATUS
    }

    const forbiddenError = ForbiddenOrderStatusTransitionError.from()
    console.error(`${logContext} exit error:`, { forbiddenError, incomingEventName })
    throw forbiddenError
  }
}
