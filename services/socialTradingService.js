// services/socialTradingService.js
const injectiveService = require('./injectiveService');
const identityService = require('./identityService');

class SocialTradingService {
  constructor() {
    // In-memory storage for demonstration
    // In production, this would use a database
    this.tradingPosts = [];
    this.followers = new Map(); // Map of user -> [followedUsers]
    this.portfolioShares = new Map(); // Map of user -> portfolio data
    this.tradeIdeas = []; // Community trade ideas
  }

  // Create a trading post
  async createTradingPost(userId, content, marketId, positionType, entryPrice, stopLoss, takeProfit) {
    const post = {
      id: this.generateId(),
      userId,
      content,
      marketId,
      positionType, // 'long' or 'short'
      entryPrice: parseFloat(entryPrice),
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      shares: 0
    };

    this.tradingPosts.unshift(post); // Add to beginning of array
    
    return post;
  }

  // Get user's trading posts
  async getUserTradingPosts(userId) {
    return this.tradingPosts.filter(post => post.userId === userId);
  }

  // Get feed of followed users' posts
  async getSocialFeed(userId, limit = 20) {
    const followedUsers = this.followers.get(userId) || [];
    
    // Include user's own posts plus followed users' posts
    const relevantPosts = this.tradingPosts.filter(post => 
      post.userId === userId || followedUsers.includes(post.userId)
    );
    
    return relevantPosts.slice(0, limit);
  }

  // Follow a user
  async followUser(followerId, followedId) {
    if (!this.followers.has(followerId)) {
      this.followers.set(followerId, []);
    }
    
    const followingList = this.followers.get(followerId);
    if (!followingList.includes(followedId)) {
      followingList.push(followedId);
      return true;
    }
    
    return false; // Already following
  }

  // Unfollow a user
  async unfollowUser(followerId, followedId) {
    if (!this.followers.has(followerId)) {
      return false;
    }
    
    const followingList = this.followers.get(followerId);
    const index = followingList.indexOf(followedId);
    
    if (index !== -1) {
      followingList.splice(index, 1);
      return true;
    }
    
    return false;
  }

  // Like a post
  async likePost(userId, postId) {
    const post = this.tradingPosts.find(p => p.id === postId);
    if (post) {
      // Check if user already liked this post
      if (!post.likesBy) post.likesBy = new Set();
      
      if (!post.likesBy.has(userId)) {
        post.likes++;
        post.likesBy.add(userId);
        return { success: true, newLikeCount: post.likes };
      }
    }
    
    return { success: false, message: 'Already liked or post not found' };
  }

  // Comment on a post
  async commentOnPost(userId, postId, comment) {
    const post = this.tradingPosts.find(p => p.id === postId);
    if (post) {
      const commentObj = {
        id: this.generateId(),
        userId,
        comment,
        timestamp: new Date().toISOString()
      };
      
      post.comments.push(commentObj);
      return commentObj;
    }
    
    return null;
  }

  // Share a portfolio
  async sharePortfolio(userId, portfolioData) {
    // Validate that user actually has this portfolio
    try {
      const actualPortfolio = await injectiveService.getAccountPortfolio(userId);
      
      // Store the shared portfolio
      this.portfolioShares.set(userId, {
        ...portfolioData,
        sharedAt: new Date().toISOString(),
        userId
      });
      
      return {
        success: true,
        message: 'Portfolio shared successfully',
        sharedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Could not verify portfolio: ' + error.message
      };
    }
  }

  // Get a user's shared portfolio
  async getSharedPortfolio(userId) {
    return this.portfolioShares.get(userId) || null;
  }

  // Create a trade idea
  async createTradeIdea(userId, marketId, idea, positionType, targetPrice, timeFrame) {
    const identityInfo = await identityService.getIdentityTier(userId);
    
    // Only allow users with certain identity tiers to create trade ideas
    if (!identityService.hasPermission(identityInfo, 'access:exclusive_data')) {
      throw new Error('Insufficient permissions to create trade ideas');
    }
    
    const tradeIdea = {
      id: this.generateId(),
      userId,
      marketId,
      idea,
      positionType, // 'long' or 'short'
      targetPrice: parseFloat(targetPrice),
      timeFrame, // e.g., 'short-term', 'medium-term', 'long-term'
      timestamp: new Date().toISOString(),
      status: 'active', // 'active', 'executed', 'closed'
      followers: 0,
      conviction: 0 // Willingness to back the idea with actual trades
    };

    this.tradeIdeas.unshift(tradeIdea);
    
    return tradeIdea;
  }

  // Get popular trade ideas
  async getPopularTradeIdeas(limit = 10) {
    // Sort by followers and conviction
    return this.tradeIdeas
      .sort((a, b) => (b.followers + b.conviction) - (a.followers + a.conviction))
      .slice(0, limit);
  }

  // Follow a trade idea
  async followTradeIdea(userId, ideaId) {
    const idea = this.tradeIdeas.find(i => i.id === ideaId);
    if (!idea) {
      return { success: false, message: 'Trade idea not found' };
    }

    if (!idea.followedBy) idea.followedBy = new Set();

    if (idea.followedBy.has(userId)) {
      return { success: false, message: 'Already following this trade idea' };
    }

    idea.followedBy.add(userId);
    idea.followers = idea.followedBy.size;
    return { success: true, newFollowerCount: idea.followers };
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get top traders based on activity
  async getTopTraders(limit = 10) {
    // Count posts per user to determine top traders
    const postCounts = {};
    
    this.tradingPosts.forEach(post => {
      postCounts[post.userId] = (postCounts[post.userId] || 0) + 1;
    });
    
    const topTraderIds = Object.entries(postCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([userId]) => userId);
    
    // Get identity info for these users
    const topTraders = await Promise.all(
      topTraderIds.map(async userId => {
        const identityInfo = await identityService.getIdentityTier(userId);
        return {
          userId,
          postCount: postCounts[userId],
          identityTier: identityInfo.tier,
          tierName: identityInfo.tierDetails.name
        };
      })
    );
    
    return topTraders;
  }
}

module.exports = new SocialTradingService();