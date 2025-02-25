import {
  AsyncResult,
  InvalidArgumentsError,
  DuplicateRestockOperationError,
  UnrecognizedError,
} from '../../errors/AppError'
import { IDbRestockSkuClient } from '../DbRestockSkuClient/DbRestockSkuClient'
import { IncomingSkuRestockedEvent } from '../model/IncomingSkuRestockedEvent'
import { RestockSkuCommand } from '../model/RestockSkuCommand'

export interface IRestockSkuWorkerService {
  /**
   * @throws {InvalidArgumentsError}
   * @throws {DuplicateRestockOperationError}
   * @throws {UnrecognizedError}
   */
  restockSku: (
    incomingSkuRestockedEvent: IncomingSkuRestockedEvent,
  ) => AsyncResult<void, InvalidArgumentsError | DuplicateRestockOperationError | UnrecognizedError>
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
  public async restockSku(
    incomingSkuRestockedEvent: IncomingSkuRestockedEvent,
  ): AsyncResult<void, InvalidArgumentsError | DuplicateRestockOperationError | UnrecognizedError> {
    const logContext = 'RestockSkuWorkerService.restockSku'
    console.info(`${logContext} init:`, { incomingSkuRestockedEvent })

    try {
      const restockSkuCommand = RestockSkuCommand.validateAndBuild({ incomingSkuRestockedEvent })
      await this.dbRestockSkuClient.restockSku(restockSkuCommand)
      console.info(`${logContext} exit success:`, { restockSkuCommand })
    } catch (error) {
      console.error(`${logContext} exit error:`, { error })
      throw error
    }
  }
}
