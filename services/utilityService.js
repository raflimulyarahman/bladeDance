// services/utilityService.js
const injectiveService = require('./injectiveService');

class UtilityService {
  constructor() {
    // Cache for storing frequently accessed data
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Get cached data if available and not expired
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Set data in cache
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Get normalized market data
  async getNormalizedMarketData(marketIds) {
    const cachedData = this.getCachedData(`normalized_markets_${marketIds.join('_')}`);
    if (cachedData) {
      return cachedData;
    }

    // Fetch data from injective service
    const spotMarkets = await injectiveService.getMarketSummaries('spot');
    const derivativeMarkets = await injectiveService.getMarketSummaries('derivative');
    
    // Normalize and combine data
    const normalizedData = {
      spot: spotMarkets.filter(market => marketIds.includes(market.marketId)),
      derivatives: derivativeMarkets.filter(market => marketIds.includes(market.marketId))
    };

    this.setCachedData(`normalized_markets_${marketIds.join('_')}`, normalizedData);
    return normalizedData;
  }

  // Get aggregated data across multiple markets
  async getMultiMarketAggregated(marketTypes = ['spot', 'derivative']) {
    const cachedData = this.getCachedData(`multi_market_agg_${marketTypes.join('_')}`);
    if (cachedData) {
      return cachedData;
    }

    let aggregatedData = {};
    
    if (marketTypes.includes('spot')) {
      const spotMarkets = await injectiveService.getMarketSummaries('spot');
      aggregatedData.spot = {
        totalMarkets: spotMarkets.length,
        totalVolume: spotMarkets.reduce((sum, market) => sum + parseFloat(market.volume || 0), 0),
        avgPrice: spotMarkets.reduce((sum, market) => sum + parseFloat(market.price || 0), 0) / spotMarkets.length
      };
    }
    
    if (marketTypes.includes('derivative')) {
      const derivativeMarkets = await injectiveService.getMarketSummaries('derivative');
      aggregatedData.derivative = {
        totalMarkets: derivativeMarkets.length,
        totalVolume: derivativeMarkets.reduce((sum, market) => sum + parseFloat(market.volume || 0), 0),
        avgPrice: derivativeMarkets.reduce((sum, market) => sum + parseFloat(market.price || 0), 0) / derivativeMarkets.length
      };
    }

    this.setCachedData(`multi_market_agg_${marketTypes.join('_')}`, aggregatedData);
    return aggregatedData;
  }

  // Get cached trading activity
  async getCachedTradingActivity(timeframe = '24h') {
    const cachedData = this.getCachedData(`trading_activity_${timeframe}`);
    if (cachedData) {
      return cachedData;
    }

    const activity = await injectiveService.getTradingActivity(timeframe);
    this.setCachedData(`trading_activity_${timeframe}`, activity);
    return activity;
  }
}

module.exports = new UtilityService();