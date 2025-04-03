import { create } from 'zustand';
import { PublicClient } from 'viem';
import { StorageState } from './utils';
import { createPublicClientByChain } from '@/lib/client';
import { Network, networks, networksMap } from './network';
import { DEFAULT_CHAIN_ID } from '@/config/algebra/default-chain-id';

// Define ChainStore state interface
interface ChainState {
  networks: Network[];
  currentChainId: number;
  publicClient: PublicClient | null;
  isInit: boolean;

  // Computed properties
  networksMap: Record<number, Network>;
  currentChain: Network | undefined;

  // Methods
  initChain: (walletChainId?: number) => Promise<void>;
}

// Create Zustand store
export const useChainStore = create<ChainState>((set, get) => ({
  // TODO: Move networks logic to network.ts
  networks: networks,
  currentChainId: DEFAULT_CHAIN_ID,
  publicClient: null,
  isInit: false,

  // Implement computed properties with getter functions
  get networksMap() {
    return get().networks.reduce((acc, network) => {
      acc[network.chainId] = network;
      return acc;
    }, {} as Record<number, Network>);
  },

  get currentChain() {
    return get().networksMap[get().currentChainId];
  },

  // Methods
  initChain: async (walletChainId?: number) => {
    const defaultChainId = DEFAULT_CHAIN_ID;

    // Select the first valid chain ID
    const chainId =
      walletChainId && networksMap[walletChainId]?.isActive
        ? walletChainId
        : networksMap[defaultChainId]?.isActive
        ? defaultChainId
        : -1;

    if (chainId !== -1) {
      const publicClient = createPublicClientByChain(
        networksMap[chainId].chain
      );
      networksMap[chainId].init();
      await StorageState.sync();

      set({
        currentChainId: chainId,
        publicClient,
        isInit: true,
      });
    }
  },
}));

// Initialize chain with default chain ID
useChainStore.getState().initChain();

// Provide a singleton instance for compatibility
export const chain = {
  get networks() {
    return useChainStore.getState().networks;
  },
  get currentChainId() {
    return useChainStore.getState().currentChainId;
  },
  get publicClient() {
    return useChainStore.getState().publicClient;
  },
  get isInit() {
    return useChainStore.getState().isInit;
  },
  get networksMap() {
    return useChainStore.getState().networksMap;
  },
  get currentChain() {
    return useChainStore.getState().currentChain;
  },

  initChain: useChainStore.getState().initChain,
};
