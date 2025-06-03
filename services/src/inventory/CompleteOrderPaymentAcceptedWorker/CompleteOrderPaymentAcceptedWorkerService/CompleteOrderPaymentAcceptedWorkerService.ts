import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { IDbCompleteOrderPaymentAcceptedClient } from '../DbCompleteOrderPaymentAcceptedClient/DbCompleteOrderPaymentAcceptedClient'
import { IDbGetOrderAllocationClient } from '../DbGetOrderAllocationClient/DbGetOrderAllocationClient'
import {
  CompleteOrderPaymentAcceptedCommand,
  CompleteOrderPaymentAcceptedCommandInput,
} from '../model/CompleteOrderPaymentAcceptedCommand'
import { GetOrderAllocationCommand, GetOrderAllocationCommandInput } from '../model/GetOrderAllocationCommand'
import { IncomingOrderPaymentAcceptedEvent } from '../model/IncomingOrderPaymentAcceptedEvent'

export interface ICompleteOrderPaymentAcceptedWorkerService {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {InvalidStockCompletionError}
   * @throws {UnrecognizedError}
   */
  completeOrder: (incomingOrderPaymentAcceptedEvent: IncomingOrderPaymentAcceptedEvent) => Promise<void>
}

/**
 *
 */
export class CompleteOrderPaymentAcceptedWorkerService implements ICompleteOrderPaymentAcceptedWorkerService {
  /**
   *
   */
  constructor(
    private readonly dbGetOrderAllocationClient: IDbGetOrderAllocationClient,
    private readonly dbCompleteOrderPaymentAcceptedClient: IDbCompleteOrderPaymentAcceptedClient,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {InvalidStockCompletionError}
   * @throws {UnrecognizedError}
   */
  public async completeOrder(incomingOrderPaymentAcceptedEvent: IncomingOrderPaymentAcceptedEvent): Promise<void> {
    const logContext = 'CompleteOrderPaymentAcceptedWorkerService.completeOrder'
    console.info(`${logContext} init:`, { incomingOrderPaymentAcceptedEvent })

    try {
      this.validateInput(incomingOrderPaymentAcceptedEvent)

      // When it reads the Allocation from the database
      const existingOrderAllocationData = await this.getOrderAllocation(incomingOrderPaymentAcceptedEvent)

      // When the Allocation DOES exist and it completes it
      if (existingOrderAllocationData) {
        await this.completeOrderAllocation(existingOrderAllocationData, incomingOrderPaymentAcceptedEvent)
        console.info(`${logContext} exit success:`, { existingOrderAllocationData, incomingOrderPaymentAcceptedEvent })
        return
      }

      // When the Allocation DOES NOT exist and it skips the completion
      console.info(`${logContext} exit success: skipped:`, {
        existingOrderAllocationData,
        incomingOrderPaymentAcceptedEvent,
      })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderPaymentAcceptedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(incomingOrderPaymentAcceptedEvent: IncomingOrderPaymentAcceptedEvent): void {
    const logContext = 'CompleteOrderPaymentAcceptedWorkerService.validateInput'

    if (incomingOrderPaymentAcceptedEvent instanceof IncomingOrderPaymentAcceptedEvent === false) {
      const errorMessage = `Expected IncomingOrderPaymentAcceptedEvent but got ${incomingOrderPaymentAcceptedEvent}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingOrderPaymentAcceptedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  private async getOrderAllocation(
    incomingOrderPaymentAcceptedEvent: IncomingOrderPaymentAcceptedEvent,
  ): Promise<OrderAllocationData> {
    const logContext = 'CompleteOrderPaymentAcceptedWorkerService.getOrderAllocation'
    console.info(`${logContext} init:`, { incomingOrderPaymentAcceptedEvent })

    try {
      const { orderId, sku } = incomingOrderPaymentAcceptedEvent.eventData
      const getOrderAllocationCommandInput: GetOrderAllocationCommandInput = { orderId, sku }
      const getOrderAllocationCommand = GetOrderAllocationCommand.validateAndBuild(getOrderAllocationCommandInput)
      const orderAllocationData = await this.dbGetOrderAllocationClient.getOrderAllocation(getOrderAllocationCommand)
      console.info(`${logContext} exit success:`, {
        orderAllocationData,
        getOrderAllocationCommand,
        getOrderAllocationCommandInput,
      })
      return orderAllocationData
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderPaymentAcceptedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {InvalidStockCompletionError}
   * @throws {UnrecognizedError}
   */
  private async completeOrderAllocation(
    existingOrderAllocationData: OrderAllocationData,
    incomingOrderPaymentAcceptedEvent: IncomingOrderPaymentAcceptedEvent,
  ): Promise<void> {
    const logContext = 'CompleteOrderPaymentAcceptedWorkerService.completeOrderAllocation'
    console.info(`${logContext} init:`, { incomingOrderPaymentAcceptedEvent })

    try {
      const completeCommandInput: CompleteOrderPaymentAcceptedCommandInput = {
        existingOrderAllocationData,
        incomingOrderPaymentAcceptedEvent,
      }
      const completeCommand = CompleteOrderPaymentAcceptedCommand.validateAndBuild(completeCommandInput)
      await this.dbCompleteOrderPaymentAcceptedClient.completeOrder(completeCommand)

      console.info(`${logContext} exit success:`, { completeCommand, completeCommandInput })
      return
    } catch (error) {
      console.error(`${logContext} exit error:`, {
        error,
        existingOrderAllocationData,
        incomingOrderPaymentAcceptedEvent,
      })
      throw error
    }
  }
}
