import { WNATIVE, Token, ChainId } from "@cryptoalgebra/sdk";
import { STABLECOINS, VALIDATED_TOKENS } from "./tokens";

type ChainTokenList = {
  readonly [chainId: number]: Token[];
};

export const WNATIVE_EXTENDED: { [chainId: number]: Token } = {
  ...WNATIVE,
};

const WNATIVE_ONLY: ChainTokenList = Object.fromEntries(
  Object.entries(WNATIVE_EXTENDED).map(([key, value]) => [key, [value]])
);

// Add common BSC tokens for routing
const BSC_USDT = new Token(
  56,
  '0x55d398326f99059ff775485246999027b3197955',
  18,
  'USDT',
  'Binance-Peg BSC-USD'
);

const BSC_USDC = new Token(
  56,
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
  18,
  'USDC',
  'Binance-Peg USD Coin'
);

const BSC_BUSD = new Token(
  56,
  '0xe9e7cea3dedca5984780bafc599bd69add087d56',
  18,
  'BUSD',
  'Binance-Peg BUSD Token'
);

export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WNATIVE_ONLY,
  // [ChainId.Holesky]: [...WNATIVE_ONLY[ChainId.Holesky], STABLECOINS.USDT],
  [ChainId.BerachainMainnet]: [
    ...WNATIVE_ONLY[ChainId.BerachainMainnet],
    STABLECOINS.USDT,
    STABLECOINS.HONEY,
    STABLECOINS.USDT,
    VALIDATED_TOKENS.THPOT,
    VALIDATED_TOKENS.NECT,
  ],
  // Add BSC routing tokens
  [56]: [
    ...(WNATIVE_ONLY[56] || []),
    BSC_USDT,
    BSC_USDC,
    BSC_BUSD,
  ],
};
