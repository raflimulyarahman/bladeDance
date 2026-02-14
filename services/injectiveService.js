// services/injectiveService.js
const { Network, getNetworkEndpoints } = require('@injectivelabs/networks');
const {
  IndexerGrpcSpotApi,
  IndexerGrpcDerivativesApi,
  ChainGrpcOracleApi,
  ChainGrpcBankApi,
  ChainGrpcExchangeApi
} = require('@injectivelabs/sdk-ts');

class InjectiveService {
  constructor() {
    this.network = Network.Mainnet;
    this.endpoints = getNetworkEndpoints(this.network);

    // Indexer APIs — for market data, orderbooks, and trades
    this.spotApi = new IndexerGrpcSpotApi(this.endpoints.indexer);
    this.derivativeApi = new IndexerGrpcDerivativesApi(this.endpoints.indexer);

    // Chain gRPC APIs — for on-chain state (oracle, bank, exchange)
    this.oracleApi = new ChainGrpcOracleApi(this.endpoints.grpc);
    this.bankApi = new ChainGrpcBankApi(this.endpoints.grpc);
    this.exchangeApi = new ChainGrpcExchangeApi(this.endpoints.grpc);
  }

  // Get market summaries
  async getMarketSummaries(marketType = 'spot') {
    try {
      let marketsResponse;

      if (marketType === 'spot') {
        marketsResponse = await this.spotApi.fetchMarkets();
      } else if (marketType === 'derivative') {
        marketsResponse = await this.derivativeApi.fetchMarkets();
      } else {
        // Return both if unspecified
        const spotMarkets = await this.spotApi.fetchMarkets();
        const derivativeMarkets = await this.derivativeApi.fetchMarkets();

        return {
          spot: spotMarkets.markets.map(market => ({
            marketId: market.marketId,
            ticker: market.ticker,
            baseDenom: market.baseDenom,
            quoteDenom: market.quoteDenom,
            makerFeeRate: market.makerFeeRate,
            takerFeeRate: market.takerFeeRate,
            serviceProviderFee: market.serviceProviderFee,
            minPriceTickSize: market.minPriceTickSize,
            minQuantityTickSize: market.minQuantityTickSize
          })),
          derivatives: derivativeMarkets.markets.map(market => ({
            marketId: market.marketId,
            ticker: market.ticker,
            oracleBase: market.oracleBase,
            oracleQuote: market.oracleQuote,
            oracleType: market.oracleType,
            makerFeeRate: market.makerFeeRate,
            takerFeeRate: market.takerFeeRate
          }))
        };
      }

      return marketsResponse.markets.map(market => ({
        marketId: market.marketId,
        ticker: market.ticker,
        baseDenom: market.baseDenom,
        quoteDenom: market.quoteDenom,
        makerFeeRate: market.makerFeeRate,
        takerFeeRate: market.takerFeeRate,
        serviceProviderFee: market.serviceProviderFee,
        minPriceTickSize: market.minPriceTickSize,
        minQuantityTickSize: market.minQuantityTickSize
      }));
    } catch (error) {
      console.error('Error fetching market summaries:', error);
      throw error;
    }
  }

  // Get trading activity
  async getTradingActivity(timeframe = '24h') {
    try {
      // For now, we'll aggregate data from available endpoints
      // In a real implementation, we would use indexer API for historical data
      const spotMarkets = await this.spotApi.fetchMarkets();
      const derivativeMarkets = await this.derivativeApi.fetchMarkets();

      // This is a simplified version - in practice, you'd need to fetch
      // actual trade data from an indexer
      const spotTrades = spotMarkets.markets.slice(0, 5); // Just get first 5 markets
      const derivativeTrades = derivativeMarkets.markets.slice(0, 5);

      // Calculate approximate volumes based on market data
      // Note: Actual trade volume requires indexer API data
      // Using available on-chain market metadata for activity ranking
      const topSpotMarkets = spotTrades.map(market => ({
        marketId: market.marketId,
        ticker: market.ticker,
        makerFeeRate: market.makerFeeRate,
        takerFeeRate: market.takerFeeRate,
        minPriceTickSize: market.minPriceTickSize
      }));

      const topDerivativeMarkets = derivativeTrades.map(market => ({
        marketId: market.marketId,
        ticker: market.ticker,
        makerFeeRate: market.makerFeeRate,
        takerFeeRate: market.takerFeeRate,
        oracleBase: market.oracleBase,
        oracleQuote: market.oracleQuote
      }));

      return {
        timeframe,
        totalMarkets: spotMarkets.markets.length + derivativeMarkets.markets.length,
        topSpotMarkets,
        topDerivativeMarkets
      };
    } catch (error) {
      console.error('Error fetching trading activity:', error);
      throw error;
    }
  }

