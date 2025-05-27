import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { InvalidArgumentsError } from '../../errors/AppError'
import { RestockSkuData } from '../../model/RestockSkuData'
import { IDbListSkusClient } from '../DbListSkusClient/DbListSkusClient'
import { IncomingListSkusRequest } from '../model/IncomingListSkusRequest'
import { ListSkusCommand, ListSkusCommandInput } from '../model/ListSkusCommand'
import { ListSkusApiService, ListSkusApiServiceOutput } from './ListSkusApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19Z03:24:00'))

const mockDate = new Date().toISOString()

function buildMockIncomingListSkusRequest(): TypeUtilsMutable<IncomingListSkusRequest> {
  const mockClass = IncomingListSkusRequest.validateAndBuild({
    sortDirection: 'asc',
    limit: 10,
  })
  return mockClass
}

const mockIncomingListSkusRequest = buildMockIncomingListSkusRequest()

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
const mockExistingSkuData: RestockSkuData[] = [
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

function buildMockDbListSkusClient_resolves(): IDbListSkusClient {
  return { listSkus: jest.fn().mockResolvedValue(mockExistingSkuData) }
}

function buildMockDbListSkusClient_throws(error?: unknown): IDbListSkusClient {
  return { listSkus: jest.fn().mockRejectedValue(error ?? new Error()) }
}

describe(`Inventory Service ListSkusApi ListSkusApiService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingListSkusRequestInput edge cases
   ************************************************************/
  it(`does not throw if the input IncomingListSkusRequest is valid`, async () => {
    const mockDbListSkusClient = buildMockDbListSkusClient_resolves()
    const listSkusApiService = new ListSkusApiService(mockDbListSkusClient)
    await expect(listSkusApiService.listSkus(mockIncomingListSkusRequest)).resolves.not.toThrow()
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequest is undefined`, async () => {
    const mockDbListSkusClient = buildMockDbListSkusClient_resolves()
    const listSkusApiService = new ListSkusApiService(mockDbListSkusClient)
    const mockTestRequest = undefined as never
    const resultPromise = listSkusApiService.listSkus(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequest is null`, async () => {
    const mockDbListSkusClient = buildMockDbListSkusClient_resolves()
    const listSkusApiService = new ListSkusApiService(mockDbListSkusClient)
    const mockTestRequest = null as never
    const resultPromise = listSkusApiService.listSkus(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  it(`throws a non-transient InvalidArgumentsError if the input
      IncomingListSkusRequest is not an instance of the class`, async () => {
    const mockDbListSkusClient = buildMockDbListSkusClient_resolves()
    const listSkusApiService = new ListSkusApiService(mockDbListSkusClient)
    const mockTestRequest = { ...mockIncomingListSkusRequest }
    const resultPromise = listSkusApiService.listSkus(mockTestRequest)
    await expect(resultPromise).rejects.toThrow(InvalidArgumentsError)
    await expect(resultPromise).rejects.toThrow(expect.objectContaining({ transient: false }))
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`throws the same Error if ListSkusCommand.validateAndBuild throws an Error`, async () => {
    const mockDbListSkusClient = buildMockDbListSkusClient_resolves()
    const listSkusApiService = new ListSkusApiService(mockDbListSkusClient)
    const mockError = new Error('mockError')
    jest.spyOn(ListSkusCommand, 'validateAndBuild').mockImplementationOnce(() => {
      throw mockError
    })

    await expect(listSkusApiService.listSkus(mockIncomingListSkusRequest)).rejects.toThrow(mockError)
  })

  it(`calls DbListSkusClient.listSkus a single time`, async () => {
    const mockDbListSkusClient = buildMockDbListSkusClient_resolves()
    const listSkusApiService = new ListSkusApiService(mockDbListSkusClient)
    await listSkusApiService.listSkus(mockIncomingListSkusRequest)
    expect(mockDbListSkusClient.listSkus).toHaveBeenCalledTimes(1)
  })

  it(`calls DbListSkusClient.listSkus with the expected input`, async () => {
    const mockDbListSkusClient = buildMockDbListSkusClient_resolves()
    const listSkusApiService = new ListSkusApiService(mockDbListSkusClient)
    await listSkusApiService.listSkus(mockIncomingListSkusRequest)
    const expectedListSkusCommandInput: ListSkusCommandInput = { ...mockIncomingListSkusRequest }
    const expectedListSkusCommand = ListSkusCommand.validateAndBuild(expectedListSkusCommandInput)
    expect(mockDbListSkusClient.listSkus).toHaveBeenCalledWith(expectedListSkusCommand)
  })

  it(`throws the same Error if DbListSkusClient.listSkus throws an unwrapped Error`, async () => {
    const mockError = new Error('mockError')
    const mockDbListSkusClient = buildMockDbListSkusClient_throws(mockError)
    const listSkusApiService = new ListSkusApiService(mockDbListSkusClient)
    const resultPromise = listSkusApiService.listSkus(mockIncomingListSkusRequest)
    await expect(resultPromise).rejects.toThrow(mockError)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected ListSkusApiServiceOutput if the execution path is
      successful`, async () => {
    const mockDbListSkusClient = buildMockDbListSkusClient_resolves()
    const listSkusApiService = new ListSkusApiService(mockDbListSkusClient)
    const result = await listSkusApiService.listSkus(mockIncomingListSkusRequest)
    const expectedResult: ListSkusApiServiceOutput = {
      skus: [
        {
          sku: mockExistingSkuData[0].sku,
          units: mockExistingSkuData[0].units,
          lotId: mockExistingSkuData[0].lotId,
          createdAt: mockExistingSkuData[0].createdAt,
          updatedAt: mockExistingSkuData[0].updatedAt,
        },
        {
          sku: mockExistingSkuData[1].sku,
          units: mockExistingSkuData[1].units,
          lotId: mockExistingSkuData[1].lotId,
          createdAt: mockExistingSkuData[1].createdAt,
          updatedAt: mockExistingSkuData[1].updatedAt,
        },
      ],
    }
    expect(result).toStrictEqual(expectedResult)
  })
})
