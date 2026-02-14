// config/config.js
// Central configuration for the Blade Dance API

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h'
  },

  // N1NJ4 NFT Contract (Injective EVM)
  // Contract: ERC-721 (ERC721Enumerable) — NinjaLabsNFT
  // Reference: https://github.com/Ninja-Labs-CN/NinjaNFTContract
  n1nj4: {
    contractAddress: process.env.N1NJ4_CONTRACT_ADDRESS || '',
    viewContractAddress: process.env.N1NJ4_VIEW_CONTRACT_ADDRESS || '',
    evmRpc: process.env.INJECTIVE_EVM_RPC || 'https://inevm.calderachain.xyz/http'
  },

  // Injective gRPC network
  injective: {
    network: process.env.INJECTIVE_NETWORK || 'mainnet'
  },

  // Cache configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 300 // 5 minutes in seconds
  },

  // API rate limiting
  api: {
    defaultRateLimit: parseInt(process.env.RATE_LIMIT) || 100, // requests per minute
    maxRetries: parseInt(process.env.MAX_RETRIES) || 3
  }
};
