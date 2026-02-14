// services/advancedAnalyticsService.js
const injectiveService = require('./injectiveService');

class AdvancedAnalyticsService {
  constructor() {
    this.patternThresholds = {
      // Thresholds for different market patterns
      volumeSpike: 2.0, // 2x average volume indicates a spike
      volatilityHigh: 0.05, // 5% daily volatility is considered high
      trendStrength: 0.7, // 70% correlation indicates strong trend
    };
  }

  // Detect volume spikes compared to historical average
  async detectVolumeSpikes(marketId, windowHours = 24) {
    try {
      // Since we don't have historical data directly from Injective SDK,
      // we'll use a simulated approach based on current market data
      // In a real implementation, this would compare to historical averages
      
      const marketSummaries = await injectiveService.getMarketSummaries();
      const market = marketSummaries.find(m => m.marketId === marketId);
      
      if (!market) {
        throw new Error(`Market ${marketId} not found`);
      }
      
      // This is a simplified simulation - in reality, we'd need historical data
      // to calculate baseline volume and detect spikes
      const randomMultiplier = Math.random() * 3; // Random multiplier between 0 and 3
      
      const isSpike = randomMultiplier > this.patternThresholds.volumeSpike;
      
      return {
        marketId,
        currentVolume: market.quantityDenom || 0, // Placeholder
        baselineVolume: market.quantityDenom ? market.quantityDenom * 0.8 : 1000000, // Placeholder
        spikeFactor: randomMultiplier,
        isSpike,
        timestamp: new Date().toISOString(),
        ...(isSpike && { alert: "Significant volume spike detected" })
      };
    } catch (error) {
      console.error('Error detecting volume spikes:', error);
      throw error;
    }
  }

  // Calculate market volatility using price data
  async calculateVolatility(marketId, periodDays = 7) {
    try {
      // In a real implementation, this would use historical price data
      // For now, we'll simulate using orderbook data to estimate volatility
      
      const liquidityData = await injectiveService.getLiquidityAnalytics(marketId);
      
      // Calculate volatility based on price differences in the orderbook
      const bidPrices = liquidityData.depth.bids.map(bid => bid.price);
      const askPrices = liquidityData.depth.asks.map(ask => ask.price);
      
      // Combine all prices for volatility calculation
      const allPrices = [...bidPrices, ...askPrices];
      
      if (allPrices.length < 2) {
        return {
          marketId,
          volatility: 0,
          periodDays,
          note: "Insufficient price data to calculate volatility"
        };
      }
      
      // Calculate standard deviation as a measure of volatility
      const mean = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;
      const squaredDifferences = allPrices.map(price => Math.pow(price - mean, 2));
      const variance = squaredDifferences.reduce((sum, sqDiff) => sum + sqDiff, 0) / allPrices.length;
      const volatility = Math.sqrt(variance);
      
      const isHighVolatility = volatility > this.patternThresholds.volatilityHigh;
      
      return {
        marketId,
        volatility,
        periodDays,
        meanPrice: mean,
        isHighVolatility,
        volatilityLevel: volatility > this.patternThresholds.volatilityHigh * 2 ? "very_high" : 
                         volatility > this.patternThresholds.volatilityHigh ? "high" : "normal"
      };
    } catch (error) {
      console.error('Error calculating volatility:', error);
      throw error;
    }
  }

