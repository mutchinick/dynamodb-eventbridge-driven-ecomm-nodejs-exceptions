import { InvalidArgumentsError, PaymentFailedError } from '../../errors/AppError'
import { OrderPaymentData } from '../../model/OrderPaymentData'
import { PaymentStatus } from '../../model/PaymentStatus'
import {
  ISdkPaymentGatewayClient,
  SdkPaymentGatewayClientRequest,
  SdkPaymentGatewayClientResponse,
} from '../__external/SdkPaymentGatewayClient/SdkPaymentGatewayClient'
import { SubmitOrderPaymentCommand } from '../model/SubmitOrderPaymentCommand'

export type AxSubmitOrderPaymentClientOutput = Pick<OrderPaymentData, 'orderId' | 'paymentId' | 'paymentStatus'>

export interface IAxSubmitOrderPaymentClient {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {PaymentFailedError}
   */
  submitOrderPayment: (
    submitOrderPaymentCommand: SubmitOrderPaymentCommand,
  ) => Promise<AxSubmitOrderPaymentClientOutput>
}

/**
 *
 */
export class AxSubmitOrderPaymentClient implements IAxSubmitOrderPaymentClient {
  /**
   *
   */
  constructor(private readonly sdkPaymentsClient: ISdkPaymentGatewayClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {PaymentFailedError}
   */
  public async submitOrderPayment(
    submitOrderPaymentCommand: SubmitOrderPaymentCommand,
  ): Promise<AxSubmitOrderPaymentClientOutput> {
    const logContext = 'AxSubmitOrderPaymentClient.submitOrderPayment'
    console.info(`${logContext} init:`, { submitOrderPaymentCommand })

    try {
      this.validateInput(submitOrderPaymentCommand)
      const request = this.buildSdkPaymentRequest(submitOrderPaymentCommand)
      const submitPaymentOutput = await this.sendSdkPaymentRequest(request)
      console.info(`${logContext} exit success:`, { submitPaymentOutput, request, submitOrderPaymentCommand })
      return submitPaymentOutput
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, submitOrderPaymentCommand })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(submitOrderPaymentCommand: SubmitOrderPaymentCommand): void {
    const logContext = 'AxSubmitOrderPaymentClient.validateInput'

    if (submitOrderPaymentCommand instanceof SubmitOrderPaymentCommand === false) {
      const errorMessage = `Expected SubmitOrderPaymentCommand but got ${submitOrderPaymentCommand}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, submitOrderPaymentCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private buildSdkPaymentRequest(submitOrderPaymentCommand: SubmitOrderPaymentCommand): SdkPaymentGatewayClientRequest {
    const logContext = 'AxSubmitOrderPaymentClient.buildSdkPaymentRequest'

    try {
      // These should all be valid because we received a valid SubmitOrderPaymentCommand
      // nevertheless, we try-catch just out of caution.
      const { orderId, sku, units, price, userId } = submitOrderPaymentCommand.commandData
      const request: SdkPaymentGatewayClientRequest = { orderId, sku, units, price, userId }
      return request
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, submitOrderPaymentCommand })
      throw invalidArgumentsError
    }
  }

  /**
   * @throws {PaymentFailedError}
   */
  private async sendSdkPaymentRequest(
    request: SdkPaymentGatewayClientRequest,
  ): Promise<AxSubmitOrderPaymentClientOutput> {
    const logContext = 'AxSubmitOrderPaymentClient.sendSdkPaymentRequest'
    console.info(`${logContext} init:`, { request })

    // COMBAK: Don't really fancy this, but we are simulating an edge case here, and I didn't love the
    // other alternatives I could think of. Don't know if splitting the method would make it better.
    let response: SdkPaymentGatewayClientResponse | undefined
    try {
      response = await this.sdkPaymentsClient.send(request)
    } catch (error) {
      const paymentFailedError = PaymentFailedError.from(error)
      console.error(`${logContext} exit error:`, { paymentFailedError, request })
      throw paymentFailedError
    }

    // Payment accepted
    if (response && response.status === 'SDK_PAYMENT_ACCEPTED') {
      const submitPaymentOutput = this.buildOutput(request.orderId, response.paymentId, 'PAYMENT_ACCEPTED')
      console.info(`${logContext} exit success:`, { submitPaymentOutput, response, request })
      return submitPaymentOutput
    }

    // Payment rejected
    else if (response && response.status === 'SDK_PAYMENT_REJECTED') {
      const submitPaymentOutput = this.buildOutput(request.orderId, response.paymentId, 'PAYMENT_REJECTED')
      console.info(`${logContext} exit success:`, { submitPaymentOutput, response, request })
      return submitPaymentOutput
    }

    // Payment failed
    else {
      const errorMessage = `Expected SdkPaymentGatewayClientResponse but got ${response}`
      const paymentFailedError = PaymentFailedError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { paymentFailedError, response, request })
      throw paymentFailedError
    }
  }

  /**
   *
   */
  private buildOutput(
    orderId: string,
    paymentId: string,
    paymentStatus: PaymentStatus,
  ): AxSubmitOrderPaymentClientOutput {
    const output: AxSubmitOrderPaymentClientOutput = { orderId, paymentId, paymentStatus }
    return output
  }
}
