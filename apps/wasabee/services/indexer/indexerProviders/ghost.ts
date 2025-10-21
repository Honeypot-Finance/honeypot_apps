import {
  GhostFtoPairResponse,
  GhostAPIOpt,
  GhostFtoTokensResponse,
  GhostLaunchPair,
  GhostFTOPair,
  PageRequest,
  GhostToken,
  PairFilter,
  holdingPairs,
  GhostHoldingPairsResponse,
  TrendingMEMEs,
  GhostParticipatedProjectsResponse,
  GhostPoolPair,
  GhostPoolPairResponse,
  GhostBundleResponse,
  GhostAlgebraPoolPair,
  GhostAlgebraPairResponse,
} from './../indexerTypes';
import { networksMap } from '@honeypot/shared/config/chains/network';
import { PageInfo } from '@honeypot/shared/lib/graphql';
import dayjs from 'dayjs';

const memeGraphHandle = '5e83143f-8481-4564-afc2-7b7a766afef9/ghostgraph';
const ftoGraphHandle = 'df583977-1412-4c0a-9b3a-ebea68604f3a/ghostgraph';
const memelaunchGraphHandle = '6250c399-1065-408f-9491-24a000b9d62d/ghostgraph';
const pairGraphHandle = '35512369-5e78-4bcc-ab57-8a1a506d842a/ghostgraph';

function getTimeStampToDayNow() {
  return Math.floor(dayjs().unix() / 86400);
}

export class GhostIndexer {
  apiKey: string;
  apiEndpoint: string;

  constructor(apiKey: string, apiEndpoint: string) {
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint;
  }

