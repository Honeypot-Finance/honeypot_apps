import { createPublicClient, getContract, http, fallback } from "viem";
import { Chain } from "viem/chains";

export const createPublicClientByChain = (chain: Chain) =>
  createPublicClient({
    chain: chain,
    batch: {
      multicall: true,
    },
    transport: fallback(
      chain.rpcUrls.default.http.map((url) => http(url)),
      {
        retryCount: 3,
        retryDelay: 1000,
      }
    ),
  });
