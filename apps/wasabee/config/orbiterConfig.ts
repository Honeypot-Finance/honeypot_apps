import { networks } from '@honeypot/shared/config/chains/chain';

export const orbiterNetworks = networks.map((network) => ({
  id: network.chainId,
  name: network.chain.name,
}));
