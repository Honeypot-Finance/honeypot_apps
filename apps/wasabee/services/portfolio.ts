import { makeAutoObservable, reaction } from "mobx";
import { Token } from "./contract/token";
import { wallet } from "./wallet";
import BigNumber from "bignumber.js";
import { AsyncState } from "./utils";
import { getMultipleTokensData } from "@/lib/algebra/graphql/clients/token";
import { getSingleAccountDetails } from "@/lib/algebra/graphql/clients/account";

class Portfolio {
  tokens: Token[] = [];
  isInit = false;
  isLoading = true;

  constructor() {
    makeAutoObservable(this);
  }

  get totalBalance() {
    return this.tokens.reduce((total, token) => {
      return total.plus(token.balance.times(token.derivedUSD));
    }, new BigNumber(0));
  }

  async initPortfolio() {
    if (this.isInit || !wallet.isInit) return;

    this.isLoading = true;

    try {
      // Get validated tokens from current chain
      const validatedTokens = wallet.currentChain?.validatedTokens || [];
      console.log("validatedTokens", validatedTokens);
      // Initialize tokens

      const tokenIds = validatedTokens.map((token) =>
        token.address.toLowerCase()
      );

      //also add any account holding tokens
      console.log("wallet.account", wallet.account);
      const account = await getSingleAccountDetails(wallet.account);
      console.log("account", account);
      const accountHoldingTokenIds = account.account?.holder.map(
        (holder) => holder.token.id
      );
      console.log("accountHoldingTokenIds", accountHoldingTokenIds);
      const allTokenIds = [...tokenIds, ...(accountHoldingTokenIds || [])];
      console.log("allTokenIds", allTokenIds);
      const tokensData = await getMultipleTokensData(allTokenIds);
      console.log("tokensData", tokensData);
      const tokens = tokensData?.tokens.map((token) => {
        //remove marketCap from token
        const { marketCap, ...rest } = token;

        return Token.getToken({
          ...rest,
          address: token.id.toLowerCase(),
          derivedETH: token.derivedMatic,
          derivedUSD: token.derivedUSD,
        });
      });
      console.log(
        "tokens",
        tokens?.map((token) => token.address)
      );
      // Filter tokens with balance

      await Promise.all(
        tokens?.map(async (token) => {
          try {
            await token.getBalance();
          } catch (error) {
            console.error("Error getting balance for token", token.address);
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
      console.error("Portfolio initialization error:", error);
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
