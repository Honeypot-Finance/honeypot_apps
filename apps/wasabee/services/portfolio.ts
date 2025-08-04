import { makeAutoObservable, reaction } from 'mobx';

import { Token } from '@honeypot/shared';
import { wallet } from '@honeypot/shared/lib/wallet';
import BigNumber from 'bignumber.js';
import { AsyncState } from '@honeypot/shared';
import { getMultipleTokensData } from '@/lib/algebra/graphql/clients/token';
import { getSingleAccountDetails } from '@/lib/algebra/graphql/clients/account';
import { getSubgraphClientByChainId } from '@honeypot/shared';

class Portfolio {
  tokens: Token[] = [];
  isInit = false;
  isLoading = true;

  constructor() {
    makeAutoObservable(this);
    reaction(
      () => wallet.account,
      () => {
        this.initPortfolio();
      }
    );
    reaction(
      () => wallet.currentChainId,
      () => {
        this.initPortfolio();
      }
    );
  }

  get totalBalance() {
    return this.tokens.reduce((total, token) => {
      return total.plus(token.balance.times(token.derivedUSD));
    }, new BigNumber(0));
  }

  async initPortfolio() {
    if (this.isInit || !wallet.isInit) return;

    const infoClient = getSubgraphClientByChainId(
      wallet.currentChainId.toString(),
      'algebra_info'
    );

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
      const account = await getSingleAccountDetails(infoClient, wallet.account);
      console.log('account', account);
      const accountHoldingTokenIds = account.account?.holder.map(
        (holder) => holder.token.id
      );
      console.log('accountHoldingTokenIds', accountHoldingTokenIds);
      const allTokenIds = [...tokenIds, ...(accountHoldingTokenIds || [])];
      console.log('allTokenIds', allTokenIds);
      const tokensData = await getMultipleTokensData(
        allTokenIds,
        wallet.currentChainId.toString()
      );
      console.log('tokensData', tokensData);
      const tokens = tokensData?.map((token) => {
        //remove marketCap from token
        const { marketCap, ...rest } = token;

        return Token.getToken({
          ...rest,
          address: token.id.toLowerCase(),
          derivedETH: token.derivedMatic,
          derivedUSD: token.derivedUSD,
          chainId: wallet.currentChainId.toString(),
        });
      });
      console.log(
        'tokens',
        tokens?.map((token) => token.address)
      );
      // Filter tokens with balance

      await Promise.all(
        tokens?.map(async (token) => {
          try {
            await token.getBalance();
          } catch (error) {
            console.error('Error getting balance for token', token.address);
          }
        }) ?? []
      );

      this.tokens =
        tokens?.filter((token) => token.balance.toNumber() > 0) ?? [];

      if (wallet.currentChain?.nativeToken) {
        const nativeTokenPrice = validatedTokens.find(
          (token) => token.address === wallet.currentChain.nativeToken.address
        )?.derivedUSD;
        if (nativeTokenPrice) {
          wallet.currentChain.nativeToken.derivedUSD = nativeTokenPrice;
          this.tokens.push(wallet.currentChain.nativeToken);
        }
      }
    } catch (error) {
      console.error('Portfolio initialization error:', error);
    } finally {
      this.isLoading = false;
      this.isInit = true;
    }
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
