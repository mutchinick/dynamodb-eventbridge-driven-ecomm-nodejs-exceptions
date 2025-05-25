import {
  InvalidArgumentsError,
  PaymentAlreadyAcceptedError,
  PaymentAlreadyRejectedError,
  PaymentFailedError,
} from '../../errors/AppError'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { PaymentStatus } from '../../model/PaymentStatus'
import { IAxSubmitOrderPaymentClient } from '../AxSubmitOrderPaymentClient/AxSubmitOrderPaymentClient'
import { IDbGetOrderPaymentClient } from '../DbGetOrderPaymentClient/DbGetOrderPaymentClient'
import { IDbRecordOrderPaymentClient } from '../DbRecordOrderPaymentClient/DbRecordOrderPaymentClient'
import { IEsRaiseOrderPaymentAcceptedEventClient } from '../EsRaiseOrderPaymentAcceptedEventClient/EsRaiseOrderPaymentAcceptedEventClient'
import { IEsRaiseOrderPaymentRejectedEventClient } from '../EsRaiseOrderPaymentRejectedEventClient/EsRaiseOrderPaymentRejectedEventClient'
import { GetOrderPaymentCommand, GetOrderPaymentCommandInput } from '../model/GetOrderPaymentCommand'
import { IncomingOrderStockAllocatedEvent } from '../model/IncomingOrderStockAllocatedEvent'
import { OrderPaymentAcceptedEvent, OrderPaymentAcceptedEventInput } from '../model/OrderPaymentAcceptedEvent'
import { OrderPaymentRejectedEvent, OrderPaymentRejectedEventInput } from '../model/OrderPaymentRejectedEvent'
import { RecordOrderPaymentCommand, RecordOrderPaymentCommandInput } from '../model/RecordOrderPaymentCommand'
import { SubmitOrderPaymentCommand, SubmitOrderPaymentCommandInput } from '../model/SubmitOrderPaymentCommand'

export interface IProcessOrderPaymentWorkerService {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {PaymentFailedError}
   * @throws {UnrecognizedError}
   */
  processOrderPayment: (incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent) => Promise<void>
}

type SubmitOrderPaymentOutput = {
  paymentId: string
  paymentStatus: PaymentStatus
  error?: Error
}

/**
 *
 */
