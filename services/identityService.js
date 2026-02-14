// services/identityService.js
const jwt = require('jsonwebtoken');

class IdentityService {
  constructor() {
    // N1NJ4 NFT Contract Configuration
    // In production, these would query the actual NinjaLabsNFT contract on Injective EVM
    // Contract reference: https://github.com/Ninja-Labs-CN/NinjaNFTContract
    this.contractAddress = process.env.N1NJ4_CONTRACT_ADDRESS || '';
    this.viewContractAddress = process.env.N1NJ4_VIEW_CONTRACT_ADDRESS || '';

    // Simulated N1NJ4 holders for local development
    // In production: query NinjaLabsNFT.balanceOf(address) > 0
    // Then NinjaLabsNFTView.getUserStats(address) for tier
    this.simulatedHolders = new Map([
      ['inj1whiteholder', { tier: 'white', points: 50 }],
      ['inj1purpleholder', { tier: 'purple', points: 300 }],
      ['inj1orangeholder', { tier: 'orange', points: 1000 }]
    ]);

    // N1NJ4 Identity Tiers — matches the on-chain NinjaLabsNFT contract
    // Tiers: WHITE (base) → PURPLE (veteran) → ORANGE (elite)
    // Tier upgrades are based on accumulated community points
    this.identityTiers = {
      'standard': {
        name: 'Standard User',
        description: 'Non-holder — basic access to public market data',
        permissions: [
          'read:markets',
          'read:analytics_basic'
        ],
        limits: {
          requestsPerMinute: 60,
          concurrentConnections: 3
        }
      },
      'white': {
        name: 'N1NJ4 White',
        description: 'Community contributor — white background NFT holder',
        permissions: [
          'read:markets',
          'read:analytics_basic',
          'read:analytics_advanced',
          'read:utility'
        ],
        limits: {
          requestsPerMinute: 300,
          concurrentConnections: 10
        }
      },
      'purple': {
        name: 'N1NJ4 Purple',
        description: 'Veteran contributor — purple background NFT holder',
        permissions: [
          'read:markets',
          'read:analytics_basic',
          'read:analytics_advanced',
          'read:utility',
          'access:personalized_feeds',
          'access:social_trading'
        ],
        limits: {
          requestsPerMinute: 1000,
          concurrentConnections: 30
        }
      },
      'orange': {
        name: 'N1NJ4 Orange',
        description: 'Elite contributor — orange background NFT holder (max tier)',
        permissions: [
          'read:markets',
          'read:analytics_basic',
          'read:analytics_advanced',
          'read:utility',
          'access:personalized_feeds',
          'access:social_trading',
          'access:exclusive_data',
          'access:priority_support'
        ],
        limits: {
          requestsPerMinute: 5000,
          concurrentConnections: 100
        }
      }
    };
  }

  /**
   * Verify N1NJ4 NFT ownership for a wallet address.
   * 
   * Production implementation would:
   * 1. Call NinjaLabsNFT.balanceOf(walletAddress) to check ownership
   * 2. Call NinjaLabsNFTView.getUserStats(walletAddress) for tier info
   * 3. Determine tier from on-chain points via getTierProgress()
   * 
   * Contract: ERC-721 (ERC721Enumerable) on Injective EVM
   * Tiers: WHITE (0 points) → PURPLE (tier1Threshold) → ORANGE (tier2Threshold)
   * 
   * @param {string} walletAddress - Injective wallet address (inj1...)
   * @returns {Object|null} Holder info with tier, or null if not a holder
   */
  async verifyN1NJ4Holder(walletAddress) {
    // In production, replace with actual EVM contract call:
    //
    // const ethers = require('ethers');
    // const provider = new ethers.JsonRpcProvider(process.env.INJECTIVE_EVM_RPC);
    // const nftContract = new ethers.Contract(this.contractAddress, [
    //   'function balanceOf(address) view returns (uint256)'
    // ], provider);
    // const balance = await nftContract.balanceOf(walletAddress);
    // if (balance === 0n) return null;
    //
    // const viewContract = new ethers.Contract(this.viewContractAddress, [
    //   'function getUserStats(address) view returns (uint256,uint256,uint8,uint256)',
    //   'function getTierProgress(address) view returns (uint8,uint256,uint256)'
    // ], provider);
    // const [holdCount, points, highestTier, nextTierDelta] = await viewContract.getUserStats(walletAddress);
    // const tierNames = ['white', 'purple', 'orange'];
    // return { tier: tierNames[highestTier], points: Number(points) };

    // Local development: deterministic lookup
    return this.simulatedHolders.get(walletAddress) || null;
  }

