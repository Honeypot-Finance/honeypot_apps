import {
  OrbiterClient,
  ENDPOINT,
  Token as OrbiterToken,
  TradePair,
  Router,
} from '@orbiter-finance/bridge-sdk';

import { Token } from '@honeypot/shared/lib/contract/token/token';
import { action, makeAutoObservable, reaction } from 'mobx';
import { wallet } from '@honeypot/shared/lib/wallet';
import BigNumber from 'bignumber.js';
import { ContractWrite } from '@honeypot/shared/lib/utils/utils';
import { OrbiterRouterV3 } from './contract/orbiter/OrbiterRouterV3';
import { simulateContract } from 'viem/actions';
import Web3 from 'web3';
import { ethAddressUtils } from '@/lib/utils';

export class OrbiterBridge {
  selectedToken: Token | null = null;
  fromChainId: string | null = null;
  toChainId: string | null = null;
  fromAmount: string = '';
  tradePairs: TradePair[] = [];
  router: Router | null = null;
  orbiter: OrbiterClient | null = null;

  constructor() {
    OrbiterClient.create({
      apiEndpoint: ENDPOINT.MAINNET,
      apiKey: 'xxxxxx', //optional
      channelId: 'xxxxxx', //optional
    }).then((orbiter) => {
      this.orbiter = orbiter;
    });
    makeAutoObservable(this);
    reaction(
      () => this.fromChainId,
      () => {
        this.updateAvailableTradePairs();
        this.updateRouter();
      }
    );
    reaction(
      () => this.selectedToken,
      () => {
        this.updateAvailableTradePairs();
        this.updateRouter();
      }
    );
    reaction(
      () => this.toChainId,
      () => {
        this.updateRouter();
      }
    );
  }

  get bridgeErrorText(): string | undefined {
    if (
      !!this.selectedToken &&
      !!this.fromChainId &&
      !!this.toChainId &&
      !this.router
    ) {
      return 'No trade pairs found';
    }

    if (Number(this.fromAmount) > Number(this.selectedToken?.balance)) {
      return 'Insufficient balance';
    }

    return undefined;
  }

  get toAmount() {
    if (!this.router || !this.fromAmount) {
      return '0';
    }

    try {
      const amount = this.router.simulationAmount(this.fromAmount);
      return amount.receiveAmount;
    } catch (error) {
      console.error(error);
      return '0';
    }
  }

  updateRouter() {
    if (!this.orbiter) {
      console.log('no orbiter service');
      return;
    }
    if (!this.fromChainId || !this.toChainId || !this.selectedToken) {
      console.log('no fromChainId or toChainId or selectedToken');
      return;
    }

    const tradePair = this.tradePairs
      .filter((pair) => pair.srcChainId === this.fromChainId)
      .filter((pair) => pair.dstChainId === this.toChainId)
      .filter((pair) => pair.dstTokenSymbol === this.selectedToken?.symbol)
      .filter((pair) => pair.srcTokenSymbol === this.selectedToken?.symbol)
      .find(
        (pair) =>
          pair.srcChainId === this.fromChainId &&
          pair.dstChainId === this.toChainId
      );

    if (!tradePair) {
      this.router = null;
      return;
    }

    this.router = this.orbiter.createRouter(tradePair);

    console.log(this.router);
  }

  getAvailableTokens(chainId: string): Token[] {
    if (!this.orbiter) {
      console.log('no orbiter service');
      return [];
    }
    const tokens: OrbiterToken[] = this.orbiter.getAvailableTokens(chainId);

    return tokens.map((token) => {
      const outToken = Token.getToken({
        address: token.address,
        decimals: token.decimals,
        symbol: token.symbol,
        name: token.name,
        isNative: token.isNative,
        chainId: chainId,
      });

      if (outToken.isNative) {
        outToken.logoURI = wallet.currentChain.nativeToken.logoURI;
      }

      return outToken;
    });
  }

  async bridge() {
    if (
      !this.router ||
      !this.fromAmount ||
      !this.selectedToken ||
      !this.toChainId ||
      !this.fromChainId ||
      this.toAmount === '0'
    ) {
      return;
    }

    try {
      const routerAddress = this.router.routerConfig.endpointContract;
      const orbiterRouterV3 = new OrbiterRouterV3({
        address: routerAddress as `0x${string}`,
      });

      const transaction = await this.router.createTransaction(
        wallet.account,
        'receiver',
        this.fromAmount
      );

      const str = `c=${this.router.vc}&t=${wallet.account}`;

      console.log({
        str,
        ethAddressUtils: ethAddressUtils(Web3.utils.stringToHex(str)),
        transaction,
      });

      if (!this.selectedToken.isNative) {
        const fromToken = Token.getToken({
          address: this.selectedToken.address,
          chainId: wallet.currentChainId.toString(),
        });

        await fromToken.approveIfNoAllowance({
          amount: BigInt(
            BigNumber(this.fromAmount)
              .times(10 ** fromToken.decimals)
              .toString()
          ).toString(),
          spender: orbiterRouterV3.address,
        });

        const sim = await simulateContract(wallet.walletClient, {
          address: orbiterRouterV3.address as `0x${string}`,
          account: wallet.account as `0x${string}`,
          chain: wallet.currentChain.chain,
          abi: orbiterRouterV3.abi,
          functionName: 'transferToken',
          args: [
            fromToken.address as `0x${string}`,
            this.router.makerAddress as `0x${string}`,
            BigInt(transaction.value),
            // @ts-ignore
            ethAddressUtils(Web3.utils.stringToHex(str)),
          ],
        });

        await new ContractWrite(
          orbiterRouterV3.contract.write.transferToken
        ).call({
          // @ts-ignore
          value: BigInt(transaction.raw.value),
          account: wallet.account as `0x${string}`,
          chain: wallet.currentChain.chain,
          args: [
            fromToken.address,
            this.router.makerAddress,
            transaction.value,
            ethAddressUtils(Web3.utils.stringToHex(str)),
          ],
        });
      } else {
        await new ContractWrite(orbiterRouterV3.contract.write.transfer).call({
          // @ts-ignore
          value: BigInt(transaction.raw.value),
          account: wallet.account as `0x${string}`,
          chain: wallet.currentChain.chain,
          args: [
            this.router.makerAddress,
            ethAddressUtils(Web3.utils.stringToHex(str)),
          ],
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  updateAvailableTradePairs() {
    if (!this.orbiter) {
      console.log('no orbiter service');
      return;
    }
    if (!this.fromChainId || !this.selectedToken) {
      return;
    }

    this.tradePairs = this.orbiter
      .getAvailableTradePairs(this.fromChainId, this.selectedToken?.symbol)
      .filter((pair) => pair.srcChainId === this.fromChainId);
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

export const orbiterBridgeService = new OrbiterBridge();
