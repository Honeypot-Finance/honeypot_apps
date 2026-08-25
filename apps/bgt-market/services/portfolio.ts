import { makeAutoObservable, reaction } from 'mobx';

import { Token } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import BigNumber from 'bignumber.js';
import { AsyncState } from '@honeypot/shared';
import { getMultipleTokensData } from '@/lib/algebra/graphql/clients/token';
import { getSingleAccountDetails } from '@/lib/algebra/graphql/clients/account';

class Portfolio {
  tokens: Token[] = [];
  isInit = false;
  totalBalance = new BigNumber(0);
  isLoading = true;

  constructor() {
    makeAutoObservable(this);
  }

  async initPortfolio() {
    console.log('initPortfolio', { isInit: this.isInit });
    if (this.isInit || !wallet.isInit) return;

    this.isLoading = true;

    try {
      // Get validated tokens from current chain
      const validatedTokens = wallet.currentChain?.validatedTokens || [];
      console.log('validatedTokens', validatedTokens);
      // Initialize tokens

      const tokenIds = validatedTokens.map((token) =>
        token.address.toLowerCase()
      );
      //also add any account holding tokens
      console.log('wallet.account', wallet.account);
      const account = await getSingleAccountDetails(wallet.account);
      console.log('account', account);
      const accountHoldingTokenIds = account.account?.holder.map(
        (holder) => holder.token.id
      );
      console.log('accountHoldingTokenIds', accountHoldingTokenIds);
      const allTokenIds = [...tokenIds, ...(accountHoldingTokenIds || [])];
      console.log('allTokenIds', allTokenIds);
      const tokensData = await getMultipleTokensData(allTokenIds);
      console.log('tokensData', tokensData);
      const tokens = tokensData?.tokens.map((token) => {
        //remove marketCap from token
        const { marketCap, ...rest } = token;

        return Token.getToken({
          chainId: wallet.currentChainId.toString(),
          ...rest,
          address: token.id.toLowerCase(),
          derivedETH: token.derivedMatic,
          derivedUSD: token.derivedUSD,
        });
      });
      console.log(
        'tokens',
        tokens?.map((token) => token.address)
      );
      // Filter tokens with balance

      await Promise.all(
        tokens?.map((token) => {
          try {
            token.getBalance();
          } catch (error) {
            console.error('Error getting balance for token', token.address);
          }
        }) ?? []
      );

      this.tokens =
        tokens?.filter((token) => token.balance.toNumber() > 0) ?? [];

      // Calculate total balance in USD`
      this.calculateTotalBalance();
    } catch (error) {
      console.error('Portfolio initialization error:', error);
    } finally {
      this.isLoading = false;
      this.isInit = true;
    }
  }

  calculateTotalBalance() {
    this.totalBalance = this.tokens.reduce((total, token) => {
      const tokenUSDValue = new BigNumber(token.derivedUSD || 0).multipliedBy(
        token.balance
      );
      return total.plus(tokenUSDValue);
    }, new BigNumber(0));
  }

  // Refresh token balances
  refreshBalances = new AsyncState(async () => {
    this.isLoading = true;

    try {
      await Promise.all(
        this.tokens.map(async (token) => {
          await token.getBalance();
          await token.getIndexerTokenData({ force: true });
        })
      );

      this.calculateTotalBalance();
    } finally {
      this.isLoading = false;
    }
  });

  get sortedTokens() {
    return [...this.tokens].sort((a, b) => {
      const aValue = new BigNumber(a.derivedUSD || 0).multipliedBy(a.balance);
      const bValue = new BigNumber(b.derivedUSD || 0).multipliedBy(b.balance);
      return bValue.minus(aValue).toNumber();
    });
  }

  get totalBalanceFormatted() {
    return this.totalBalance.toFixed(2);
  }
}

export const portfolio = new Portfolio();
