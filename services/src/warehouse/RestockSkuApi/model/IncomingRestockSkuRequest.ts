import { z } from 'zod'
import { InvalidArgumentsError, Result } from '../../errors/AppError'
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
  ): Result<IncomingRestockSkuRequest, InvalidArgumentsError> {
    try {
      const { sku, units, lotId } = this.buildProps(incomingRestockSkuRequestInput)
      return new IncomingRestockSkuRequest(sku, units, lotId)
    } catch (error) {
      console.error('IncomingRestockSkuRequest.validateAndBuild', { error, incomingRestockSkuRequestInput })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private static buildProps(
    incomingRestockSkuRequestInput: IncomingRestockSkuRequestInput,
  ): Result<IncomingRestockSkuRequestProps, InvalidArgumentsError> {
    try {
      const incomingRestockSkuRequest = z
        .object({
          sku: ValueValidators.validSku(),
          units: ValueValidators.validUnits(),
          lotId: ValueValidators.validLotId(),
        })
        .parse(incomingRestockSkuRequestInput) as IncomingRestockSkuRequestProps
      return incomingRestockSkuRequest
    } catch (error) {
      const invalidArgumentsError = InvalidArgumentsError.from(error)
      throw invalidArgumentsError
    }
  }
}
