import { Network, networksMap, NetworkManager } from '@honeypot/shared';
import React, { useState, useEffect } from 'react';

const NetworkSelect: React.FC = () => {
  const networkManager = NetworkManager.getInstance();
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(
    networkManager.getSelectedNetwork()
  );

  useEffect(() => {
    const firstNetwork = Object.values(networksMap)[0];
    if (firstNetwork && !selectedNetwork) {
      setSelectedNetwork(firstNetwork);
      networkManager.setSelectedNetwork(firstNetwork);
    }
  }, [selectedNetwork, networkManager]);

  const handleSelectNetwork = (network: Network) => {
    setSelectedNetwork(network);
    networkManager.setSelectedNetwork(network);
  };

  return (
    <div className="flex items-center gap-x-1">
      {/* FIXME: Optimize the style */}
      <select
        className="text-black text-nowrap hidden md:flex h-[43px] justify-center items-center gap-[5.748px] [background:#FFCD4D] shadow-[-0.359px_-1.796px_0px_0px_#946D3F_inset] px-[14.369px] py-[7.184px] rounded-[21.553px] border-[0.718px] border-solid border-[rgba(148,109,63,0.37)]"
        value={selectedNetwork ? selectedNetwork.chainId : ''}
        onChange={(e) => {
          const selectedChainId = e.target.value;
          const selectedNetwork = networksMap[selectedChainId];
          handleSelectNetwork(selectedNetwork);
        }}
      >
        {Object.values(networksMap).map((network) => (
          <option key={network.chainId} value={network.chainId}>
            {network.chain.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default NetworkSelect;