  callIndexerApi = async <T>(
    query: string,
    option: GhostAPIOpt
  ): Promise<ApiResponseType<any>> => {
    if (!this.apiKey || !query) {
      return {
        status: 'error',
        message: 'Error: API Key or query is missing.',
      };
    }

    const res = await fetch(this.apiEndpoint + option.apiHandle, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GHOST-KEY': this.apiKey,
      },
      body: JSON.stringify({ query: query }),
    });

    if (res.status === 200) {
      const data = await res.json();
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }
      return {
        status: 'success',
        data: data.data,
        message: 'Success',
      };
    } else {
      throw new Error(res.statusText);
    }
  };

  getMostSuccessfulFTOPairs = async (
    chainId: string,
    limit: number
  ): Promise<ApiResponseType<GhostFtoPairResponse>> => {
    const query = `#graphql
    {
      pairs(
        where:{
          status: "3"
        }
        orderBy: "depositedRaisedToken"
        orderDirection: "desc"
        limit: ${limit}
      ) {
        items {
          id
          token0Id
          token1Id
          depositedRaisedToken
          depositedLaunchedToken
          createdAt
          endTime
          status
          token0 {
            id
            name
            symbol
            decimals
          }
          token1 {
            id
            name
            symbol
            decimals
          }
        }
      }
    }
  `;

    const res = await this.callIndexerApi(query, { apiHandle: ftoGraphHandle });

    if (res.status === 'error') {
      return res;
    } else {
      let pairs = ((res.data as any)?.pairs?.items as GhostFTOPair[]) ?? [];
      let pageInfo = (res.data as any)?.pairs?.pageInfo as PageInfo;

      return {
        status: 'success',
        message: 'Success',
        data: { pairs: pairs, pageInfo: pageInfo },
      };
    }
  };

  getAllFtoTokens = async (): Promise<
    ApiResponseType<GhostFtoTokensResponse>
  > => {
    const query = `#graphql
        {
          erc20s {
            items {
              id
              name
              symbol
              decimals
            }
          }
        }
      `;

    const res = await this.callIndexerApi(query, { apiHandle: ftoGraphHandle });

    if (res.status === 'error') {
      return res;
    } else {
      return {
        status: 'success',
        message: 'Success',
        data: (res.data as any).erc20s.items as GhostFtoTokensResponse,
      };
    }
  };

  getAllPairs = async (): Promise<ApiResponseType<GhostPoolPairResponse>> => {
    const query = `#graphql
        {
          pairs (
            limit: 1000
          ){
            items {
              id
              trackedReserveETH
              trackedReserveUSD
              token0 {
                id
                name
                symbol
                decimals
              }
              token1 {
                id
                name
                symbol
                decimals
              }
            }
            pageInfo {
              hasPreviousPage
              hasNextPage
              startCursor
              endCursor
            }
          }
        }
      `;

    const res = await this.callIndexerApi(query, {
      apiHandle: pairGraphHandle,
    });

    if (res.status === 'error') {
      return res;
    } else {
      return {
        status: 'success',
        message: 'Success',
        data: {
          pairs: (res.data as any).pairs?.items as GhostPoolPair[],
          pageInfo: (res.data as any).pairs?.pageInfo as PageInfo,
        },
      };
    }
  };

  getBundle = async (
    chainId: string
  ): Promise<ApiResponseType<GhostBundleResponse>> => {
    const query = `
      {
        bundle(
          id:"1"
        ){
            id
            price
            totalETH
            totalUSD
        }
      }
    `;

    const res = await this.callIndexerApi(query, {
      apiHandle: pairGraphHandle,
    });

    if (res.status === 'error') {
      return res;
    } else {
      return {
        status: 'success',
        message: 'Success',
        data: res.data,
      };
    }
  };

  getHoldingPairs = async (
    walletAddress: string,
    chainId: string,
    filter?: Partial<PairFilter>,
    pageRequest?: PageRequest
  ): Promise<ApiResponseType<GhostHoldingPairsResponse>> => {
    const dirCondition = pageRequest?.cursor
      ? pageRequest?.direction === 'next'
        ? `after:"${pageRequest?.cursor}"`
        : `before:"${pageRequest?.cursor}"`
      : '';

    const searchStringCondition = filter?.searchString
      ? `pair_:{
            searchString_contains:"${filter.searchString.toLowerCase()}"
          },`
      : ``;

    const tradingVolumeSortingCondition =
      filter?.sortingTarget === 'tradingVolumeYesterday'
        ? `pair_:{
            timeStampToday:"${getTimeStampToDayNow()}"
          },`
        : '';

    const query = `
    {
      holdingPairs(
        where: {
            ${tradingVolumeSortingCondition}
            holder: "${walletAddress}",
            totalLpAmount_gt: "0",
            ${searchStringCondition}
          },
          ${
            filter?.sortingTarget
              ? `orderBy: "${filter.sortingTarget}",`
              : `orderBy: "totalLpAmount"`
          }
          ${
            filter?.sortingDirection
              ? `orderDirection: "${filter.sortingDirection}",`
              : `orderDirection: "desc",`
          }
        limit: ${filter?.limit ?? 10}, 
        ${dirCondition}
      ) {
        items {
          pairId
          totalLpAmount
          deCreaselpAmount
          inCreaselpAmount
          pair{
            trackedReserveETH
            trackedReserveUSD
            token0Id
            token1Id
            token0name
            token1name
            token0symbol
            token1symbol

            timeStampToday
            tradingVolumeToday
            tradingVolumeYesterday

            token0 {
                id
                name
                symbol
                decimals
                derivedETH
                derivedUSD
                holderCount
                swapCount
              }
              token1 {
                id
                name
                symbol
                decimals
                derivedETH
                derivedUSD
                holderCount
                swapCount
              }
          }
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
      }
    }
  `;

    console.log('getHoldingPairs', query);

    const res = await this.callIndexerApi(query, {
      apiHandle: pairGraphHandle,
    });

    res.status === 'success' &&
      res.data.holdingPairs.items.map(
        (item: holdingPairs) =>
          `${item.pair.token0symbol}-${item.pair.token1symbol} ${item.totalLpAmount}`
      );

    if (res.status === 'error') {
      return res;
    } else {
      return {
        status: 'success',
        message: 'Success',
        data: {
          holdingPairs: (res.data as any).holdingPairs?.items as holdingPairs[],
          pageInfo: (res.data as any).holdingPairs?.pageInfo as PageInfo,
        },
      };
    }
  };

  getFilteredPairs = async (
    filter: Partial<PairFilter>,
    chainId: string,
    provider?: string,
    pageRequest?: PageRequest
  ): Promise<ApiResponseType<GhostPoolPairResponse>> => {
    console.log(filter);
    const dirCondition = pageRequest?.cursor
      ? pageRequest?.direction === 'next'
        ? `after:"${pageRequest?.cursor}"`
        : `before:"${pageRequest?.cursor}"`
      : '';

    const tradingVolumeSortingCondition =
      filter.sortingTarget === 'tradingVolumeYesterday'
        ? `timeStampToday:"${getTimeStampToDayNow()}",`
        : '';

    const query = `
        {
          pairs(
            ${filter.sortingTarget ? `orderBy: "${filter.sortingTarget}",` : ''}
            ${
              filter.sortingDirection
                ? `orderDirection: "${filter.sortingDirection}",`
                : ''
            }
            where: {
              ${tradingVolumeSortingCondition}
              ${
                filter.searchString
                  ? `
              OR: [
                ${
                  filter.searchString.startsWith('0x')
                    ? `{ id: "${filter.searchString}"  }`
                    : ''
                }
                
                 ${
                   filter.searchString.startsWith('0x')
                     ? `{ token1Id: "${filter.searchString}"  }`
                     : ''
                 }
                
                 ${
                   filter.searchString.startsWith('0x')
                     ? `{ token1Id: "${filter.searchString}"  }`
                     : ''
                 }

                {searchString_contains:"${filter.searchString.toLowerCase()}" }
              ]`
                  : ''
              }
            }
            limit: ${filter.limit}
            ${dirCondition}
          ) {
            items {
              id
              trackedReserveETH
              trackedReserveUSD
              timeStampToday
              tradingVolumeToday
              tradingVolumeYesterday
              token0 {
                id
                name
                symbol
                decimals
                derivedETH
                derivedUSD
                holderCount
                swapCount
              }
              token1 {
                id
                name
                symbol
                decimals
                derivedETH
                derivedUSD
                holderCount
                swapCount
              }
            }
            pageInfo {
              hasPreviousPage
              hasNextPage
              startCursor
              endCursor
            }
          }
        }
      `;

    console.log('filtered pairs: ', query);

    const res = await this.callIndexerApi(query, {
      apiHandle: pairGraphHandle,
    });

    if (res.status === 'error') {
      return res;
    } else {
      return {
        status: 'success',
        message: 'Success',
        data: {
          pairs: (res.data as any).pairs?.items as GhostPoolPair[],
          pageInfo: (res.data as any).pairs?.pageInfo as PageInfo,
        },
      };
    }
  };

  getValidatedTokenPairs = async (
    chainId: string
  ): Promise<ApiResponseType<GhostPoolPairResponse>> => {
    const validatedPairs: {
      token0: string;
      token1: string;
    }[] = [];

    const addresses = Object.entries(networksMap[chainId].validatedTokensInfo)
      .filter(([, value]) => value?.isRouterToken ?? false)
      .map(([key]) => key);

    addresses.forEach((address0: string) => {
      addresses.forEach((address1: string) => {
        if (address0 !== address1) {
          validatedPairs.push({
            token0: address0,
            token1: address1,
          });
        }
      });
    });

    const query = `
      query {   
        pairs(
        where: {OR:[${validatedPairs.map((pair) => {
          return `
                  {token0Id: "${pair.token0}", token1Id: "${pair.token1}"}
                  {token0Id: "${pair.token1}", token1Id: "${pair.token0}"}
                  `;
        })}]}
      ) {
        items {
          id
          token0{
            id
            name
            symbol
            decimals
            derivedETH
            derivedUSD
            holderCount
            swapCount
          }
          token1{
            id
            name
            symbol
            decimals
            derivedETH
            derivedUSD
            holderCount
            swapCount
          }
        }
      }
    }`;

    const res = await this.callIndexerApi(query, {
      apiHandle: pairGraphHandle,
    });

    if (res.status === 'error') {
      return res;
    } else {
      return {
        status: 'success',
        message: 'Success',
        data: {
          pairs: (res.data as any).pairs?.items as GhostPoolPair[],
          pageInfo: (res.data as any).pairs?.pageInfo as PageInfo,
        },
      };
    }
  };

  getPairTokensData = async (
    tokenAddresses: readonly string[]
  ): Promise<ApiResponseType<GhostToken[]>> => {
    const query = `
      {
        tokens(where: {
        id_in: [${tokenAddresses.map((address) => `"${address}"`).join(',')}]
      }) {
          items{
          id
          decimals
          derivedETH
          derivedUSD
          holderCount
          swapCount
          symbol
          name
          }
        }
      }`;

    const res = await this.callIndexerApi(query, {
      apiHandle: pairGraphHandle,
    });

    console.log(res);

    if (res.status === 'error') {
      return res;
    } else {
      return {
        status: 'success',
        message: 'Success',
        data: (res.data as any).tokens.items as GhostToken[],
      };
    }
  };
  getPairTokenData = async (
    tokenAddress: string,
    chianId: string
  ): Promise<ApiResponseType<GhostToken>> => {
    const query = `
      {
        token(id: "${tokenAddress}") {
          id
          decimals
          derivedETH
          derivedUSD
          holderCount
          swapCount
          symbol
          name
        }
      }`;

    const res = await this.callIndexerApi(query, {
      apiHandle: pairGraphHandle,
    });

    console.log(res);

    if (res.status === 'error') {
      return res;
    } else {
      return {
        status: 'success',
        message: 'Success',
        data: (res.data as any).token as GhostToken,
      };
    }
  };

  async getTrendingMEMEPairs(): Promise<ApiResponseType<TrendingMEMEs>> {
    console.log('endtime', dayjs().unix());

    const query = `{
        pairs(
          where:{
            endTime_gt:"${dayjs().unix()}"
            status: "3"
          }
          limit: 5
          orderBy: "depositedRaisedToken"
          orderDirection: "desc"
        ) {
          items {
            id
            status
            depositedRaisedToken
            depositedLaunchedToken
            token0 {
              id
              name
              symbol
              decimals
            }
            token1 {
              id
              name
              symbol
              decimals
            }
          }
        }
      }
  `;

    console.log('query', query);

    const res = await this.callIndexerApi(query, {
      apiHandle: memeGraphHandle,
    });

    if (res.status === 'error') {
      return res;
    } else {
      return {
        status: 'success',
        message: 'Success',
        data: res.data,
      };
    }
  }

  async getPairByTokens({
    token0,
    token1,
  }: {
    token0: string;
    token1: string;
  }) {
    const query = `
      query {   
        pairs0: pairs(
        where: {OR:[{token0Id: "${token0}", token1Id: "${token1}"},{token0Id: "${token1}", token1Id: "${token0}"}]}
  ) {
    items {
      address: id
      token0{
        address: id
        name
        symbol
        decimals
        derivedETH
        derivedUSD
        holderCount
        swapCount
      }
      token1{
        address: id
        name
        symbol
        decimals
        derivedETH
        derivedUSD
        holderCount
        swapCount
      }
      reserve0
      reserve1
    }
  }
    
  pairs1: pairs(
    where: {token0Id: "${token1}", token1Id: "${token0}"}
  ) {
    items {
      address: id
      token0{
        address: id
        name
        symbol
        decimals
        derivedETH
        derivedUSD
        holderCount
        swapCount
      }
      token1{
        address: id
        name
        symbol
        decimals
        derivedETH
        derivedUSD
        holderCount
        swapCount
      }
      reserve0
      reserve1
    }
  }

  }`;

    const res = await this.callIndexerApi(query, {
      apiHandle: pairGraphHandle,
    });

    if (res.status === 'success') {
      return res.data.pairs0.items[0] || res.data.pairs1.items[0];
    }
    return res;
  }

  async getMemeGraphData(tokenAddress: string) {
    const query = `
      query {
        raisedTokenDeposits(
          orderBy: "timestamp"
          orderDirection: "desc"
          where: {launchId: "${tokenAddress}"}
        ) {
          items {
            id
            launchId
            amount
            currentAmount
            timestamp
            txHash
          }
        }
      }
    `;

    const res = await this.callIndexerApi(query, {
      apiHandle: memelaunchGraphHandle,
    });

    if (res.status === 'success') {
      return res.data.raisedTokenDeposits.items;
    }
    return res;
  }
}
