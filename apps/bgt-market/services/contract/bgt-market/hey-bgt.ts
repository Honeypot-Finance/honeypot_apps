import { BaseContract } from '..';
import { wallet } from '@honeypot/shared/lib/wallet';
import { makeAutoObservable } from 'mobx';
import { Address, getContract, parseEther, zeroAddress } from 'viem';
import { ICHIVaultFactoryABI } from '@/lib/abis/aquabera/ICHIVaultFactory';
import { ContractWrite } from '@honeypot/shared';
import { BGTMarketABI } from '@/lib/abis/bgt-market/BGTMarketABI';
import { BGTVault } from './bgt-vault';
import { simulateContract } from 'viem/actions';
import { WrappedToastify } from '@/lib/wrappedToastify';
import { HeyBGTABI } from '@/lib/abis/bgt-market/HeyBGTABI';

import { Token } from '@honeypot/shared';

const NODE_ID = 1;

export class HeyBgtContract implements BaseContract {
  address: Address = zeroAddress;
  name: string = 'HeyBgt';
  abi = HeyBGTABI;
  beraprice: number = 0;

  constructor(args: Partial<HeyBgtContract>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  get contract() {
    return getContract({
      address: this.address as `0x${string}`,
      abi: this.abi,
      client: { public: wallet.publicClient, wallet: wallet.walletClient },
    });
  }

  async postSellOrder(price: number, vaultAddress: `0x${string}`) {
    if (!wallet.account || !wallet.walletClient) {
      return;
    }

    try {
      // check if bgt vault operator approved
      const rewardVault = BGTVault.getBgtVault({
        address: vaultAddress,
      });

      await rewardVault.setOperatorIfNot(
        wallet.account as Address,
        this.address as Address
      );

      const beraPrice = await this.getBeraPrice();
      const formattedPrice = BigInt(Math.floor((price / beraPrice) * 10000));

      const res = await wallet.publicClient.simulateContract({
        address: this.address,
        abi: this.abi,
        functionName: 'openSellBgtOrder',
        account: wallet.account as Address,
        args: [
          (vaultAddress ?? zeroAddress) as Address,
          formattedPrice,
          BigInt(NODE_ID),
        ],
      });

      return new ContractWrite(this.contract.write.openSellBgtOrder, {
        action: 'Post Order',
      }).call([vaultAddress, formattedPrice, BigInt(NODE_ID)]);
    } catch (error) {
      if (String(error).includes('too less bgt')) {
        WrappedToastify.error({
          title: 'Too less BGT',
          message: 'Need at least 0.01 bgt in vault to post a sell order',
        });
      } else {
        WrappedToastify.error({
          title: 'Error',
          message: 'Error posting sell order',
        });
      }
    }

    return;
  }

  async postBuyOrder(price: bigint, value: bigint) {
    if (!wallet.walletClient) {
      return;
    }

    const HoneyToken = Token.getToken({
      chainId: wallet.currentChainId.toString(),
      address: wallet.currentChain.validatedTokens.find(
        (token) => token.symbol === 'HONEY'
      )?.address as `0x${string}`,
    });

    //approve honey if not approved
    await HoneyToken.approveIfNoAllowance({
      spender: this.address,
      amount: value.toString(),
    });

    try {
      const res = await wallet.publicClient.simulateContract({
        address: this.address,
        abi: this.abi,
        functionName: 'openBuyBgtOrder',
        account: wallet.account as Address,
        args: [price, value, BigInt(NODE_ID)],
      });

      return new ContractWrite(this.contract.write.openBuyBgtOrder, {
        action: 'Post Order',
      }).call([price, value, BigInt(NODE_ID)]);
    } catch (error) {
      console.error(error);
      if (String(error).includes('small order')) {
        WrappedToastify.error({
          title: 'Buying amount too small',
          message: 'Need at least 0.01 Bera',
        });
      } else {
        WrappedToastify.error({
          title: 'Error',
          message: 'Error posting buy order',
        });
      }
    }
    return;
  }

  closeOrder(orderId: bigint, orderType: 'BuyBGT' | 'SellBGT') {
    if (!wallet.account || !wallet.walletClient) {
      return;
    }
    if (orderType === 'BuyBGT') {
      return new ContractWrite(this.contract.write.closeBuyBgtOrder, {
        action: 'Close Order',
      }).call([orderId]);
    } else {
      return new ContractWrite(this.contract.write.closeSellBgtOrder, {
        action: 'Close Order',
      }).call([orderId]);
    }
  }

  async fillSellOrder(orderId: bigint, value: bigint) {
    if (!wallet.walletClient) {
      return;
    }
    const HoneyToken = Token.getToken({
      chainId: wallet.currentChainId.toString(),
      address: wallet.currentChain.validatedTokens.find(
        (token) => token.symbol === 'HONEY'
      )?.address as `0x${string}`,
    });

    //approve honey if not approved
    await HoneyToken.approveIfNoAllowance({
      spender: this.address,
      amount: value.toString(),
    });

    try {
      const res = await wallet.publicClient.simulateContract({
        address: this.address,
        abi: this.abi,
        functionName: 'fillSellBgtOrder',
        account: wallet.account as Address,
        args: [orderId, BigInt(NODE_ID)],
      });

      return new ContractWrite(this.contract.write.fillSellBgtOrder, {
        action: 'Fill Order',
      }).call([orderId, BigInt(NODE_ID)]);
    } catch (e) {
      console.error(e);

      if (String(e).includes('does not have enough funds')) {
        WrappedToastify.error({
          title: 'Not enough funds',
          message: 'Not enough funds to fill order',
        });
      } else {
        WrappedToastify.error({
          title: 'Error',
          message: 'Error filling order',
        });
      }
    }
  }

  async fillBuyOrder(orderId: bigint, vaultAddress: Address) {
    if (!wallet.walletClient) {
      return;
    }

    try {
      const rewardVault = BGTVault.getBgtVault({
        address: vaultAddress,
      });

      await rewardVault.setOperatorIfNot(
        wallet.account as Address,
        this.address as Address
      );

      const res = await wallet.publicClient.simulateContract({
        address: this.address,
        abi: this.abi,
        functionName: 'fillBuyBgtOrder',
        account: wallet.account as Address,
        args: [orderId, vaultAddress, BigInt(NODE_ID)],
      });

      return new ContractWrite(this.contract.write.fillBuyBgtOrder, {
        action: 'Fill Order',
      }).call([orderId, vaultAddress, BigInt(NODE_ID)]);
    } catch (e) {
      console.error(e);

      if (String(e).includes('No BGT available in vault')) {
        WrappedToastify.error({
          title: 'No BGT available in vault',
          message:
            'No BGT available in vault, please use another vault with bgt in',
        });
      } else {
        WrappedToastify.error({
          title: 'Error',
          message: 'Error filling order',
        });
      }
    }
  }

  async getSellBgtOrder(orderId: bigint) {
    const res = await this.contract.read.getSellBgtOrder([orderId]);
    return res;
  }

  async getBuyBgtOrder(orderId: bigint) {
    const res = await this.contract.read.getBuyBgtOrder([orderId]);
    return res;
  }

  async getBeraPrice() {
    const res = await this.contract.read.getBeraPrice();
    const price = Number(res[0]) / 10 ** Number(res[1]);
    this.beraprice = price;
    return price;
  }
}
