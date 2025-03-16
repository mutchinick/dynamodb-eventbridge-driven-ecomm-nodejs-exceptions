import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { SQSBatchResponse, SQSEvent } from 'aws-lambda'
import { DbCreateOrderClient } from '../SyncOrderWorker/DbCreateOrderClient/DbCreateOrderClient'
import { DbGetOrderClient } from '../SyncOrderWorker/DbGetOrderClient/DbGetOrderClient'
import { DbUpdateOrderClient } from '../SyncOrderWorker/DbUpdateOrderClient/DbUpdateOrderClient'
import { EsRaiseOrderCreatedEventClient } from '../SyncOrderWorker/EsRaiseOrderCreatedEventClient/EsRaiseOrderCreatedEventClient'
import { SyncOrderWorkerController } from '../SyncOrderWorker/SyncOrderWorkerController/SyncOrderWorkerController'
import { SyncOrderWorkerService } from '../SyncOrderWorker/SyncOrderWorkerService/SyncOrderWorkerService'

/**
 *
 */
function createHandler(): (sqsEvent: SQSEvent) => Promise<SQSBatchResponse> {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const getOrderClient = new DbGetOrderClient(ddbDocClient)
  const createOrderClient = new DbCreateOrderClient(ddbDocClient)
  const updateOrderClient = new DbUpdateOrderClient(ddbDocClient)
  const syncOrderEventClient = new EsRaiseOrderCreatedEventClient(ddbDocClient)
  const syncOrderWorkerService = new SyncOrderWorkerService(
    getOrderClient,
    createOrderClient,
    updateOrderClient,
    syncOrderEventClient,
  )
  const syncOrderWorkerController = new SyncOrderWorkerController(syncOrderWorkerService)
  return syncOrderWorkerController.syncOrders
}

export const handler = createHandler()
