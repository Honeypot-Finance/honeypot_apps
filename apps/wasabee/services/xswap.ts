import { makeAutoObservable, reaction, autorun } from 'mobx';
import { wallet } from './wallet';
import { Token } from './contract/token';
import { SwapFieldType } from '@/types/algebra/types/swap-field';
import BigNumber from 'bignumber.js';
import { Trade, TradeType } from '@cryptoalgebra/sdk';
import { Currency } from '@cryptoalgebra/sdk';
import { SwapCallEstimate } from '@/lib/algebra/hooks/swap/useSwapCallback';
import { SuccessfulCall } from '@/lib/algebra/hooks/swap/useSwapCallback';
import { ContractWrite } from './utils';
import { Token as IndexerToken } from '@/lib/algebra/graphql/generated/graphql';
import {
  ApprovalState,
  ApprovalStateType,
} from '@/types/algebra/types/approve-state';
import { getMultipleTokensData } from '@/lib/algebra/graphql/clients/token';

export interface XChildSwap {
  fromToken: Token;
  toToken: Token;
  trade: Trade<Currency, Currency, TradeType> | undefined;
  typedValue: string;
  setTypedValue: (value: string) => void;
  onUserInput: (field: SwapFieldType, value: string) => void;
  isSelected: boolean;
  setIsSelected: (value: boolean) => void;
  bestCall: SuccessfulCall | SwapCallEstimate | undefined;
  approvalState: ApprovalStateType;
}

class XSwap {
  xSwapTokens: Token[] = [];
  isInitialized = false;
  swaps: XChildSwap[] = [];

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => wallet.currentChain,
      () => {
        this.xSwapTokens = [
          ...wallet.currentChain?.validatedTokens,
          wallet.currentChain?.nativeToken,
        ];
      }
    );
  }

  selectAllTokens() {
    this.swaps.forEach((swap) => {
      swap.setIsSelected(true);
    });
  }

  maxAllTokens() {
    this.swaps.forEach((swap) => {
      swap.setTypedValue(
        Token.getToken({
          address: swap.fromToken.address,
          chainId: wallet.currentChainId.toString(),
        })?.balance.toString()
      );
    });
  }

  reset() {
    //reset swaps state
    this.swaps.forEach((swap) => {
      swap.setIsSelected(false);
      swap.setTypedValue('0');
    });

    //reload balances
    this.xSwapTokens.forEach((t) => {
      t.getBalance();
    });
  }

  async handleSwap() {
    const multicallArgs = Object.values(
      this.swaps
        .filter((swap) => swap.isSelected)
        .filter((swap) => swap.approvalState === ApprovalState.APPROVED)
        .map((swap) => swap.bestCall)
    )
      .filter((call): call is SuccessfulCall => call !== undefined)
      .map((call) => ({
        target: wallet.currentChain.contracts.algebraSwapRouter, // or wherever the calldata is targeting
        callData: call.calldata,
        allowFailure: true,
        value: call.value,
        gas: call.gasEstimate,
      }));

    const totalGas = multicallArgs.reduce(
      (sum, call) => sum + BigInt(call.gas || BigInt(0)),
      BigInt(0)
    );

    const totalValue = multicallArgs.reduce(
      (sum, call) => sum + BigInt(call.value || BigInt(0)),
      BigInt(0)
    );

    const calldatas = multicallArgs.flatMap((call) => {
      if (typeof call.callData === 'string') {
        return call.callData;
      } else {
        return call.callData.map((data) => data);
      }
    });

    const tx = await new ContractWrite(
      wallet.contracts.algebraSwapRouter.contract.write.multicall
    ).call({
      // @ts-ignore
      args: [calldatas as any],
      value: totalValue,
      chain: wallet.currentChain?.chain,
      account: wallet.account as `0x${string}`,
      gas: (totalGas * (BigInt(10000) + BigInt(2000))) / BigInt(10000),
    });
    console.log(tx);
  }

  async approveAllTokens() {
    this.swaps
      .filter((swap) => swap.isSelected)
      .forEach(async (swap) => {
        await swap.fromToken
          .approveIfNoAllowance({
            amount: new BigNumber(swap.typedValue)
              .times(10 ** swap.fromToken.decimals)
              .toFixed(0),
            spender: wallet.currentChain.contracts.algebraSwapRouter,
          })
          .then(() => {
            swap.approvalState = ApprovalState.APPROVED;
          });
      });
  }

  get totalAmountIn() {
    return this.swaps
      .filter((swap) => swap.isSelected)
      .reduce(
        (acc, swap) =>
          acc.plus(
            Number(swap.typedValue) *
              Number(swap.fromToken.derivedUSD.toString())
          ),
        new BigNumber(0)
      )
      .toString();
  }

  get needsApproval() {
    return this.swaps
      .filter((swap) => swap.isSelected)
      .some((swap) => {
        return (
          swap.approvalState !== ApprovalState.APPROVED &&
          swap.approvalState !== ApprovalState.UNKNOWN
        );
      });
  }

  get totalAmountOut() {
    return this.swaps
      .filter((swap) => swap.isSelected)
      .reduce((acc, swap) => {
        console.log({
          acc,
          outputAmount: swap.trade?.outputAmount,
          derivedUSD: swap.toToken.derivedUSD.toString(),
        });
        return acc.plus(
          Number(swap.trade?.outputAmount?.toFixed(18) ?? '0') *
            Number(swap.toToken.derivedUSD.toString())
        );
      }, new BigNumber(0))
      .toString();
  }
}

export const xSwap = new XSwap();
