import { makeAutoObservable, runInAction } from 'mobx';
import { 
  SUPPORTED_PRIMARY_TOKENS,
  CHAIN_ID,
  SUPPORTED_TOKEN_TYPE,
  UniversalAccount as ParticleUniversalAccount 
} from '@particle-network/universal-account-sdk';
import { Network, networks } from '@honeypot/shared/config/chains/network';

interface UniversalChain {
  chainId: number;
  name: string;
  icon?: string;
}

interface UniversalToken {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  type: SUPPORTED_TOKEN_TYPE;
  logoURI?: string;
}

class UniversalAccountService {
  supportedChains: UniversalChain[] = [];
  supportedTokens: Map<number, UniversalToken[]> = new Map();
  isLoading = true;
  
  constructor() {
    makeAutoObservable(this);
    this.initializeSupportedAssets();
  }

  // Initialize supported chains and tokens from the SDK
  initializeSupportedAssets = async () => {
    try {
      runInAction(() => {
        this.isLoading = true;
      });

      // Get unique chain IDs from SUPPORTED_PRIMARY_TOKENS
      const chainIds = new Set<number>();
      const tokensByChain = new Map<number, UniversalToken[]>();

      // Parse the SUPPORTED_PRIMARY_TOKENS from the SDK
      console.log('SUPPORTED_PRIMARY_TOKENS:', SUPPORTED_PRIMARY_TOKENS);
      
      SUPPORTED_PRIMARY_TOKENS.forEach(token => {
        console.log('Processing token:', token);
        
        const chainId = token.chainId;
        chainIds.add(chainId);

        if (!tokensByChain.has(chainId)) {
          tokensByChain.set(chainId, []);
        }

        tokensByChain.get(chainId)?.push({
          chainId: token.chainId,
          address: token.address,
          symbol: token.symbol || '',
          name: token.name || '',
          decimals: token.decimals,
          type: token.type as SUPPORTED_TOKEN_TYPE,
          logoURI: (token as any).logoURI
        });
      });

      // Map chain IDs to our Network objects and chain names
      const supportedChains: UniversalChain[] = [];
      
      // Map known chain IDs to names (you can expand this based on CHAIN_ID enum)
      const chainIdToName: Record<number, string> = {
        56: 'BSC Mainnet',
        80094: 'Berachain',
        1: 'Ethereum',
        137: 'Polygon',
        42161: 'Arbitrum',
        8453: 'Base',
        // Add more as needed based on CHAIN_ID enum values
      };

      chainIds.forEach(chainId => {
        // Try to find the network in our existing networks
        const network = networks.find(n => n.chainId === chainId);
        
        supportedChains.push({
          chainId,
          name: network?.chain.name || chainIdToName[chainId] || `Chain ${chainId}`,
          icon: network?.iconUrl
        });
      });

      runInAction(() => {
        this.supportedChains = supportedChains;
        this.supportedTokens = tokensByChain;
        this.isLoading = false;
      });
    } catch (error) {
      console.error('Failed to initialize Universal Account assets:', error);
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Get supported chains that are available in our network configuration
  get availableChains() {
    return this.supportedChains
      .map(chain => networks.find(n => n.chainId === chain.chainId))
      .filter(Boolean) as Network[];
  }

  // Get tokens for a specific chain
  getTokensForChain(chainId: number): UniversalToken[] {
    return this.supportedTokens.get(chainId) || [];
  }

  // Check if a chain is supported by Universal Account
  isChainSupported(chainId: number): boolean {
    return this.supportedChains.some(chain => chain.chainId === chainId);
  }

  // Check if a token is supported on a chain
  isTokenSupported(chainId: number, tokenAddress: string): boolean {
    const tokens = this.getTokensForChain(chainId);
    return tokens.some(token => 
      token.address.toLowerCase() === tokenAddress.toLowerCase()
    );
  }
}

export const universalAccountService = new UniversalAccountService();