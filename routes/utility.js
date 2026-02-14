// routes/utility.js
const express = require('express');
const router = express.Router();
const utilityService = require('../services/utilityService');
const { authenticateToken } = require('../middleware/auth');

// Get cached data by type
router.get('/cached/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { timeframe } = req.query;
    
    let cachedData;
    
    switch(type) {
      case 'trading-activity':
        cachedData = await utilityService.getCachedTradingActivity(timeframe);
        break;
      default:
        return res.status(400).json({ error: 'Invalid cache type' });
    }
    
    res.json(cachedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get normalized queries
router.post('/normalized', authenticateToken, async (req, res) => {
  try {
    const { marketIds } = req.body;
    
    if (!marketIds || !Array.isArray(marketIds)) {
      return res.status(400).json({ error: 'Valid marketIds array required' });
    }
    
    const normalizedData = await utilityService.getNormalizedMarketData(marketIds);
    res.json(normalizedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get multi-market aggregated data
router.get('/multi-market', authenticateToken, async (req, res) => {
  try {
    const { types } = req.query;
    const marketTypes = types ? types.split(',') : ['spot', 'derivative'];
    
    const aggregatedData = await utilityService.getMultiMarketAggregated(marketTypes);
    res.json(aggregatedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;