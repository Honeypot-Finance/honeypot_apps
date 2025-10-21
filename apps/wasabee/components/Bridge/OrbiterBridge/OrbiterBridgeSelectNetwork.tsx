import { orbiterBridgeService } from '@/services/orbiterBridge';
import { Select, SelectItem } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { orbiterNetworks } from '@/config/orbiterConfig';
import { wallet } from '@honeypot/shared/lib/wallet';
interface Props {
  type: 'from' | 'to';
}

export const OrbiterBridgeSelectNetwork = observer(({ type }: Props) => {
  // These would ideally come from a config or service

  useEffect(() => {
    if (type === 'from' && wallet.currentChainId) {
      orbiterBridgeService.setFromChainId(wallet.currentChainId.toString());
    }
  }, [wallet.currentChainId, type]);

  const handleSelectionChange = (value: string) => {
    if (type === 'from') {
      orbiterBridgeService.setFromChainId(value);
    } else {
      orbiterBridgeService.setToChainId(value);
    }
  };

  // const selectionList =
  //   type === 'from'
  //     ? orbiterNetworks
  //     : orbiterBridgeService.tradePairs.map((pair) => {
  //         return {
  //           id: pair.dstChainId,
  //           name: orbiterNetworks.find(
  //             (network) => network.id.toString() === pair.dstChainId
  //           )?.name,
  //         };
  //       });

  const selectionList = orbiterNetworks;

  return (
    <Select
      label={type === 'from' ? 'From Network' : 'To Network'}
      placeholder="Choose network"
      selectedKeys={
        type === 'from'
          ? orbiterBridgeService.fromChainId
            ? [orbiterBridgeService.fromChainId]
            : []
          : orbiterBridgeService.toChainId
          ? [orbiterBridgeService.toChainId]
          : []
      }
      onChange={(e) => handleSelectionChange(e.target.value)}
      className="max-w-xs"
    >
      {selectionList.map((network: { id: number; name: string }) => (
        <SelectItem key={network.id} value={network.id}>
          {network.name}
        </SelectItem>
      ))}
    </Select>
  );
});

export default OrbiterBridgeSelectNetwork;
