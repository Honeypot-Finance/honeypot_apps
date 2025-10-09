const nxPreset = require('@nx/jest/preset').default;

module.exports = { 
  ...nxPreset,
  // Add global configuration for handling ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(uuid|superjson|@solana/web3\\.js|@coral-xyz/anchor|@particle-network/.*|jayson|@rainbow-me/.*|wagmi|@wagmi/.*|@gemini-wallet/.*|viem|cuer|qr))',
  ],
};
