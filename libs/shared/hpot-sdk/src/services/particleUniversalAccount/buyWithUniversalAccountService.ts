import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { Token } from '../../lib/contract';
import BigNumber from 'bignumber.js';
import { wallet } from '../../lib/wallet';

class BuyWithUniversalAccountService {
  buyToken: Token | undefined = undefined;
  accountSpendAmountUSD: string = '0';
  buyTokenAmount: string = '0';

  get errorText() {
    if (
      Number(this.accountSpendAmountUSD) >
      Number(wallet.universalAccount?.accountUsdValue)
    ) {
      return 'Insufficient balance';
    }
    return '';
  }

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.buyToken,
      () => {
        this.setBuyTokenAmount('0');
        this.setAccountSpendAmountUSD('0');
      }
    );
  }

  setBuyToken(token: Token) {
    runInAction(() => {
      this.buyToken = token;
    });

  }

  setAccountSpendAmountUSD(amount: string) {
    runInAction(() => {
      if (Number.isNaN(Number(amount))) {
        this.buyTokenAmount = '0';
      } else {
        this.accountSpendAmountUSD = amount;
        if (this.buyToken) {
          this.buyTokenAmount = new BigNumber(this.accountSpendAmountUSD)
            .div(this.buyToken?.derivedUSD ?? 0)
            .toString();
        }
      }
    });
  }

  setBuyTokenAmount(amount: string) {
    runInAction(() => {
      if (Number.isNaN(Number(amount))) {
        this.accountSpendAmountUSD = '0';
      } else {
        this.buyTokenAmount = amount;
        if (this.buyToken) {
          this.accountSpendAmountUSD = new BigNumber(this.buyTokenAmount)
            .multipliedBy(this.buyToken?.derivedUSD ?? 0)
            .toString();
        }
      }
    });
  }
}

export const buyWithUniversalAccountService =
  new BuyWithUniversalAccountService();

export default buyWithUniversalAccountService;