  // Get historical prices for a specific market
  async getHistoricalPrices(marketId, period = '7d') {
    // NOTE: The Injective SDK doesn't provide direct historical price data
    // This would typically come from an indexer service
    // For this implementation, we'll return an empty result with a note
    return {
      marketId,
      period,
      prices: [],
      note: "Historical price data requires indexer API which is not directly available in the public SDK. Would need to use a third-party indexer or build one."
    };
  }

  // Get liquidity analytics for a market
  async getLiquidityAnalytics(marketId) {
    try {
      // Get orderbook data for the market
      // We need to determine if it's a spot or derivative market
      let orderbook;

      // Try spot market first
      try {
        orderbook = await this.spotApi.fetchOrderbookV2({ marketId });
      } catch (e) {
        // If not a spot market, try derivative
        try {
          orderbook = await this.derivativeApi.fetchOrderbookV2({ marketId });
        } catch (e2) {
          throw new Error(`Market ${marketId} not found in either spot or derivative markets`);
        }
      }

      // Process orderbook data
      const bids = orderbook.orderbook.buyOrders.map(order => ({
        price: parseFloat(order.price),
        quantity: parseFloat(order.quantity),
        timestamp: order.timestamp
      }));

      const asks = orderbook.orderbook.sellOrders.map(order => ({
        price: parseFloat(order.price),
        quantity: parseFloat(order.quantity),
        timestamp: order.timestamp
      }));

      // Calculate total liquidity
      const totalBidLiquidity = bids.reduce((sum, order) => sum + (order.price * order.quantity), 0);
      const totalAskLiquidity = asks.reduce((sum, order) => sum + (order.price * order.quantity), 0);

      return {
        marketId,
        totalBidLiquidity,
        totalAskLiquidity,
        totalLiquidity: totalBidLiquidity + totalAskLiquidity,
        bidLevels: bids.length,
        askLevels: asks.length,
        depth: {
          bids: bids.sort((a, b) => b.price - a.price).slice(0, 10), // Top 10 bids
          asks: asks.sort((a, b) => a.price - b.price).slice(0, 10)  // Top 10 asks
        }
      };
    } catch (error) {
      console.error('Error fetching liquidity analytics:', error);
      throw error;
    }
  }

  // Get risk indicators for a market
  async getRiskIndicators(marketId) {
    try {
      // Get market data
      let market;
      let isSpot = false;

      try {
        const spotMarkets = await this.spotApi.fetchMarkets();
        market = spotMarkets.markets.find(m => m.marketId === marketId);
        isSpot = true;
      } catch (e) {
        const derivativeMarkets = await this.derivativeApi.fetchMarkets();
        market = derivativeMarkets.markets.find(m => m.marketId === marketId);
      }

      if (!market) {
        throw new Error(`Market ${marketId} not found`);
      }

      // Get orderbook for volatility calculation
      const liquidityData = await this.getLiquidityAnalytics(marketId);

      // Calculate risk indicators
      // Note: These are simplified calculations for demonstration
      const bidAskSpread = liquidityData.depth.asks.length > 0 && liquidityData.depth.bids.length > 0
        ? liquidityData.depth.asks[0].price - liquidityData.depth.bids[0].price
        : 0;

      const spreadPercentage = liquidityData.depth.bids.length > 0
        ? (bidAskSpread / liquidityData.depth.bids[0].price) * 100
        : 0;

      // Calculate volume-based indicators if possible
      // (would need actual trade volume data from indexer)

      return {
        marketId,
        marketType: isSpot ? 'spot' : 'derivative',
        bidAskSpread,
        spreadPercentage: spreadPercentage.toFixed(4),
        totalLiquidity: liquidityData.totalLiquidity,
        liquidityDepth: liquidityData.bidLevels + liquidityData.askLevels,
        makerFeeRate: market.makerFeeRate,
        takerFeeRate: market.takerFeeRate,
        note: "Advanced risk indicators like volatility and funding rates require historical trade data from indexer"
      };
    } catch (error) {
      console.error('Error fetching risk indicators:', error);
      throw error;
    }
  }

  // Get account balances
  async getAccountBalances(address) {
    try {
      const balances = await this.bankApi.fetchBalances({ accountAddress: address });
      return balances.balances;
    } catch (error) {
      console.error('Error fetching account balances:', error);
      throw error;
    }
  }

  // Get account portfolio
  async getAccountPortfolio(address) {
    try {
      const balances = await this.getAccountBalances(address);
      const spotPositions = await this.exchangeApi.fetchAccountPortfolio({ accountAddress: address });

      return {
        address,
        balances,
        positions: spotPositions
      };
    } catch (error) {
      console.error('Error fetching account portfolio:', error);
      throw error;
    }
  }
}

module.exports = new InjectiveService();