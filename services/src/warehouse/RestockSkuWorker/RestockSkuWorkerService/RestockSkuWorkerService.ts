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
      const restockSkuCommand = RestockSkuCommand.validateAndBuild({ incomingSkuRestockedEvent })
      await this.dbRestockSkuClient.restockSku(restockSkuCommand)
      console.info(`${logContext} exit success:`, { restockSkuCommand, incomingSkuRestockedEvent })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error, incomingSkuRestockedEvent })
      throw error
    }
  }
}
