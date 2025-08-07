import { Address } from 'viem';

// Contract addresses for different networks
export const contractAddresses: Record<string, {
  algebraFactory: Address;
  algebraPositionManager: Address;
  algebraSwapRouter: Address;
  algebraQuoter: Address;
  algebraQuoterV2: Address;
  algebraEternalFarming: Address;
  algebraFarmingCenter: Address;
  ichiVaultFactory?: Address;
}> = {
  // Berachain testnet
  '80084': {
    algebraFactory: '0x0000000000000000000000000000000000000000' as Address,
    algebraPositionManager: '0x0000000000000000000000000000000000000000' as Address,
    algebraSwapRouter: '0x0000000000000000000000000000000000000000' as Address,
    algebraQuoter: '0x0000000000000000000000000000000000000000' as Address,
    algebraQuoterV2: '0x0000000000000000000000000000000000000000' as Address,
    algebraEternalFarming: '0x0000000000000000000000000000000000000000' as Address,
    algebraFarmingCenter: '0x0000000000000000000000000000000000000000' as Address,
  },
  // Add other networks as needed
};