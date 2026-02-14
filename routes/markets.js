// routes/markets.js
const express = require('express');
const router = express.Router();
const injectiveService = require('../services/injectiveService');
const { authenticateToken } = require('../middleware/auth');

// Get market summaries
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { type } = req.query;
    const marketType = type || 'spot';
    
    const summaries = await injectiveService.getMarketSummaries(marketType);
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trading activity
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const { timeframe } = req.query;
    const activity = await injectiveService.getTradingActivity(timeframe);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get historical prices for a market
router.get('/prices/:marketId', authenticateToken, async (req, res) => {
  try {
    const { marketId } = req.params;
    const { period } = req.query;
    
    const prices = await injectiveService.getHistoricalPrices(marketId, period);
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;