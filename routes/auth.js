// routes/auth.js
const express = require('express');
const router = express.Router();
const identityService = require('../services/identityService');
const { authenticateToken } = require('../middleware/auth');

// Route for wallet authentication
router.post('/login', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Get identity information for the wallet
    const identityInfo = await identityService.getIdentityTier(walletAddress);

    // Generate identity-aware token
    const token = identityService.generateIdentityToken(identityInfo);

    res.json({
      success: true,
      token,
      user: {
        walletAddress: identityInfo.walletAddress,
        isN1NJ4Holder: identityInfo.isN1NJ4Holder,
        identityTier: identityInfo.tier,
        permissions: identityInfo.tierDetails.permissions,
        limits: identityInfo.tierDetails.limits
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile with identity information
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Get updated identity info from the authenticated user
    const identityInfo = await identityService.getIdentityTier(req.user.userId);

    res.json({
      user: {
        walletAddress: identityInfo.walletAddress,
        isN1NJ4Holder: identityInfo.isN1NJ4Holder,
        identityTier: identityInfo.tier,
        tierName: identityInfo.tierDetails.name,
        permissions: identityInfo.tierDetails.permissions,
        limits: identityInfo.tierDetails.limits
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get personalized feed based on identity
router.get('/feed/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;

    // Get personalized feed using the authenticated user's identity
    const feed = await identityService.getPersonalizedFeed(req.user.userId, type);

    res.json(feed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;