  /**
   * Get full identity tier information for a wallet address.
   * @param {string} walletAddress - Injective wallet address
   * @returns {Object} Identity info including tier, permissions, and limits
   */
  async getIdentityTier(walletAddress) {
    const holderInfo = await this.verifyN1NJ4Holder(walletAddress);

    if (holderInfo) {
      const tierDetails = this.identityTiers[holderInfo.tier];
      return {
        walletAddress,
        isN1NJ4Holder: true,
        tier: holderInfo.tier,
        points: holderInfo.points,
        tierDetails,
        verifiedAt: new Date().toISOString()
      };
    }

    return {
      walletAddress,
      isN1NJ4Holder: false,
      tier: 'standard',
      points: 0,
      tierDetails: this.identityTiers.standard,
      verifiedAt: new Date().toISOString()
    };
  }

  /**
   * Generate a JWT token with identity claims.
   * @param {Object} userData - Identity data from getIdentityTier()
   * @returns {string} Signed JWT token
   */
  generateIdentityToken(userData) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    const tokenPayload = {
      userId: userData.walletAddress,
      isN1NJ4Holder: userData.isN1NJ4Holder,
      identityTier: userData.tier,
      permissions: userData.tierDetails.permissions,
      limits: userData.tierDetails.limits
    };

    return jwt.sign(tokenPayload, secret, { expiresIn: '24h' });
  }

  /**
   * Get personalized data feed based on N1NJ4 identity tier.
   * Higher tiers receive richer data with premium insights.
   * @param {string} walletAddress - Wallet address
   * @param {string} feedType - Feed type: 'markets' or 'analytics'
   * @returns {Object} Personalized feed data
   */
  async getPersonalizedFeed(walletAddress, feedType = 'markets') {
    const identityInfo = await this.getIdentityTier(walletAddress);

    switch (feedType) {
      case 'markets':
        if (identityInfo.tier === 'orange') {
          return {
            feedType,
            identityTier: identityInfo.tier,
            tierName: identityInfo.tierDetails.name,
            data: [
              { marketId: 'exclusive-market-1', ticker: 'EXCL.USDT', status: 'pre-launch', access: 'orange-only' },
              { marketId: 'inj-usdt-spot', ticker: 'INJ/USDT', volume: '1.2M', premiumInsights: true },
              { marketId: 'atom-usdt-spot', ticker: 'ATOM/USDT', volume: '800K', premiumInsights: true }
            ]
          };
        } else if (identityInfo.tier === 'purple') {
          return {
            feedType,
            identityTier: identityInfo.tier,
            tierName: identityInfo.tierDetails.name,
            data: [
              { marketId: 'inj-usdt-spot', ticker: 'INJ/USDT', volume: '1.2M', premiumInsights: true },
              { marketId: 'atom-usdt-spot', ticker: 'ATOM/USDT', volume: '800K', premiumInsights: true }
            ]
          };
        } else if (identityInfo.tier === 'white') {
          return {
            feedType,
            identityTier: identityInfo.tier,
            tierName: identityInfo.tierDetails.name,
            data: [
              { marketId: 'inj-usdt-spot', ticker: 'INJ/USDT', volume: '1.2M', premiumInsights: false },
              { marketId: 'atom-usdt-spot', ticker: 'ATOM/USDT', volume: '800K', premiumInsights: false }
            ]
          };
        } else {
          return {
            feedType,
            identityTier: identityInfo.tier,
            tierName: identityInfo.tierDetails.name,
            data: [
              { marketId: 'inj-usdt-spot', ticker: 'INJ/USDT', volume: '1.2M' }
            ]
          };
        }

      case 'analytics':
        if (['orange', 'purple'].includes(identityInfo.tier)) {
          return {
            feedType,
            identityTier: identityInfo.tier,
            tierName: identityInfo.tierDetails.name,
            data: [
              { type: 'sentiment-analysis', marketId: 'inj-usdt', score: 78, detailed: true },
              { type: 'manipulation-risk', marketId: 'btc-usdt', level: 'low', detailed: true },
              { type: 'liquidity-depth', marketId: 'eth-usdt', score: 92, detailed: true }
            ]
          };
        } else {
          return {
            feedType,
            identityTier: identityInfo.tier,
            tierName: identityInfo.tierDetails.name,
            data: [
              { type: 'sentiment-analysis', marketId: 'inj-usdt', score: 78 },
              { type: 'manipulation-risk', marketId: 'btc-usdt', level: 'low' }
            ]
          };
        }

      default:
        return {
          feedType,
          identityTier: identityInfo.tier,
          tierName: identityInfo.tierDetails.name,
          data: []
        };
    }
  }

  /**
   * Check if identity has a specific permission.
   * @param {Object} identityInfo - Result from getIdentityTier()
   * @param {string} permission - Permission string to check
   * @returns {boolean}
   */
  hasPermission(identityInfo, permission) {
    return identityInfo.tierDetails.permissions.includes(permission);
  }

  /**
   * Get rate limits for a user based on their identity tier.
   * @param {Object} identityInfo - Result from getIdentityTier()
   * @returns {Object} Limits object { requestsPerMinute, concurrentConnections }
   */
  getUserLimits(identityInfo) {
    return identityInfo.tierDetails.limits;
  }
}

module.exports = new IdentityService();