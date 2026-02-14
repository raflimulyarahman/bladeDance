// middleware/auth.js
const jwt = require('jsonwebtoken');
const identityService = require('../services/identityService');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, secret);

    // Attach user identity info to request
    req.user = decoded;

    // Check rate limits based on identity tier
    const identityInfo = await identityService.getIdentityTier(decoded.userId);
    const limits = identityService.getUserLimits(identityInfo);

    // In a production environment, we would track requests per user
    // and enforce rate limits here using a sliding window counter

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check specific permissions
const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasPerm = req.user.permissions && req.user.permissions.includes(permission);

    if (!hasPerm) {
      return res.status(403).json({ error: `Permission '${permission}' required` });
    }

    next();
  };
};

module.exports = { authenticateToken, requirePermission };