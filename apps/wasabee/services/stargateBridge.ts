//example "https://stargate.finance/api/v1/routes?
// srcToken=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
// &dstToken=0x3c499c542cef5e3811e1192ce70d8cc03d5c3359
// &srcAddress=0x0C0d18aa99B02946C70EAC6d47b8009b993c9BfF
// &dstAddress=0x0C0d18aa99B02946C70EAC6d47b8009b993c9BfF
// &srcChainKey=ethereum
// &dstChainKey=polygon
// &srcAmount=10000000
// &dstAmountMin=9000000"

import { makeAutoObservable, reaction } from 'mobx';

import { Token } from '@honeypot/shared/lib/contract/token/token';
import {
  stargateSupportedChain,
  stargateSupportedToken,
} from '@/config/stargateConfig';
import { wallet } from '@honeypot/shared/lib/wallet';

export class StargateBridge {
  selectedToken: Token | null = null;
  fromChainId: string | null = null;
  toChainId: string | null = null;
  fromAmount: string = '';

  constructor() {
    makeAutoObservable(this);
  }

  get toAmount() {
    return '0';
  }

  getAvailableTokens(): Token[] {
    return wallet.currentChain.validatedTokens.filter((token) =>
      stargateSupportedToken.includes(token.symbol)
    );
  }

  swapChainIds() {
    const temp = this.fromChainId;
    this.fromChainId = this.toChainId;
    this.toChainId = temp;
  }

  setSelectedToken(token: Token) {
    this.selectedToken = token;
  }

  setFromChainId(chainId: string) {
    this.fromChainId = chainId;
  }

  setToChainId(chainId: string) {
    this.toChainId = chainId;
  }

  setFromAmount(amount: string) {
    this.fromAmount = amount;
  }
}

export const stargateBridgeService = new StargateBridge();