export class ProcessOrderPaymentWorkerService implements IProcessOrderPaymentWorkerService {
  /**
   *
   */
  constructor(
    private readonly dbGetOrderPaymentClient: IDbGetOrderPaymentClient,
    private readonly axSubmitOrderPaymentClient: IAxSubmitOrderPaymentClient,
    private readonly dbRecordOrderPaymentClient: IDbRecordOrderPaymentClient,
    private readonly esRaiseOrderPaymentAcceptedEventClient: IEsRaiseOrderPaymentAcceptedEventClient,
    private readonly esRaiseOrderPaymentRejectedEventClient: IEsRaiseOrderPaymentRejectedEventClient,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {PaymentFailedError}
   * @throws {UnrecognizedError}
   */
  public async processOrderPayment(incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent): Promise<void> {
    const logContext = 'ProcessOrderPaymentWorkerService.processOrderPayment'
    console.info(`${logContext} init:`, { incomingOrderStockAllocatedEvent })

    // This worker has a slightly more complex state machine than the others because we want to
    // simulate Payment failures, cap the number of retries, handle errors produced by domain
    // invariants like a Payment already being Accepted or Rejected, and also deal with the case where
    // a new Payment is Accepted or Rejected, in which case we need to record it in the database and
    // throw if that recording fails so the system can retry it later. It gets a bit messy, and that's
    // why we made the other methods a little smarter to keep the orchestration logic as linear as
    // possible, otherwise we need to code too many branches and like I said, it's not pretty.

    try {
      this.validateInput(incomingOrderStockAllocatedEvent)

      // When it reads the existing Payment from the database
      const existingOrderPaymentData = (await this.getOrderPayment(incomingOrderStockAllocatedEvent)) ?? undefined

      // When it submits the Payment to the gateway
      const submitOrderPaymentOutput = await this.submitOrderPayment(
        incomingOrderStockAllocatedEvent,
        existingOrderPaymentData,
      )

      // When it records the Payment in the database
      const { paymentId, paymentStatus } = submitOrderPaymentOutput
      const newOrderPaymentData = await this.recordOrderPayment(
        incomingOrderStockAllocatedEvent,
        existingOrderPaymentData,
        paymentId,
        paymentStatus,
      )

      // When it raises the Payment Accepted event
      if (paymentStatus === 'PAYMENT_ACCEPTED') {
        await this.raisePaymentAcceptedEvent(incomingOrderStockAllocatedEvent)
        console.info(`${logContext} exit success:`, {
          submitOrderPaymentOutput,
          newOrderPaymentData,
          existingOrderPaymentData,
          incomingOrderStockAllocatedEvent,
        })
        return
      }

      // When it raises the Payment Rejected event
      if (paymentStatus === 'PAYMENT_REJECTED') {
        await this.raisePaymentRejectedEvent(incomingOrderStockAllocatedEvent)
        console.info(`${logContext} exit success:`, {
          submitOrderPaymentOutput,
          newOrderPaymentData,
          existingOrderPaymentData,
          incomingOrderStockAllocatedEvent,
        })
        return
      }

      // When it throws the Payment Failed error
      // We could check if paymentStatus === 'PAYMENT_FAILED', but the reality is that if we get here
      // it means that the Payment Failed and we need to throw the error.
      const unverifiedError = submitOrderPaymentOutput.error
      const paymentError =
        unverifiedError instanceof PaymentFailedError
          ? unverifiedError
          : PaymentFailedError.from(unverifiedError, 'Unexpected payment error')
      console.info(`${logContext} exit success: from-error:`, {
        paymentError,
        submitOrderPaymentOutput,
        newOrderPaymentData,
        existingOrderPaymentData,
        incomingOrderStockAllocatedEvent,
      })
      throw paymentError
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderStockAllocatedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent): void {
    const logContext = 'ProcessOrderPaymentWorkerService.validateInput'

    if (incomingOrderStockAllocatedEvent instanceof IncomingOrderStockAllocatedEvent === false) {
      const errorMessage = `Expected IncomingOrderStockAllocatedEvent but got ${incomingOrderStockAllocatedEvent}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingOrderStockAllocatedEvent })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  private async getOrderPayment(
    incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent,
  ): Promise<OrderPaymentData> {
    const logContext = 'ProcessOrderPaymentWorkerService.getOrderPayment'
    console.info(`${logContext} init:`, { incomingOrderStockAllocatedEvent })

    try {
      const { orderId } = incomingOrderStockAllocatedEvent.eventData
      const getOrderPaymentCommandInput: GetOrderPaymentCommandInput = { orderId }
      const getOrderPaymentCommand = GetOrderPaymentCommand.validateAndBuild(getOrderPaymentCommandInput)
      const orderPaymentData = await this.dbGetOrderPaymentClient.getOrderPayment(getOrderPaymentCommand)
      console.info(`${logContext} exit success:`, {
        orderPaymentData,
        getOrderPaymentCommand,
        getOrderPaymentCommandInput,
      })
      return orderPaymentData
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderStockAllocatedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {PaymentFailedError}
   */
  private async submitOrderPayment(
    incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent,
    existingOrderPaymentData: OrderPaymentData | undefined,
  ): Promise<SubmitOrderPaymentOutput> {
    const logContext = 'ProcessOrderPaymentWorkerService.submitOrderPayment'
    console.info(`${logContext} init:`, { incomingOrderStockAllocatedEvent })

    // When retries exceed 3 we return a Rejected Payment.
    if (existingOrderPaymentData?.paymentRetries >= 3) {
      const submitOrderPaymentOutput: SubmitOrderPaymentOutput = {
        paymentId: existingOrderPaymentData.paymentId,
        paymentStatus: 'PAYMENT_REJECTED',
      }
      console.info(`${logContext} exit success:`, {
        submitOrderPaymentOutput,
        incomingOrderStockAllocatedEvent,
        existingOrderPaymentData,
      })
      return submitOrderPaymentOutput
    }

    // Otherwise we try to submit the Payment to the gateway.
    try {
      const { eventData } = incomingOrderStockAllocatedEvent
      const { orderId, sku, units, price, userId } = eventData
      const existingPaymentStatus = existingOrderPaymentData?.paymentStatus
      const submitOrderPaymentCommandInput: SubmitOrderPaymentCommandInput = {
        orderId,
        sku,
        units,
        price,
        userId,
        existingPaymentStatus,
      }
      const submitOrderPaymentCommand = SubmitOrderPaymentCommand.validateAndBuild(submitOrderPaymentCommandInput)
      const paymentClientOutput = await this.axSubmitOrderPaymentClient.submitOrderPayment(submitOrderPaymentCommand)

      // We want to return a SubmitOrderPaymentOutput
      const submitOrderPaymentOutput: SubmitOrderPaymentOutput = {
        paymentId: paymentClientOutput.paymentId,
        paymentStatus: paymentClientOutput.paymentStatus,
      }
      console.info(`${logContext} exit success:`, { submitOrderPaymentOutput, submitOrderPaymentCommand })
      return submitOrderPaymentOutput
    } catch (error) {
      // When we get a PaymentFailedError we return a Failed Payment with the original error.
      // The event will be sent back to the queue, and we will try to process it again, but we
      // don't throw here, because it still needs to be recorded in the database.
      if (error instanceof PaymentFailedError) {
        const paymentOutput: SubmitOrderPaymentOutput = {
          paymentId: existingOrderPaymentData?.paymentId,
          paymentStatus: 'PAYMENT_FAILED',
          error,
        }
        console.error(`${logContext} exit success: from-error:`, {
          error,
          incomingOrderStockAllocatedEvent,
          existingOrderPaymentData,
        })
        return paymentOutput
      }

      // When we get a PaymentAlreadyAcceptedError we return an Accepted Payment.
      // This case should not happen but it can in the event of a race condition.
      if (error instanceof PaymentAlreadyAcceptedError) {
        const paymentOutput: SubmitOrderPaymentOutput = {
          paymentId: existingOrderPaymentData.paymentId,
          paymentStatus: 'PAYMENT_ACCEPTED',
        }
        console.error(`${logContext} exit success: from-error:`, {
          error,
          incomingOrderStockAllocatedEvent,
          existingOrderPaymentData,
        })
        return paymentOutput
      }

      // When we get a PaymentAlreadyRejectedError we return a Rejected Payment.
      // This case should not happen but it can in the event of a race condition.
      if (error instanceof PaymentAlreadyRejectedError) {
        const paymentOutput: SubmitOrderPaymentOutput = {
          paymentId: existingOrderPaymentData.paymentId,
          paymentStatus: 'PAYMENT_REJECTED',
        }
        console.error(`${logContext} exit success: from-error:`, {
          error,
          incomingOrderStockAllocatedEvent,
          existingOrderPaymentData,
        })
        return paymentOutput
      }

      // We shouldn't get here, but if we do, we throw the error.
      console.error(`${logContext} exit error:`, { error, incomingOrderStockAllocatedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {UnrecognizedError}
   */
  private async recordOrderPayment(
    incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent,
    existingOrderPaymentData: OrderPaymentData | undefined,
    paymentId: string,
    newPaymentStatus: PaymentStatus,
  ): Promise<OrderPaymentData> {
    const logContext = 'ProcessOrderPaymentWorkerService.recordOrderPayment'
    console.info(`${logContext} init:`, {
      incomingOrderStockAllocatedEvent,
      existingOrderPaymentData,
      paymentId,
      newPaymentStatus,
    })

    try {
      const { orderId, sku, units, price, userId } = incomingOrderStockAllocatedEvent.eventData
      const newOrderPaymentFields = { orderId, sku, units, price, userId, paymentId, paymentStatus: newPaymentStatus }
      const recordOrderPaymentCommandInput: RecordOrderPaymentCommandInput = {
        existingOrderPaymentData,
        newOrderPaymentFields,
      }
      const recordOrderPaymentCommand = RecordOrderPaymentCommand.validateAndBuild(recordOrderPaymentCommandInput)
      await this.dbRecordOrderPaymentClient.recordOrderPayment(recordOrderPaymentCommand)
      const newOrderPaymentData = recordOrderPaymentCommand.commandData
      console.info(`${logContext} exit success:`, {
        recordOrderPaymentCommand,
        recordOrderPaymentCommandInput,
        newOrderPaymentData,
      })
      return newOrderPaymentData
    } catch (error) {
      // When we get a PaymentAlreadyAcceptedError we return the existing Payment.
      // This case should not happen but it can in the event of a race condition.
      if (error instanceof PaymentAlreadyAcceptedError) {
        console.error(`${logContext} exit success: from-error:`, {
          error,
          incomingOrderStockAllocatedEvent,
          existingOrderPaymentData,
          paymentId,
          newPaymentStatus,
        })
        return existingOrderPaymentData
      }

      // When we get a PaymentAlreadyRejectedError we return the existing Payment.
      // This case should not happen but it can in the event of a race condition.
      if (error instanceof PaymentAlreadyRejectedError) {
        console.error(`${logContext} exit success: from-error:`, {
          error,
          incomingOrderStockAllocatedEvent,
          existingOrderPaymentData,
          paymentId,
          newPaymentStatus,
        })
        return existingOrderPaymentData
      }

      // Likely a database error, we should throw it.
      console.error(`${logContext} exit error:`, {
        error,
        incomingOrderStockAllocatedEvent,
        existingOrderPaymentData,
        paymentId,
        newPaymentStatus,
      })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async raisePaymentAcceptedEvent(
    incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent,
  ): Promise<void> {
    const logContext = 'ProcessOrderPaymentWorkerService.raisePaymentAcceptedEvent'
    console.info(`${logContext} init:`, { incomingOrderStockAllocatedEvent })

    try {
      const { orderId, sku, units, price, userId } = incomingOrderStockAllocatedEvent.eventData
      const orderPaymentAcceptedEventInput: OrderPaymentAcceptedEventInput = { orderId, sku, units, price, userId }
      const orderPaymentAcceptedEvent = OrderPaymentAcceptedEvent.validateAndBuild(orderPaymentAcceptedEventInput)
      await this.esRaiseOrderPaymentAcceptedEventClient.raiseOrderPaymentAcceptedEvent(orderPaymentAcceptedEvent)
      console.info(`${logContext} exit success:`, { orderPaymentAcceptedEvent, orderPaymentAcceptedEventInput })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderStockAllocatedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateEventRaisedError}
   * @throws {UnrecognizedError}
   */
  private async raisePaymentRejectedEvent(
    incomingOrderStockAllocatedEvent: IncomingOrderStockAllocatedEvent,
  ): Promise<void> {
    const logContext = 'ProcessOrderPaymentWorkerService.raisePaymentRejectedEvent'
    console.info(`${logContext} init:`, { incomingOrderStockAllocatedEvent })

    try {
      const { orderId, sku, units, price, userId } = incomingOrderStockAllocatedEvent.eventData
      const orderPaymentRejectedEventInput: OrderPaymentRejectedEventInput = { orderId, sku, units, price, userId }
      const orderPaymentRejectedEvent = OrderPaymentRejectedEvent.validateAndBuild(orderPaymentRejectedEventInput)
      await this.esRaiseOrderPaymentRejectedEventClient.raiseOrderPaymentRejectedEvent(orderPaymentRejectedEvent)
      console.info(`${logContext} exit success:`, { orderPaymentRejectedEvent, orderPaymentRejectedEventInput })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingOrderStockAllocatedEvent })
      throw error
    }
  }
}
