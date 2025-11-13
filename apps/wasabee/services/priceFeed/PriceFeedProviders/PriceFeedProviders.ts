import {
  ChartDataResponse,
  PriceFeedProvider,
  TokenCurrentPriceResponseType,
  getChartDataInputsType,
  resolutionType,
} from './../priceFeedTypes';
import { getTokenCurrentPriceTypeDataType } from './defined';
const DEFINED_API_ENDPOINT = 'https://graph.defined.fi/graphql';

export class DefinedPriceFeed implements PriceFeedProvider {
  apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  callDefinedApi = async <T extends any>(
    query: string
  ): Promise<ApiResponseType<T>> => {
    if (!this.apiKey || !query) {
      return {
        status: 'error',
        message: 'Error: API Key or query is missing.',
      };
    }

    const res = await fetch(DEFINED_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.apiKey,
      },
      body: JSON.stringify({ query: query }),
    });

    const data = await res.json();

    console.log('Defined API Response:', JSON.stringify(data, null, 2));

    return {
      status: 'success',
      data: data.data,
      message: 'Success',
    };
  };

  getTokenCurrentPrice = async (
    address: string,
    networkId: string
  ): Promise<ApiResponseType<TokenCurrentPriceResponseType>> => {
    const query = `#graphql
    {
      getTokenPrices(
        inputs: [
          { address: "${address.toString()}", networkId: ${networkId.toString()} }
        ]
      ) {
        priceUsd
        timestamp
      }
    }`;

    const data = await this.callDefinedApi<getTokenCurrentPriceTypeDataType>(
      query
    );

    if (!data || data.status === 'error') {
      return {
        status: 'error',
        message: 'Failed to fetch data.',
      };
    } else {
      // Check if the first price is null (API returns null for unsupported tokens)
      const priceData = data.data.getTokenPrices[0];
      if (!priceData || priceData.priceUsd === null) {
        return {
          status: 'error',
          message: 'Price data not available for this token.',
        };
      }

      return {
        status: 'success',
        data: {
          address: address,
          price: priceData.priceUsd,
          lastUpdated: priceData.timestamp,
        },
        message: 'Success',
      };
    }
  };

  getMultipleTokenCurrentPrice = async (
    addresses: string[],
    networkId: string
  ): Promise<ApiResponseType<TokenCurrentPriceResponseType[]>> => {
    const query = `#graphql
    {
      getTokenPrices(
        inputs: [
          ${addresses.map((address) => {
            return `{ address: "${address.toString()}", networkId: ${networkId.toString()} }`;
          })}
        ]
      ) {
        priceUsd
        timestamp
      }
    }`;

    const data = await this.callDefinedApi<getTokenCurrentPriceTypeDataType>(
      query
    );

    if (!data || data.status === 'error') {
      return {
        status: 'error',
        message: 'Failed to fetch data.',
      };
    } else {
      return {
        status: 'success',
        data: data.data.getTokenPrices.map((price, index) => {
          // Handle null prices (API returns null for unsupported tokens)
          if (!price || price.priceUsd === null) {
            return {
              address: addresses[index],
              price: 0,
              lastUpdated: undefined,
            };
          }
          return {
            address: addresses[index],
            price: price.priceUsd,
            lastUpdated: price.timestamp,
          };
        }),
        message: 'Success',
      };
    }
  };

  getTokenHistoricalPrice = async (
    address: string,
    networkId: string,
    from: number,
    to: number
  ): Promise<ApiResponseType<TokenCurrentPriceResponseType[]>> => {
    const dataAmount = 100;
    const resolution = (from - to) / dataAmount;

    const timestamps = [];
    for (let i = 0; i < dataAmount; i++) {
      timestamps.push(from - resolution * i);
    }

    //example query
    const query = `#graphql
    {
      getTokenPrices(
        inputs: [
          ${timestamps.map((timestamp) => {
            return `{ address: "${address.toString()}", networkId: ${networkId.toString()}, timestamp: ${timestamp} }`;
          })}
        ]
      ) {
        priceUsd
        timestamp
      }
    }
`;

    const data = await this.callDefinedApi<getTokenCurrentPriceTypeDataType>(
      query
    );

    if (!data || data.status === 'error') {
      return {
        status: 'error',
        message: 'Failed to fetch data.',
      };
    } else {
      return {
        status: 'success',
        data: data.data.getTokenPrices.map((price) => {
          // Handle null prices (API returns null for unsupported tokens)
          if (!price || price.priceUsd === null) {
            return {
              address: address,
              price: 0,
              lastUpdated: undefined,
            };
          }
          return {
            address: address,
            price: price.priceUsd,
            lastUpdated: price.timestamp,
          };
        }),
        message: 'Success',
      };
    }
  };

  getChartData = async (
    input: getChartDataInputsType
  ): Promise<ApiResponseType<ChartDataResponse>> => {
    const query = `{
        getBars(
          symbol: "${input.address}:${input.networkId}"
          currencyCode: "${input.currencyCode}"
          from: ${input.from}
          to: ${input.to}
          resolution: "${input.resolution}"
          quoteToken: token${input.tokenNumber ?? 0}
        ) {
          o
          h
          l
          c
          t
          v
        }
      }`;

    const res = await this.callDefinedApi<ChartDataResponse>(query);

    return res;
  };
}
