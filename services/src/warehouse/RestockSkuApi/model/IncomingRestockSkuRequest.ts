import { z } from 'zod'
import { InvalidArgumentsError } from '../../errors/AppError'
import { RestockSkuData } from '../../model/RestockSkuData'
import { ValueValidators } from '../../model/ValueValidators'

export type IncomingRestockSkuRequestInput = Pick<RestockSkuData, 'sku' | 'units' | 'lotId'>

type IncomingRestockSkuRequestProps = Pick<RestockSkuData, 'sku' | 'units' | 'lotId'>

/**
 *
 */
export class IncomingRestockSkuRequest implements IncomingRestockSkuRequestProps {
  /**
   *
   */
  private constructor(
    public readonly sku: string,
    public readonly units: number,
    public readonly lotId: string,
  ) {}

  /**
   * @throws {InvalidArgumentsError}
   */
  public static validateAndBuild(
    incomingRestockSkuRequestInput: IncomingRestockSkuRequestInput,
  ): IncomingRestockSkuRequest {
    const logContext = 'IncomingRestockSkuRequest.validateAndBuild'
    console.info(`${logContext} init:`, { incomingRestockSkuRequestInput })

    try {
      const { sku, units, lotId } = this.buildProps(incomingRestockSkuRequestInput)
      const incomingRestockSkuRequest = new IncomingRestockSkuRequest(sku, units, lotId)
      console.info(`${logContext} exit success:`, { incomingRestockSkuRequest, incomingRestockSkuRequestInput })
      return incomingRestockSkuRequest
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingRestockSkuRequestInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    incomingRestockSkuRequestInput: IncomingRestockSkuRequestInput,
  ): IncomingRestockSkuRequestProps {
    this.validateInput(incomingRestockSkuRequestInput)
    const { sku, units, lotId } = incomingRestockSkuRequestInput
    const incomingRestockSkuRequestProps: IncomingRestockSkuRequestProps = {
      sku,
      units,
      lotId,
    }
    return incomingRestockSkuRequestProps
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static validateInput(incomingRestockSkuRequestInput: IncomingRestockSkuRequestInput): void {
    const logContext = 'IncomingRestockSkuRequest.validateInput'

    // COMBAK: Maybe some schemas can be converted to shared models at some point.
    const schema = z.object({
      sku: ValueValidators.validSku(),
      units: ValueValidators.validUnits(),
      lotId: ValueValidators.validLotId(),
    })

    try {
      schema.parse(incomingRestockSkuRequestInput)
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingRestockSkuRequestInput })
      throw invalidArgumentsError
    }
  }
}
