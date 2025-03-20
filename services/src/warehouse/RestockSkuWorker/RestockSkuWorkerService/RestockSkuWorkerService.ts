import { InvalidArgumentsError } from '../../errors/AppError'
import { IDbRestockSkuClient } from '../DbRestockSkuClient/DbRestockSkuClient'
import { IncomingSkuRestockedEvent } from '../model/IncomingSkuRestockedEvent'
import { RestockSkuCommand } from '../model/RestockSkuCommand'

export interface IRestockSkuWorkerService {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateRestockOperationError}
   * @throws {UnrecognizedError}
   */
  restockSku: (incomingSkuRestockedEvent: IncomingSkuRestockedEvent) => Promise<void>
}

/**
 *
 */
export class RestockSkuWorkerService implements IRestockSkuWorkerService {
  /**
   *
   */
  constructor(private readonly dbRestockSkuClient: IDbRestockSkuClient) {}

  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateRestockOperationError}
   * @throws {UnrecognizedError}
   */
  public async restockSku(incomingSkuRestockedEvent: IncomingSkuRestockedEvent): Promise<void> {
    const logContext = 'RestockSkuWorkerService.restockSku'
    console.info(`${logContext} init:`, { incomingSkuRestockedEvent })

    try {
      // TODO: this.validateInput(...)
      this.validateInput(incomingSkuRestockedEvent)
      const restockSkuCommand = RestockSkuCommand.validateAndBuild({ incomingSkuRestockedEvent })
      await this.dbRestockSkuClient.restockSku(restockSkuCommand)
      console.info(`${logContext} exit success:`, { restockSkuCommand, incomingSkuRestockedEvent })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingSkuRestockedEvent })
      throw error
    }
  }

  /**
   * @throws {InvalidArgumentsError}
   */
  private validateInput(incomingSkuRestockedEvent: IncomingSkuRestockedEvent): void {
    const logContext = 'RestockSkuWorkerService.validateInput'

    if (incomingSkuRestockedEvent instanceof IncomingSkuRestockedEvent === false) {
      const errorMessage = `Expected IncomingSkuRestockedEvent but got ${incomingSkuRestockedEvent}`
      const invalidArgumentsError = InvalidArgumentsError.from(undefined, errorMessage)
      console.error(`${logContext} exit error:`, { invalidArgumentsError, incomingSkuRestockedEvent })
      throw invalidArgumentsError
    }
  }
}
