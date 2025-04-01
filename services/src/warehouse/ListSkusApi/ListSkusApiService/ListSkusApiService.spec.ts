import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { RestockSkuData } from '../../model/RestockSkuData'
import { IDbListSkusClient } from '../DbListSkusClient/DbListSkusClient'
import { IncomingListSkusRequest } from '../model/IncomingListSkusRequest'
import { ListSkusCommand, ListSkusCommandInput } from '../model/ListSkusCommand'
import { ListSkusApiService, ListSkusApiServiceOutput } from './ListSkusApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockIncomingListSkusRequest_ListDefault(): TypeUtilsMutable<IncomingListSkusRequest> {
  const mockClass = IncomingListSkusRequest.validateAndBuild({})
  return mockClass
}

//
// Mock clients
//
const mockExistingRestockSkuData: RestockSkuData[] = [
  {
    sku: 'mockSku-1',
    units: 12,
    lotId: 'mockLotId-1',
    createdAt: mockDate,
    updatedAt: mockDate,
  },
  {
    sku: `mockSku-2`,
    units: 6,
    lotId: 'mockLotId-2',
    createdAt: mockDate,
    updatedAt: mockDate,
  },
]

function buildMockDdListSkusClient_resolves(): IDbListSkusClient {
  return { listSkus: jest.fn().mockResolvedValue(mockExistingRestockSkuData) }
}

function buildMockDdListSkusClient_throws(error?: unknown): IDbListSkusClient {
  return { listSkus: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Warehouse Service ListSkusApi ListSkusApiService tests`, () => {
  //
  // Test IncomingListSkusRequestInput edge cases
  //
  it(`does not throw if the input ListSkusApiServiceInput is valid`, async () => {
    const mockDdListSkusClient = buildMockDdListSkusClient_resolves()
    const listSkusApiService = new ListSkusApiService(mockDdListSkusClient)
    const mockTestRequest = buildMockIncomingListSkusRequest_ListDefault()
    await expect(listSkusApiService.listSkus(mockTestRequest)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input ListSkusApiServiceInput is undefined`, async () => {
    const mockDdListSkusClient = buildMockDdListSkusClient_resolves()
    const listSkusApiService = new ListSkusApiService(mockDdListSkusClient)
    const mockTestRequest = undefined as never
    const resultPromise = listSkusApiService.listSkus(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input ListSkusApiServiceInput is null`, async () => {
    const mockDdListSkusClient = buildMockDdListSkusClient_resolves()
    const listSkusApiService = new ListSkusApiService(mockDdListSkusClient)
    const mockTestRequest = null as never
    const resultPromise = listSkusApiService.listSkus(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  //
  // Test internal logic
  //
  it(`calls DdListSkusClient.listSkus a single time`, async () => {
    const mockDdListSkusClient = buildMockDdListSkusClient_resolves()
    const listSkusApiService = new ListSkusApiService(mockDdListSkusClient)
    const mockTestRequest = buildMockIncomingListSkusRequest_ListDefault()
    await listSkusApiService.listSkus(mockTestRequest)
    expect(mockDdListSkusClient.listSkus).toHaveBeenCalledTimes(1)
  })

  it(`calls DdListSkusClient.listSkus with the expected input`, async () => {
    const mockDdListSkusClient = buildMockDdListSkusClient_resolves()
    const listSkusApiService = new ListSkusApiService(mockDdListSkusClient)
    const mockTestRequest = buildMockIncomingListSkusRequest_ListDefault()
    await listSkusApiService.listSkus(mockTestRequest)
    const expectedListSkusCommandInput: ListSkusCommandInput = { ...mockTestRequest }
    const expectedListSkusCommand = ListSkusCommand.validateAndBuild(expectedListSkusCommandInput)
    expect(mockDdListSkusClient.listSkus).toHaveBeenCalledWith(expectedListSkusCommand)
  })

  it(`throws the same Error if DdListSkusClient.listSkus throws an unwrapped Error`, async () => {
    const mockError = new Error('mockError')
    const mockDdListSkusClient = buildMockDdListSkusClient_throws(mockError)
    const listSkusApiService = new ListSkusApiService(mockDdListSkusClient)
    const mockTestRequest = buildMockIncomingListSkusRequest_ListDefault()
    const resultPromise = listSkusApiService.listSkus(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(mockError)
  })

  //
  // Test expected results
  //
  it(`returns a ListSkusApiServiceOutput with the expected data from DdListSkusClient.listSkus`, async () => {
    const mockDdListSkusClient = buildMockDdListSkusClient_resolves()
    const listSkusApiService = new ListSkusApiService(mockDdListSkusClient)
    const mockTestRequest = buildMockIncomingListSkusRequest_ListDefault()
    const result = await listSkusApiService.listSkus(mockTestRequest)
    const expectedResult: ListSkusApiServiceOutput = {
      skus: [
        {
          sku: mockExistingRestockSkuData[0].sku,
          units: mockExistingRestockSkuData[0].units,
          lotId: mockExistingRestockSkuData[0].lotId,
          createdAt: mockExistingRestockSkuData[0].createdAt,
          updatedAt: mockExistingRestockSkuData[0].updatedAt,
        },
        {
          sku: mockExistingRestockSkuData[1].sku,
          units: mockExistingRestockSkuData[1].units,
          lotId: mockExistingRestockSkuData[1].lotId,
          createdAt: mockExistingRestockSkuData[1].createdAt,
          updatedAt: mockExistingRestockSkuData[1].updatedAt,
        },
      ],
    }
    expect(result).toStrictEqual(expectedResult)
  })
})
