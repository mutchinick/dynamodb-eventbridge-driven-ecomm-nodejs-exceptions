import { InvalidArgumentsError } from '../../errors/AppError'
import { OrderAllocationData } from '../../model/OrderAllocationData'
import { IDbDeallocateOrderPaymentRejectedClient } from '../DbDeallocateOrderPaymentRejectedClient/DbDeallocateOrderPaymentRejectedClient'
import { IDbGetOrderAllocationClient } from '../DbGetOrderAllocationClient/DbGetOrderAllocationClient'
import {
  DeallocateOrderPaymentRejectedCommand,
  DeallocateOrderPaymentRejectedCommandInput,
} from '../model/DeallocateOrderPaymentRejectedCommand'
import { GetOrderAllocationCommand, GetOrderAllocationCommandInput } from '../model/GetOrderAllocationCommand'
import { IncomingOrderPaymentRejectedEvent } from '../model/IncomingOrderPaymentRejectedEvent'

export interface IDeallocateOrderPaymentRejectedWorkerService {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {InvalidStockDeallocationError}
   * @throws {UnrecognizedError}
   */
  deallocateOrder: (incomingOrderPaymentRejectedEvent: IncomingOrderPaymentRejectedEvent) => Promise<void>
}

/**
 *
 */
export class DeallocateOrderPaymentRejectedWorkerService implements IDeallocateOrderPaymentRejectedWorkerService {
  /**
   *
   */
  constructor(
    private readonly dbGetOrderAllocationClient: IDbGetOrderAllocationClient,
    private readonly dbDeallocateOrderPaymentRejectedClient: IDbDeallocateOrderPaymentRejectedClient,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {InvalidStockDeallocationError}
   * @throws {UnrecognizedError}
   */
  public async deallocateOrder(incomingOrderPaymentRejectedEvent: IncomingOrderPaymentRejectedEvent): Promise<void> {
    const logContext = 'DeallocateOrderPaymentRejectedWorkerService.deallocateOrder'
    console.info(`${logContext} init:`, { incomingOrderPaymentRejectedEvent })

    try {
      this.validateInput(incomingOrderPaymentRejectedEvent)

      // When it reads the Allocation from the database
      const existingOrderAllocationData = await this.getOrderAllocation(incomingOrderPaymentRejectedEvent)

      // When the Allocation DOES exist and it deallocates it
      if (existingOrderAllocationData) {
        await this.deallocateOrderAllocation(existingOrderAllocationData, incomingOrderPaymentRejectedEvent)
        console.info(`${logContext} exit success:`, { existingOrderAllocationData, incomingOrderPaymentRejectedEvent })
        return
      }

      // When the Allocation DOES NOT exist and it skips the deallocation
      console.info(`${logContext} exit success: skipped:`, {
        existingOrderAllocationData,
        incomingOrderPaymentRejectedEvent,
      })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderPaymentRejectedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(incomingOrderPaymentRejectedEvent: IncomingOrderPaymentRejectedEvent): void {
    const logContext = 'DeallocateOrderPaymentRejectedWorkerService.validateInput'

    if (incomingOrderPaymentRejectedEvent instanceof IncomingOrderPaymentRejectedEvent === false) {
      const errorMessage = `Expected IncomingOrderPaymentRejectedEvent but got ${incomingOrderPaymentRejectedEvent}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingOrderPaymentRejectedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  private async getOrderAllocation(
    incomingOrderPaymentRejectedEvent: IncomingOrderPaymentRejectedEvent,
  ): Promise<OrderAllocationData> {
    const logContext = 'DeallocateOrderPaymentRejectedWorkerService.getOrderAllocation'
    console.info(`${logContext} init:`, { incomingOrderPaymentRejectedEvent })

    try {
      const { orderId, sku } = incomingOrderPaymentRejectedEvent.eventData
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
      console.error(`${logContext} exit error:`, { error, incomingOrderPaymentRejectedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {InvalidStockDeallocationError}
   * @throws {UnrecognizedError}
   */
  private async deallocateOrderAllocation(
    existingOrderAllocationData: OrderAllocationData,
    incomingOrderPaymentRejectedEvent: IncomingOrderPaymentRejectedEvent,
  ): Promise<void> {
    const logContext = 'DeallocateOrderPaymentRejectedWorkerService.deallocateOrderAllocation'
    console.info(`${logContext} init:`, { incomingOrderPaymentRejectedEvent })

    try {
      const deallocateCommandInput: DeallocateOrderPaymentRejectedCommandInput = {
        existingOrderAllocationData,
        incomingOrderPaymentRejectedEvent,
      }
      const deallocateCommand = DeallocateOrderPaymentRejectedCommand.validateAndBuild(deallocateCommandInput)
      await this.dbDeallocateOrderPaymentRejectedClient.deallocateOrder(deallocateCommand)

      console.info(`${logContext} exit success:`, { deallocateCommand, deallocateCommandInput })
      return
    } catch (error) {
      console.error(`${logContext} exit error:`, {
        error,
        existingOrderAllocationData,
        incomingOrderPaymentRejectedEvent,
      })
      throw error
    }
  }
}
