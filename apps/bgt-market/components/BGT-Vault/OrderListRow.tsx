import {
  Order,
  OrderStatus,
  OrderType,
} from '@/lib/algebra/graphql/generated/graphql';
import { BGTVault } from '@/services/contract/bgt-market/bgt-vault';
import { popmodal } from '@/services/popmodal';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Button, SelectItem } from '@nextui-org/react';
import { cn } from '@nextui-org/theme';
import { PressEvent } from '@react-types/shared';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address, formatEther, parseEther } from 'viem';
import { watchBlockNumber } from 'viem/actions';
import CardContainer from '../CardContianer/v3';
import { WarppedNextSelect } from '../wrappedNextUI/Select/Select';
import { usePollingBlockNumber } from '@/lib/hooks/useBlockNumber';
import { UserBgtVaults } from './UserBgtVaults';
import { useUserBgtVaults } from '@/lib/hooks/useUserBgtVaults';
import { BgtMarketOrder } from '@/services/bgt-market/bgtMarketOrder';
import { bgtRegistry } from '@/services/contract/bgt-registry';

export const UserOrderListRow = observer(
  ({
    order,
    actionCallBack,
  }: {
    order: BgtMarketOrder;
    actionCallBack?: () => void;
  }) => {
    const { block } = usePollingBlockNumber();

    useEffect(() => {
      order.updateOrderVaultBgt();
    }, [block]);

    return (
      <tr key={order.orderId} className="hover:bg-[#2a2a2a] transition-colors">
        <td className="py-2 px-2 sm:px-4 text-sm sm:text-base font-mono whitespace-nowrap">
          <div
            className={cn(
              'flex items-center gap-2',
              order.status === OrderStatus.Closed && 'text-red-500',
              order.status === OrderStatus.Filled && 'text-green-500'
            )}
          >
            {order.orderString}
            {order.status !== OrderStatus.Pending && `(Order ${order.status})`}
          </div>
        </td>
        <td className="py-2 px-2 sm:px-4 text-sm sm:text-base font-mono whitespace-nowrap hidden md:table-cell">
          <div className="flex items-center gap-2">
            {order.SaleBGT} {order.orderType === OrderType.BuyBgt && 'BERA'}
            {order.orderType === OrderType.SellBgt && 'BGT'}
          </div>
        </td>
        <td className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base whitespace-nowrap">
          <div className="flex flex-col sm:flex-row justify-end items-end gap-1">
            {order.pricePerBgtString} BERA
          </div>
        </td>
        <td className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base whitespace-nowrap">
          <div className="flex flex-col sm:flex-row justify-end items-end gap-1">
            {order.totalPriceString} BERA
          </div>
        </td>
        <td className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base whitespace-nowrap">
          <div className="flex flex-col sm:flex-row justify-end items-end gap-1">
            {order.filledPercentString}
          </div>
        </td>
        <td className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base whitespace-nowrap hidden sm:table-cell">
          <div>
            {order.dealerId.toLowerCase() === wallet.account.toLowerCase() &&
              order.status === 'Pending' && (
                <Button
                  disabled={!wallet.walletClient}
                  isDisabled={!wallet.walletClient}
                  onPress={() => {
                    bgtRegistry.bgtMarket
                      .closeOrder(BigInt(order.orderId))
                      ?.then(() => {
                        order.status = OrderStatus.Closed;
                        actionCallBack?.();
                      });
                  }}
                >
                  {!wallet.walletClient ? 'Connect Wallet' : 'Close Order'}
                </Button>
              )}

            {!(order.dealerId.toLowerCase() === wallet.account.toLowerCase()) &&
              order.status === 'Pending' && (
                <FillBuyOrderModalButton order={order} />
              )}
          </div>
        </td>
      </tr>
    );
  }
);

export const BuyOrderListRow = observer(
  ({
    order,
    actionCallBack,
  }: {
    order: BgtMarketOrder;
    actionCallBack?: () => void;
  }) => {
    return (
      <tr key={order.orderId} className="hover:bg-[#2a2a2a] transition-colors">
        <td className="py-2 px-2 sm:px-4 text-sm sm:text-base font-mono whitespace-nowrap">
          <div
            className={cn(
              'flex items-center gap-2',
              order.status === OrderStatus.Closed && 'text-red-500',
              order.status === OrderStatus.Filled && 'text-green-500'
            )}
          >
            {order.orderString}
            {order.status !== OrderStatus.Pending && `(Order ${order.status})`}
          </div>
        </td>
        <td className="py-2 px-2 sm:px-4 text-sm sm:text-base font-mono whitespace-nowrap hidden md:table-cell">
          <div className="flex items-center gap-2">
            {order.SaleBGT}{' '}
            {wallet?.currentChain?.nativeToken?.symbol ?? 'BERA'}
          </div>
        </td>
        <td className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base whitespace-nowrap">
          <div className="flex flex-col sm:flex-row justify-end items-end gap-1">
            {order.pricePerBgtString} BERA
          </div>
        </td>
        <td className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base whitespace-nowrap">
          <div className="flex flex-col sm:flex-row justify-end items-end gap-1">
            {order.filledPercentString}
          </div>
        </td>
        <td className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base whitespace-nowrap hidden sm:table-cell">
          <div>
            {order.dealerId.toLowerCase() === wallet.account.toLowerCase() &&
              order.status === 'Pending' && (
                <Button
                  disabled={!wallet.walletClient}
                  isDisabled={!wallet.walletClient}
                  onPress={() => {
                    bgtRegistry.bgtMarket
                      .closeOrder(BigInt(order.orderId))
                      ?.then(() => {
                        order.status = OrderStatus.Closed;
                        actionCallBack?.();
                      });
                  }}
                >
                  {!wallet.walletClient ? 'Connect Wallet' : 'Close Order'}
                </Button>
              )}

            {!(order.dealerId.toLowerCase() === wallet.account.toLowerCase()) &&
              order.status === 'Pending' && (
                <FillBuyOrderModalButton order={order} />
              )}
          </div>
        </td>
      </tr>
    );
  }
);

