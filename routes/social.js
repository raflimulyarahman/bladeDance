// routes/social.js
const express = require('express');
const router = express.Router();
const socialTradingService = require('../services/socialTradingService');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// Create a trading post
router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { content, marketId, positionType, entryPrice, stopLoss, takeProfit } = req.body;
    const userId = req.user.userId;

    if (!content || !marketId || !positionType || !entryPrice) {
      return res.status(400).json({ error: 'Content, marketId, positionType, and entryPrice are required' });
    }

    const post = await socialTradingService.createTradingPost(
      userId, 
      content, 
      marketId, 
      positionType, 
      entryPrice, 
      stopLoss, 
      takeProfit
    );

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's trading posts
router.get('/posts/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await socialTradingService.getUserTradingPosts(userId);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get social feed
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit } = req.query;
    const feed = await socialTradingService.getSocialFeed(userId, parseInt(limit) || 20);

    res.json(feed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Follow a user
router.post('/follow/:followedUserId', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user.userId;
    const { followedUserId } = req.params;

    if (followerId === followedUserId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const success = await socialTradingService.followUser(followerId, followedUserId);

    if (success) {
      res.json({ success: true, message: `Started following ${followedUserId}` });
    } else {
      res.status(409).json({ success: false, message: `Already following ${followedUserId}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unfollow a user
router.delete('/follow/:followedUserId', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user.userId;
    const { followedUserId } = req.params;

    const success = await socialTradingService.unfollowUser(followerId, followedUserId);

    if (success) {
      res.json({ success: true, message: `Unfollowed ${followedUserId}` });
    } else {
      res.status(404).json({ success: false, message: `Not following ${followedUserId}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like a post
router.post('/posts/:postId/like', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;

    const result = await socialTradingService.likePost(userId, postId);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Comment on a post
router.post('/posts/:postId/comment', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ error: 'Comment is required' });
    }

    const result = await socialTradingService.commentOnPost(userId, postId, comment);

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Share portfolio
router.post('/portfolio/share', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { portfolioData } = req.body;

    if (!portfolioData) {
      return res.status(400).json({ error: 'Portfolio data is required' });
    }

    const result = await socialTradingService.sharePortfolio(userId, portfolioData);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get shared portfolio
router.get('/portfolio/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const portfolio = await socialTradingService.getSharedPortfolio(userId);

    if (portfolio) {
      res.json(portfolio);
    } else {
      res.status(404).json({ error: 'Portfolio not shared' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a trade idea (requires premium access)
router.post('/ideas', authenticateToken, requirePermission('access:exclusive_data'), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { marketId, idea, positionType, targetPrice, timeFrame } = req.body;

    if (!marketId || !idea || !positionType || !targetPrice) {
      return res.status(400).json({ 
        error: 'marketId, idea, positionType, and targetPrice are required' 
      });
    }

    const tradeIdea = await socialTradingService.createTradeIdea(
      userId,
      marketId,
      idea,
      positionType,
      targetPrice,
      timeFrame
    );

    res.json(tradeIdea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get popular trade ideas
router.get('/ideas/popular', authenticateToken, async (req, res) => {
  try {
    const { limit } = req.query;
    const ideas = await socialTradingService.getPopularTradeIdeas(parseInt(limit) || 10);

    res.json(ideas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Follow a trade idea
router.post('/ideas/:ideaId/follow', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { ideaId } = req.params;

    const result = await socialTradingService.followTradeIdea(userId, ideaId);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top traders
router.get('/top-traders', authenticateToken, async (req, res) => {
  try {
    const { limit } = req.query;
    const topTraders = await socialTradingService.getTopTraders(parseInt(limit) || 10);

    res.json(topTraders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;