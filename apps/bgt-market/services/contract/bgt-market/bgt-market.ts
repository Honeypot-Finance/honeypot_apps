import { BaseContract } from './..';
import { wallet } from '@/services/wallet';
import { makeAutoObservable } from 'mobx';
import { Address, getContract, parseEther, zeroAddress } from 'viem';
import { ICHIVaultFactoryABI } from '@/lib/abis/aquabera/ICHIVaultFactory';
import { ContractWrite } from '@/services/utils';
import { BGTMarketABI } from '@/lib/abis/bgt-market/BGTMarketABI';
import { BGTVault } from './bgt-vault';
import { simulateContract } from 'viem/actions';
import { WrappedToastify } from '@/lib/wrappedToastify';

export class BGTMarketContract implements BaseContract {
  address: Address = zeroAddress;
  name: string = 'BGTMarket';
  abi = BGTMarketABI;

  constructor(args: Partial<BGTMarketContract>) {
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

  async postSellOrder(price: bigint, vaultAddress: `0x${string}`) {
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
        wallet.currentChain.contracts.bgtMarket as Address
      );

      const res = await wallet.publicClient.simulateContract({
        address: wallet.contracts.bgtMarket.address,
        abi: wallet.contracts.bgtMarket.abi,
        functionName: 'postOrder',
        account: wallet.account as Address,
        args: [BigInt(price), (vaultAddress ?? zeroAddress) as Address],
      });

      console.log(res);

      return new ContractWrite(this.contract.write.postOrder, {
        action: 'Post Order',
      }).call([price, vaultAddress]);
    } catch (error) {
      console.error(error);

      if (String(error).includes('too less bgt')) {
        WrappedToastify.error({
          title: 'Too less BGT',
          message: 'Need at least 0.01 bgt in vault to post a sell order',
        });
      }
    }

    return;
  }

  async postBuyOrder(price: bigint, value: bigint) {
    if (!wallet.walletClient) {
      return;
    }

    try {
      const res = await wallet.publicClient.simulateContract({
        address: wallet.contracts.bgtMarket.address,
        abi: wallet.contracts.bgtMarket.abi,
        functionName: 'postOrder',
        account: wallet.account as Address,
        args: [BigInt(price)],
        value: value,
      });

      return new ContractWrite(this.contract.write.postOrder, {
        action: 'Post Order',
      }).call([price], {
        value: value,
      });
    } catch (error) {
      console.error(error);

      if (String(error).includes('small order')) {
        WrappedToastify.error({
          title: 'Buying amount too small',
          message: 'Need at least 0.01 Bera',
        });
      }
    }
    return;
  }

  closeOrder(orderId: bigint) {
    if (!wallet.account || !wallet.walletClient) {
      return;
    }
    return new ContractWrite(this.contract.write.closeOrder, {
      action: 'Close Order',
    }).call([orderId]);
  }

  async fillSellOrder(orderId: bigint, value: bigint) {
    if (!wallet.walletClient) {
      return;
    }

    try {
      const res = await wallet.publicClient.simulateContract({
        address: wallet.contracts.bgtMarket.address,
        abi: wallet.contracts.bgtMarket.abi,
        functionName: 'fillOrder',
        account: wallet.account as Address,
        args: [orderId],
        value: value,
      });

      return new ContractWrite(this.contract.write.fillOrder, {
        action: 'Fill Order',
      }).call([orderId], { value: value });
    } catch (e) {
      console.error(e);
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
        wallet.currentChain.contracts.bgtMarket as Address
      );

      const res = await wallet.publicClient.simulateContract({
        address: wallet.contracts.bgtMarket.address,
        abi: wallet.contracts.bgtMarket.abi,
        functionName: 'fillOrder',
        account: wallet.account as Address,
        args: [orderId, vaultAddress],
      });

      return new ContractWrite(this.contract.write.fillOrder, {
        action: 'Fill Order',
      }).call([orderId, vaultAddress]);
    } catch (e) {
      console.error(e);

      if (String(e).includes('No BGT available in vault')) {
        WrappedToastify.error({
          title: 'No BGT available in vault',
          message:
            'No BGT available in vault, please use another vault with bgt in',
        });
      }
    }
  }

  /// @notice Struct representing an order.
  // struct Order {
  //     address dealer;        // Address of the dealer who created the order
  //     uint256 price;         // Price of 1 BGT in $BERA
  //     uint256 balance;       // Balance of $BERA for buying BGT
  //     uint256 spentBalance;  // Spent balance of $BERA for buying BGT
  //     address vaultAddress;  // Address of the vault
  //     uint256 height;        // Block number when the order was created
  //     OrderType orderType;   // Type of the order (SellBGT or BuyBGT)
  //     OrderStatus status;    // Status of the order (Closed, Pending, or Filled)
  // }
  getOrder(orderId: bigint) {
    return this.contract.read.getOrder;
  }
}
