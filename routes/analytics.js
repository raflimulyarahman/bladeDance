// routes/analytics.js
const express = require('express');
const router = express.Router();
const injectiveService = require('../services/injectiveService');
const advancedAnalyticsService = require('../services/advancedAnalyticsService');
const { authenticateToken } = require('../middleware/auth');

// Get volume spike detection
router.get('/volume-spike', authenticateToken, async (req, res) => {
  try {
    const { marketId } = req.query; // Optional: specific market ID

    if (marketId) {
      // Get spike data for specific market
      const spikeData = await advancedAnalyticsService.detectVolumeSpikes(marketId);
      res.json(spikeData);
    } else {
      // Get market summaries and check each for spikes
      const marketSummaries = await injectiveService.getMarketSummaries('spot');
      const results = [];

      // In a real implementation, we'd check all markets
      // For performance, we'll just check the first few
      for (const market of marketSummaries.slice(0, 5)) {
        try {
          const spikeData = await advancedAnalyticsService.detectVolumeSpikes(market.marketId);
          if (spikeData.isSpike) {
            results.push(spikeData);
          }
        } catch (err) {
          // Skip markets that cause errors
          continue;
        }
      }

      res.json({
        detectedSpikes: results,
        totalMarketsChecked: Math.min(5, marketSummaries.length),
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get risk indicators for a market
router.get('/risk/:marketId', authenticateToken, async (req, res) => {
  try {
    const { marketId } = req.params;
    const riskIndicators = await injectiveService.getRiskIndicators(marketId);

    res.json(riskIndicators);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get liquidity analytics for a market
router.get('/liquidity/:marketId', authenticateToken, async (req, res) => {
  try {
    const { marketId } = req.params;
    const liquidityData = await injectiveService.getLiquidityAnalytics(marketId);

    res.json(liquidityData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get market volatility
router.get('/volatility/:marketId', authenticateToken, async (req, res) => {
  try {
    const { marketId } = req.params;
    const { period } = req.query;
    const periodDays = parseInt(period) || 7;

    const volatilityData = await advancedAnalyticsService.calculateVolatility(marketId, periodDays);

    res.json(volatilityData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get market trend analysis
router.get('/trend/:marketId', authenticateToken, async (req, res) => {
  try {
    const { marketId } = req.params;
    const { period } = req.query;
    const periodDays = parseInt(period) || 7;

    const trendData = await advancedAnalyticsService.detectTrend(marketId, periodDays);

    res.json(trendData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get manipulation pattern detection
router.get('/manipulation/:marketId', authenticateToken, async (req, res) => {
  try {
    const { marketId } = req.params;

    const manipulationData = await advancedAnalyticsService.detectManipulationPatterns(marketId);

    res.json(manipulationData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get market sentiment score
router.get('/sentiment/:marketId', authenticateToken, async (req, res) => {
  try {
    const { marketId } = req.params;

    const sentimentData = await advancedAnalyticsService.generateSentimentScore(marketId);

    res.json(sentimentData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;