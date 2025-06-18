import { Token } from '../contract/token/token';

declare type pairQueryOutput = Record<
  string,
  {
    address: string;
    token0: Token;
    token1: Token;
  }
>;
