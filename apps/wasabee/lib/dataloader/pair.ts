import DataLoader from 'dataloader';

import { getContract } from 'viem';
import { createPublicClientByChain } from '../client';
import { getCacheKey } from '../cache';
import { factoryABI } from '../abis/factory';
import { ERC20ABI } from '../abis/erc20';
import { kv } from '../kv';
import { networksMap } from '@honeypot/shared/config/chains/network';
import { ethers } from 'ethers';

// 2. Set up your client with desired chain & transport.

export const tokenLoader = new DataLoader<
  {
    address: string;
    chainId: number;
  },
  {
    address: `0x${string}`;
    name: string;
    symbol: string;
    decimals: string;
  }
>(async (addresses) => {
  const chainId = addresses[0].chainId;
  const currentNetwork = networksMap[chainId];
  const tokensMap =
    (await kv.get<Record<string, any>>(getCacheKey(chainId, 'tokens'))) || {};
  const res = await Promise.all(
    addresses.map(async (addressChainId) => {
      const { chainId, address } = addressChainId;
      const lowerAddress = address.toLowerCase();
      let token = tokensMap?.[lowerAddress];
      if (!token) {
        const tokenContract = getContract({
          address: address as `0x${string}`,
          abi: ERC20ABI,
          client: {
            public: createPublicClientByChain(currentNetwork.chain),
          },
        });
        const [name, symbol, decimals] = await Promise.all([
          tokenContract.read.name().catch(),
          tokenContract.read.symbol().catch(),
          tokenContract.read.decimals().catch(),
        ]);
        // @ts-ignore
        token = { address, name, symbol, decimals: decimals.toString() };
        //   console.log('token', token)\
        if ((token.name || token.symbol) && token.decimals !== undefined) {
          tokensMap[address] = token;
        }
      }
      return token;
    })
  );
  await kv.set('tokens', tokensMap);
  return res;
});

export const pairByTokensLoader = new DataLoader<
  {
    token0Address: string;
    token1Address: string;
    chainId: number;
  },
  any
>(async (tokens) => {
  const chainId = tokens[0].chainId;
  // kv.del(getCacheKey(chainId, "pairsByTokens"));
  const pairsMap =
    (await kv.get<Record<string, any>>(
      getCacheKey(chainId, 'pairsByTokens')
    )) || {};
  const currentNetwork = networksMap[chainId];
  const factoryContract = getContract({
    address: currentNetwork.contracts.algebraFactory as `0x${string}`,
    abi: factoryABI,
    // 1a. Insert a single client
    client: {
      public: createPublicClientByChain(currentNetwork.chain),
    },
  });
  const pairs = await Promise.all(
    tokens.map(async (t) => {
      let pair = pairsMap?.[t.token0Address + '-' + t.token1Address];
      if (!pair) {
        const { token0Address, token1Address } = t;
        const pairAddress = await factoryContract.read.getPair([
          token0Address as `0x${string}`,
          token1Address as `0x${string}`,
        ]);
        if (pairAddress === ethers.ZeroAddress) {
          return null;
        }
        // const pairContract = getContract({ address: pairAddress as `0x${string}`, abi: IUniswapV2Pair.abi, client });
        const [token0, token1] = await tokenLoader.loadMany([
          {
            address: token0Address,
            chainId: Number(chainId),
          },
          {
            address: token1Address,
            chainId: Number(chainId),
          },
        ]);
        pair = {
          address: pairAddress,
          token0,
          token1,
        };
        pairsMap[t.token0Address + '-' + t.token1Address] = pair;
      }
      return pair;
    })
  );
  await kv.set('pairsByTokens', pairsMap);
  return pairs;
});
