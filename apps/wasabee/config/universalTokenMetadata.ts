// Token metadata for Universal Account SDK tokens
// This avoids needing to call contracts for basic token info

export interface TokenMetadata {
  address: string;
  chainId: number;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

// Common token addresses across chains
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

// Token metadata mapping by chainId and address
export const UNIVERSAL_TOKEN_METADATA: Record<number, Record<string, Partial<TokenMetadata>>> = {
  // BSC Mainnet (56)
  56: {
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d': {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/standard/USD_Coin_icon.png'
    },
    '0x55d398326f99059fF775485246999027B3197955': {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png'
    },
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56': {
      symbol: 'BUSD',
      name: 'Binance USD',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/9576/standard/BUSD.png'
    },
    '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3': {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png'
    }
  },
  // Berachain (80094)
  80094: {
    // Add Berachain token metadata as needed
    '0x6982508145454Ce325dDbE47a25d4ec3d2311933': {
      symbol: 'HONEY',
      name: 'Honey',
      decimals: 18,
      logoURI: 'https://assets.berachain.com/honey.png'
    }
  },
  // Ethereum Mainnet (1)
  1: {
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/standard/USD_Coin_icon.png'
    },
    '0xdAC17F958D2ee523a2206206994597C13D831ec7': {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png'
    },
    '0x6B175474E89094C44Da98b954EedeAC495271d0F': {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png'
    }
  },
  // Polygon (137)
  137: {
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174': {
      symbol: 'USDC.e',
      name: 'USD Coin (PoS)',
      decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/standard/USD_Coin_icon.png'
    },
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F': {
      symbol: 'USDT',
      name: 'Tether USD (PoS)',
      decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png'
    },
    '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063': {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png'
    }
  },
  // Arbitrum (42161)
  42161: {
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8': {
      symbol: 'USDC.e',
      name: 'USD Coin (Arb1)',
      decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/standard/USD_Coin_icon.png'
    },
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9': {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png'
    },
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1': {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png'
    }
  },
  // Base (8453)
  8453: {
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/standard/USD_Coin_icon.png'
    },
    '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb': {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png'
    }
  }
};

// Helper function to get token metadata
export function getUniversalTokenMetadata(chainId: number, address: string): Partial<TokenMetadata> | undefined {
  const chainTokens = UNIVERSAL_TOKEN_METADATA[chainId];
  if (!chainTokens) return undefined;
  
  const normalizedAddress = address.toLowerCase();
  
  // Find token by normalized address
  for (const [tokenAddress, metadata] of Object.entries(chainTokens)) {
    if (tokenAddress.toLowerCase() === normalizedAddress) {
      return metadata;
    }
  }
  
  return undefined;
}