import BigNumber from 'bignumber.js';
import { wallet } from '@honeypot/shared/lib/wallet';
import { get, makeAutoObservable, reaction, runInAction } from 'mobx';
import { Address, formatEther, getContract, zeroAddress } from 'viem';
import { ContractWrite } from '../utils';
import { amountFormatted } from '@/lib/format';
import { ERC20ABI } from '@/lib/abis/erc20';
import { faucetABI } from '@/lib/abis/faucet';
import { watchAsset } from 'viem/actions';
import { networksMap } from '@honeypot/shared';
import { WrappedToastify } from '@/lib/wrappedToastify';
import { trpcClient } from '@/lib/trpc';
import { getSingleTokenData } from '@/lib/algebra/graphql/clients/token';
import {
  Order,
  OrderStatus,
  OrderType,
} from '@/lib/algebra/graphql/generated/graphql';
import { BGTVault } from '../contract/bgt-market/bgt-vault';
import { bgtRegistry } from '@/services/contract/bgt-registry';

export class HeyBgtOrder {
  static gqlOrderToBgtOrder(order: Order): HeyBgtOrder {
    return HeyBgtOrder.getBgtOrder({
      orderId: order.id.toString().split('-')[1],
      dealerId: order.dealer.id as Address,
      //price: order.price.toString(),
      //vaultAddress: order.vaultAddress as Address,
      //balance: order.balance.toString(),
      //spentBalance: order.spentBalance.toString(),
      height: order.height.toString(),
      orderType: order.orderType,
      status: order.status,
    });
  }
  static bgtOrderMap: Record<string, HeyBgtOrder> = {};
  static getBgtOrder({
    orderId,
    dealerId,
    ...args
  }: {
    orderId: string;
  } & Partial<HeyBgtOrder>) {
    const key = orderId;
    const order = HeyBgtOrder.bgtOrderMap[key];

    if (!order) {
      HeyBgtOrder.bgtOrderMap[key] = new HeyBgtOrder({
        orderId: orderId,
        dealerId: dealerId as Address,
        ...args,
      });
    } else {
      HeyBgtOrder.bgtOrderMap[key].setData(args);
    }
    return HeyBgtOrder.bgtOrderMap[key];
  }

  orderId: string;
  dealerId: Address = zeroAddress;
  price: number = 0;
  vaultAddress: Address = zeroAddress;
  balance: bigint = BigInt(0);
  spentBalance: bigint = BigInt(0);
  height: string = '0';
  orderType: OrderType = OrderType.BuyBgt;
  status: OrderStatus = OrderStatus.Pending;
  orderVaultBgt: bigint = BigInt(0);

  get orderString() {
    switch (this.orderType) {
      case OrderType.BuyBgt:
        return 'BuyBGT';
      case OrderType.SellBgt:
        return 'SellBGT';
    }
  }

  get pricePerBgtString() {
    console.log(this.price);
    return Number(this.price).toFixed(4);
  }

  get rewardVault() {
    if (!this.vaultAddress || this.status !== OrderStatus.Pending) return;

    return BGTVault.getBgtVault({
      address: this.vaultAddress.toLowerCase() as Address,
    });
  }

  get totalPriceString() {
    switch (this.orderType) {
      case OrderType.BuyBgt:
        return Number(formatEther(this.balance));
      case OrderType.SellBgt:
        return (Number(this.pricePerBgtString) * Number(this.SaleBGT)).toFixed(
          4
        );
    }
  }

  get SaleBGT(): string {
    if (this.orderType === OrderType.SellBgt) {
      switch (this.status) {
        case OrderStatus.Closed:
          return '0';
        case OrderStatus.Filled:
          return (
            Number(formatEther(BigInt(this.spentBalance))) /
            Number(this.pricePerBgtString)
          ).toFixed(4);
        case OrderStatus.Pending:
          return Number(formatEther(BigInt(this.orderVaultBgt))).toFixed(4);
        default:
          return '0';
      }
    } else {
      return formatEther(this.balance);
    }
  }

  get filledPercentString() {
    switch (this.orderType) {
      case OrderType.BuyBgt:
        const filledAmount =
          Number(formatEther(this.spentBalance)) / Number(this.price / 10000);

        return `${
          filledAmount != 0 && filledAmount < 0.01
            ? '<0.01'
            : filledAmount.toFixed(2)
        } BGT (${(
          (Number(this.spentBalance) / Number(this.balance)) *
          100
        ).toFixed(2)}%)`;
      case OrderType.SellBgt:
        if (this.status === OrderStatus.Filled) {
          return 'Filled';
        } else {
          return 'Unfilled';
        }
    }
  }

  constructor({
    orderId,
    ...args
  }: Partial<HeyBgtOrder> & { orderId: string }) {
    this.setData(args);
    this.orderId = orderId;
    makeAutoObservable(this);
  }

  updateOrderVaultBgt() {
    if (!this.rewardVault || this.rewardVault.address === zeroAddress) return;

    this.rewardVault
      .readAddressBgtInVault(this.dealerId as Address)
      .then((res) => {
        runInAction(() => {
          this.orderVaultBgt = res;
        });
      });
  }

  setData({ ...args }: Partial<HeyBgtOrder>) {
    runInAction(() => {
      Object.assign(this, args);
    });
  }

  async getOrderDetails() {
    if (!bgtRegistry.heyBgt) return;
    if (this.orderType === OrderType.BuyBgt) {
      const res = await bgtRegistry.heyBgt.getBuyBgtOrder(
        BigInt(this.orderId)
      );

      runInAction(() => {
        this.setData({
          price: Number(formatEther(res.price)),
          balance: res.amount,
          spentBalance: res.filledAmount,
        });
      });
      return res;
    } else {
      const res = await bgtRegistry.heyBgt.getSellBgtOrder(
        BigInt(this.orderId)
      );
      runInAction(() => {
        this.setData({
          price:
            (Number(res.premiumRate) / 10000) *
            bgtRegistry.heyBgt.beraprice,
          vaultAddress: res.rewardVault,
          spentBalance: res.filledAmount,
        });
      });
      return res;
    }
  }
}