  // Detect market trends using price movements
  async detectTrend(marketId, periodDays = 7) {
    try {
      // In a real implementation, this would use historical price data
      // For now, we'll use orderbook data to estimate trend direction
      
      const liquidityData = await injectiveService.getLiquidityAnalytics(marketId);
      
      // Calculate average bid and ask prices
      const avgBid = liquidityData.depth.bids.reduce((sum, bid) => sum + bid.price, 0) / liquidityData.depth.bids.length;
      const avgAsk = liquidityData.depth.asks.reduce((sum, ask) => sum + ask.price, 0) / liquidityData.depth.asks.length;
      const midPrice = (avgBid + avgAsk) / 2;
      
      // Compare with a simulated "previous" price
      // In reality, we'd compare with historical prices
      const previousMidPrice = midPrice * (0.95 + Math.random() * 0.1); // Simulated previous price
      
      const priceChange = midPrice - previousMidPrice;
      const percentChange = (priceChange / previousMidPrice) * 100;
      
      let trendDirection = 'neutral';
      if (percentChange > 2) trendDirection = 'bullish';
      else if (percentChange < -2) trendDirection = 'bearish';
      
      // Calculate trend strength based on consistency of price levels
      const bidAskRatio = liquidityData.totalBidLiquidity / (liquidityData.totalAskLiquidity || 1);
      const trendStrength = Math.min(1, Math.abs(bidAskRatio - 1));
      
      return {
        marketId,
        currentMidPrice: midPrice,
        previousMidPrice,
        priceChange,
        percentChange: percentChange.toFixed(2),
        trendDirection,
        trendStrength,
        isStrongTrend: trendStrength > this.patternThresholds.trendStrength,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error detecting trend:', error);
      throw error;
    }
  }

  // Detect potential manipulation patterns
  async detectManipulationPatterns(marketId) {
    try {
      const liquidityData = await injectiveService.getLiquidityAnalytics(marketId);
      
      // Check for unusual liquidity concentration (potential wash trading sign)
      const topBidConcentration = liquidityData.depth.bids.slice(0, 3)
        .reduce((sum, bid) => sum + bid.quantity, 0) / 
        liquidityData.depth.bids.reduce((sum, bid) => sum + bid.quantity, 0);
      
      const topAskConcentration = liquidityData.depth.asks.slice(0, 3)
        .reduce((sum, ask) => sum + ask.quantity, 0) / 
        liquidityData.depth.asks.reduce((sum, ask) => sum + ask.quantity, 0);
      
      // Check for wide spreads (potential illiquidity sign)
      const bidAskSpread = liquidityData.depth.asks.length > 0 && liquidityData.depth.bids.length > 0 
        ? liquidityData.depth.asks[0].price - liquidityData.depth.bids[0].price
        : 0;
      
      const spreadPercentage = liquidityData.depth.bids.length > 0 
        ? (bidAskSpread / liquidityData.depth.bids[0].price) * 100
        : 0;
      
      // Check for unusual order sizes
      const avgBidSize = liquidityData.depth.bids.reduce((sum, bid) => sum + bid.quantity, 0) / liquidityData.depth.bids.length;
      const avgAskSize = liquidityData.depth.asks.reduce((sum, ask) => sum + ask.quantity, 0) / liquidityData.depth.asks.length;
      
      const largestBid = Math.max(...liquidityData.depth.bids.map(bid => bid.quantity));
      const largestAsk = Math.max(...liquidityData.depth.asks.map(ask => ask.quantity));
      
      const bidSizeRatio = largestBid / (avgBidSize || 1);
      const askSizeRatio = largestAsk / (avgAskSize || 1);
      
      // Determine risk factors
      const riskFactors = [];
      if (topBidConcentration > 0.7) riskFactors.push("High bid concentration");
      if (topAskConcentration > 0.7) riskFactors.push("High ask concentration");
      if (spreadPercentage > 2) riskFactors.push("Wide bid-ask spread");
      if (bidSizeRatio > 10) riskFactors.push("Unusually large bid orders");
      if (askSizeRatio > 10) riskFactors.push("Unusually large ask orders");
      
      return {
        marketId,
        riskFactors,
        topBidConcentration: topBidConcentration.toFixed(4),
        topAskConcentration: topAskConcentration.toFixed(4),
        bidAskSpread,
        spreadPercentage: spreadPercentage.toFixed(4),
        bidSizeRatio: bidSizeRatio.toFixed(2),
        askSizeRatio: askSizeRatio.toFixed(2),
        manipulationRisk: riskFactors.length > 0 ? "medium" : "low",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error detecting manipulation patterns:', error);
      throw error;
    }
  }

  // Generate market sentiment score based on multiple factors
  async generateSentimentScore(marketId) {
    try {
      // Get multiple indicators
      const trend = await this.detectTrend(marketId);
      const volatility = await this.calculateVolatility(marketId);
      const manipulation = await this.detectManipulationPatterns(marketId);
      
      // Calculate sentiment score based on weighted factors
      let sentimentScore = 50; // Base neutral score
      
      // Adjust based on trend
      if (trend.trendDirection === 'bullish') {
        sentimentScore += 20 * trend.trendStrength;
      } else if (trend.trendDirection === 'bearish') {
        sentimentScore -= 20 * trend.trendStrength;
      }
      
      // Adjust based on volatility (higher volatility decreases confidence)
      if (volatility.isHighVolatility) {
        sentimentScore *= 0.9; // Reduce confidence in high volatility
      }
      
      // Adjust based on manipulation risk
      if (manipulation.manipulationRisk === 'medium') {
        sentimentScore *= 0.85; // Reduce confidence if manipulation risk detected
      }
      
      // Ensure score stays within bounds
      sentimentScore = Math.max(0, Math.min(100, sentimentScore));
      
      return {
        marketId,
        sentimentScore: parseFloat(sentimentScore.toFixed(2)),
        sentimentLabel: this.getSentimentLabel(sentimentScore),
        factors: {
          trend: trend.percentChange,
          volatility: volatility.volatilityLevel,
          manipulationRisk: manipulation.manipulationRisk
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating sentiment score:', error);
      throw error;
    }
  }

  // Helper to get sentiment label based on score
  getSentimentLabel(score) {
    if (score >= 80) return 'very_bullish';
    if (score >= 60) return 'bullish';
    if (score >= 40) return 'neutral';
    if (score >= 20) return 'bearish';
    return 'very_bearish';
  }
}

module.exports = new AdvancedAnalyticsService();