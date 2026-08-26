import { Address } from 'viem';
import { wallet } from '@honeypot/shared/lib/wallet';

import { DEFAULT_CHAIN_ID } from '@/config/algebra/default-chain-id';
import { networksMap, Network } from '@/services/network';
import { BGTMarketContract } from './bgt-market/bgt-market';
import { HeyBgtContract } from './bgt-market/hey-bgt';
import { FactoryContract } from './dex/factory-contract';
import { RouterV2Contract } from './dex/routerv2-contract';

/**
 * Contracts and addresses that belong to bgt-market alone.
 *
 * `libs/shared` has never carried these — `ContractAddresses` does not define
 * `heyBgt`, `bgtMarket`, `routerV2`, `factory`, `routerV3` or `ftoTokens`, and
 * no commit ever added them. When this app was moved onto the shared wallet in
 * 655de93 the call sites were left reading `wallet.contracts.*` /
 * `wallet.currentChain.contracts.*`, which is why it stopped compiling.
 *
 * They live here rather than in the shared SDK because wasabee, pot2pump and
 * all-in-one-vault compile against that SDK too and have no use for them.
 * Addresses come from this app's own `services/network.ts`, which is the same
 * config the build currently serving production was made from — so this is a
 * rewiring, not a re-declaration of any address.
 */
function currentNetwork(): Network {
  return networksMap[wallet.currentChainId] ?? networksMap[DEFAULT_CHAIN_ID];
}

interface BgtContracts {
  chainId: number;
  routerV2: RouterV2Contract;
  factory: FactoryContract;
  bgtMarket: BGTMarketContract;
  heyBgt: HeyBgtContract;
}

// Rebuilt whenever the wallet switches chain, mirroring how the shared wallet
// reconstructs its own `contracts` map in initWallet().
let cached: BgtContracts | null = null;

function contracts(): BgtContracts | null {
  // Callers guard with `if (bgtRegistry.heyBgt)`. On the shared wallet that
  // guard is really an "is the wallet up yet?" check, because `wallet.contracts`
  // stays `{}` until initWallet() runs. Handing out contracts any earlier makes
  // those guards pass while `wallet.publicClient` is still undefined, and the
  // viem contract then has no `read` — which is how /profile and / threw
  // `Cannot read properties of undefined (reading 'getBeraPrice')`.
  if (!wallet.publicClient) {
    return null;
  }
  const network = currentNetwork();
  if (cached && cached.chainId === network.chainId) {
    return cached;
  }
  cached = {
    chainId: network.chainId,
    routerV2: new RouterV2Contract({
      address: network.contracts.routerV2 as Address,
    }),
    factory: new FactoryContract({
      address: network.contracts.factory as Address,
    }),
    bgtMarket: new BGTMarketContract({
      address: network.contracts.bgtMarket as Address,
    }),
    heyBgt: new HeyBgtContract({
      address: network.contracts.heyBgt as Address,
    }),
  };
  return cached;
}

// Typed as always-present to match how `wallet.contracts.*` was declared, so the
// existing call sites and their `if (...)` guards keep working unchanged. The
// values really are undefined until the wallet is initialised — that is the
// behaviour the guards were written against.
export const bgtRegistry = {
  get routerV2() {
    return contracts()?.routerV2 as RouterV2Contract;
  },
  get factory() {
    return contracts()?.factory as FactoryContract;
  },
  get bgtMarket() {
    return contracts()?.bgtMarket as BGTMarketContract;
  },
  get heyBgt() {
    return contracts()?.heyBgt as HeyBgtContract;
  },
  /** Raw addresses, for the call sites that used `currentChain.contracts.*`. */
  get addresses() {
    return currentNetwork().contracts;
  },
  get ftoTokens() {
    return currentNetwork().contracts.ftoTokens;
  },
};