export const SellOrderListRow = observer(
  ({
    order,
    actionCallBack,
  }: {
    order: BgtMarketOrder;
    actionCallBack?: () => void;
  }) => {
    const { block } = usePollingBlockNumber();

    useEffect(() => {
      order.updateOrderVaultBgt();
    }, [block]);

    return (
      <tr key={order.orderId} className="hover:bg-[#2a2a2a] transition-colors ">
        <td className="py-2 px-2 sm:px-4 text-sm sm:text-base font-mono whitespace-nowrap">
          <div
            className={cn(
              'flex items-center gap-2',
              order.status === OrderStatus.Closed && 'text-red-500',
              order.status === OrderStatus.Filled && 'text-green-500'
            )}
          >
            {order.orderString}
            {order.status !== OrderStatus.Pending && `(Order ${order.status})`}
          </div>
        </td>
        <td className="py-2 px-2 sm:px-4 text-sm sm:text-base font-mono whitespace-nowrap hidden md:table-cell">
          <div className="flex items-center gap-2">{order.SaleBGT}</div>
        </td>
        <td className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base whitespace-nowrap">
          <div className="flex flex-col sm:flex-row justify-end items-end gap-1">
            {order.pricePerBgtString} BERA
          </div>
        </td>
        <td className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base whitespace-nowrap">
          <div className="flex flex-col sm:flex-row justify-end items-end gap-1">
            {order.totalPriceString}{' '}
            {wallet?.currentChain?.nativeToken?.symbol ?? 'BERA'}
          </div>
        </td>
        <td className="py-2 px-2 sm:px-4 text-right text-sm sm:text-base whitespace-nowrap hidden sm:table-cell">
          <div>
            {order.dealerId.toLowerCase() === wallet.account.toLowerCase() &&
              order.status === 'Pending' && (
                <Button
                  disabled={!wallet.walletClient || !wallet.isInit}
                  isDisabled={!wallet.walletClient || !wallet.isInit}
                  onPress={() => {
                    bgtRegistry.bgtMarket
                      .closeOrder(BigInt(order.orderId))
                      ?.then(() => actionCallBack);
                  }}
                >
                  {!wallet.walletClient ? 'Connect Wallet' : 'Close Order'}
                </Button>
              )}

            {!(order.dealerId.toLowerCase() === wallet.account.toLowerCase()) &&
              order.status === 'Pending' && (
                <Button
                  disabled={!wallet.walletClient}
                  isDisabled={!wallet.walletClient}
                  onPress={() => {
                    bgtRegistry.bgtMarket
                      .fillSellOrder(
                        BigInt(order.orderId),
                        BigInt(
                          (order.price / 10000) *
                            Number(order.orderVaultBgt) *
                            1.1
                        )
                      )
                      ?.then(() => actionCallBack);
                  }}
                >
                  {!wallet.walletClient ? 'Connect Wallet' : 'Buy'}
                </Button>
              )}
          </div>
        </td>
      </tr>
    );
  }
);

const FillBuyOrderModalButton = observer(
  ({
    order,
    actionCallBack,
  }: {
    order: BgtMarketOrder;
    actionCallBack?: () => void;
  }) => {
    const isWallet = useMemo(() => {
      return wallet.walletClient;
    }, [wallet.isInit, wallet.walletClient]);
    const handleClick = (e: PressEvent) => {
      popmodal.openModal({
        content: (
          <FillBuyOrderModal order={order} actionCallBack={actionCallBack} />
        ),
        boarderLess: true,
      });
    };

    return (
      <Button
        disabled={!isWallet}
        isDisabled={!isWallet}
        onPress={(e) => {
          handleClick(e);
        }}
      >
        {!wallet.walletClient ? 'Connect Wallet' : 'Sell'}
      </Button>
    );
  }
);

const FillBuyOrderModal = ({
  order,
  actionCallBack,
}: {
  order: BgtMarketOrder;
  actionCallBack?: () => void;
}) => {
  const [selectedVault, setSelectedVault] = useState<Address | undefined>(
    undefined
  );
  const { bgtVaults } = useUserBgtVaults();

  const handleClick = () => {
    if (!selectedVault) return;
    bgtRegistry.bgtMarket
      .fillBuyOrder(BigInt(order.orderId), selectedVault)
      ?.then(() => actionCallBack);
  };

  return (
    <CardContainer className="flex flex-col gap-2">
      <div className="min-w-[500px] flex gap-2 flex-col">
        <label>Vault Address</label>
        <WarppedNextSelect
          isRequired
          items={bgtVaults}
          onSelectionChange={(e) => {
            setSelectedVault(e.currentKey?.toLowerCase() as Address);
          }}
        >
          {bgtVaults.map((vault) => (
            <SelectItem key={vault.address} value={vault.address}>
              {vault.name}(
              {Number(formatEther(BigInt(vault.userBgtInVault))).toFixed(5)})
              BGT
            </SelectItem>
          ))}
        </WarppedNextSelect>

        <Button
          disabled={!wallet.walletClient || !wallet.isInit}
          isDisabled={!wallet.walletClient || !wallet.isInit}
          onPress={() => {
            handleClick();
          }}
        >
          {!wallet.walletClient ? 'Connect Wallet' : 'Sell'}
        </Button>
      </div>
    </CardContainer>
  );
};
