import { WNATIVE, Token, ChainId } from '@cryptoalgebra/sdk';
import { STABLECOINS, VALIDATED_TOKENS } from './tokens';

type ChainTokenList = {
  readonly [chainId: number]: Token[];
};

export const WNATIVE_EXTENDED: { [chainId: number]: Token } = {
  ...WNATIVE,
};

const WNATIVE_ONLY: ChainTokenList = Object.fromEntries(
  Object.entries(WNATIVE_EXTENDED).map(([key, value]) => [key, [value]])
);

export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WNATIVE_ONLY,
  // [ChainId.Holesky]: [...WNATIVE_ONLY[ChainId.Holesky], STABLECOINS.USDT],
  [ChainId.BerachainTestnet]: [
    ...WNATIVE_ONLY[ChainId.BerachainTestnet],
    STABLECOINS.USDT,
    STABLECOINS.HONEY,
    STABLECOINS.USDT,
    VALIDATED_TOKENS.THPOT,
    VALIDATED_TOKENS.NECT,
  ],
};
