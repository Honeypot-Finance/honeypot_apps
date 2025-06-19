import { ContractConfig, defineConfig } from '@wagmi/cli';
import { actions, react } from '@wagmi/cli/plugins';
import { AllInOneVaultABI } from './lib/abis/all-in-one-vault';
import {
  ALGEBRA_FACTORY,
  ALGEBRA_POSITION_MANAGER,
  ALGEBRA_ROUTER,
  ALL_IN_ONE_VAULT,
  ALL_IN_ONE_VAULT_PROXY,
} from './config/algebra/addresses';
import { ERC20ABI } from './lib/abis/erc20';
import {
  algebraFactoryABI,
  algebraPositionManagerABI,
} from './lib/abis/algebra-contracts';

const contracts: ContractConfig[] = [
  {
    address: ALGEBRA_FACTORY,
    abi: algebraFactoryABI,
    name: 'AlgebraFactory',
  },
  {
    address: ALGEBRA_POSITION_MANAGER,
    abi: algebraPositionManagerABI,
    name: 'AlgebraPositionManager',
  },
  {
    abi: ERC20ABI,
    name: 'ERC20',
  },
  {
    address: ALL_IN_ONE_VAULT,
    abi: AllInOneVaultABI,
    name: 'AllInOneVault',
  },
];

export default defineConfig({
  out: './wagmi-generated.ts',
  contracts,
  plugins: [
    actions({
      //watchContractEvent: false,
    }),
    react({
      // useContractEvent: false,
      //useContractItemEvent: false,
    }),
  ],
});
