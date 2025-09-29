import { ContractConfig, defineConfig } from '@wagmi/cli';
import { actions, react } from '@wagmi/cli/plugins';
import {
  algebraFactoryABI,
  algebraPoolABI,
  algebraPositionManagerABI,
  algebraQuoterABI,
  algebraBasePluginABI,
  algebraRouterABI,
  algebraQuoterV2ABI,
  algebraEternalFarmingABI,
  farmingCenterABI,
  wNativeABI,
  algebraVirtualPoolABI,
} from './src/lib/abis/algebra-contracts/ABIs';
import { limitOrderManagerABI } from './src/lib/abis/algebra-contracts/ABIs/plugins/limitOrderManagerAbi';
import { ICHIVaultABI } from './src/lib/abis/aquabera/ICHIVault';
import { ICHIVaultFactoryABI } from './src/lib/abis/aquabera/ICHIVaultFactory';
import { ERC20ABI } from './src/lib/abis/erc20';
import { contractAddresses } from './src/config/contractAddresses';
import { Address } from 'viem';

const contracts: ContractConfig[] = [
  {
    address: Object.entries(contractAddresses).reduce((acc, [key, network]) => {
      acc[key] = network.algebraFactory;
      return acc;
    }, {} as Record<string, Address>),
    abi: algebraFactoryABI,
    name: 'AlgebraFactory',
  },
  {
    abi: algebraPoolABI,
    name: 'AlgebraPool',
  },
  {
    abi: algebraBasePluginABI,
    name: 'AlgebraBasePlugin',
  },
  {
    address: Object.entries(contractAddresses).reduce((acc, [key, network]) => {
      acc[key] = network.algebraPositionManager;
      return acc;
    }, {} as Record<string, Address>),
    abi: algebraPositionManagerABI,
    name: 'AlgebraPositionManager',
  },
  {
    address: Object.entries(contractAddresses).reduce((acc, [key, network]) => {
      acc[key] = network.algebraQuoter;
      return acc;
    }, {} as Record<string, Address>),
    abi: algebraQuoterABI,
    name: 'AlgebraQuoter',
  },
  {
    address: Object.entries(contractAddresses).reduce((acc, [key, network]) => {
      acc[key] = network.algebraQuoterV2;
      return acc;
    }, {} as Record<string, Address>),
    abi: algebraQuoterV2ABI,
    name: 'AlgerbaQuoterV2',
  },
  {
    address: Object.entries(contractAddresses).reduce((acc, [key, network]) => {
      acc[key] = network.algebraSwapRouter;
      return acc;
    }, {} as Record<string, Address>),
    abi: algebraRouterABI,
    name: 'AlgebraRouter',
  },
  {
    address: Object.entries(contractAddresses).reduce((acc, [key, network]) => {
      acc[key] = network.algebraEternalFarming;
      return acc;
    }, {} as Record<string, Address>),
    abi: algebraEternalFarmingABI,
    name: 'AlgebraEternalFarming',
  },
  {
    address: Object.entries(contractAddresses).reduce((acc, [key, network]) => {
      acc[key] = network.algebraFarmingCenter;
      return acc;
    }, {} as Record<string, Address>),
    abi: farmingCenterABI,
    name: 'FarmingCenter',
  },
  {
    abi: algebraVirtualPoolABI,
    name: 'AlgebraVirtualPool',
  },
  {
    abi: wNativeABI,
    name: 'WrappedNative',
  },
  {
    abi: ERC20ABI,
    name: 'ERC20',
  },
  {
    abi: ICHIVaultABI,
    name: 'ICHIVault',
  },
  {
    abi: ICHIVaultFactoryABI,
    name: 'ICHIVaultFactory',
  },
  {
    abi: limitOrderManagerABI,
    name: 'limitOrderManager',
  },
];

export default defineConfig({
  out: './src/wagmi-generated.ts',
  contracts,
  plugins: [react()],
});
