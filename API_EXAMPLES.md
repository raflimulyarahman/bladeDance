# API Usage Examples

Here are examples of how to use the Blade Dance API:

## Authentication

First, authenticate with your wallet to get an access token:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "inj1..."
  }'
```

Response:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "walletAddress": "inj1purpleholder",
    "isN1NJ4Holder": true,
    "identityTier": "purple",
    "permissions": [
      "read:markets",
      "read:analytics_basic",
      "read:analytics_advanced",
      "read:utility",
      "access:personalized_feeds",
      "access:social_trading"
    ],
    "limits": {
      "requestsPerMinute": 1000,
      "concurrentConnections": 30
    }
  }
}
```

## Using the API

Once authenticated, include your token in the Authorization header:

```bash
curl -X GET http://localhost:3000/api/markets/summary?type=spot \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Examples

### Authentication & Identity

```bash
# Login (no auth token needed)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "inj1..."}'

# Get user profile
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get personalized feed
curl -X GET http://localhost:3000/api/auth/feed/markets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Market Data

```bash
# Get market summaries
curl -X GET http://localhost:3000/api/markets/summary?type=spot \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get trading activity
curl -X GET http://localhost:3000/api/markets/activity?timeframe=24h \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get historical prices
curl -X GET http://localhost:3000/api/markets/prices/inj123456789 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Advanced Analytics

```bash
# Get risk indicators
curl -X GET http://localhost:3000/api/analytics/risk/inj123456789 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get volume spike detection
curl -X GET http://localhost:3000/api/analytics/volume-spike \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get market volatility
curl -X GET http://localhost:3000/api/analytics/volatility/inj123456789 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get market trend analysis
curl -X GET http://localhost:3000/api/analytics/trend/inj123456789 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get manipulation pattern detection
curl -X GET http://localhost:3000/api/analytics/manipulation/inj123456789 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get market sentiment score
curl -X GET http://localhost:3000/api/analytics/sentiment/inj123456789 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Developer Utilities

```bash
# Get cached data
curl -X GET http://localhost:3000/api/utility/cached/trading-activity \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get normalized market data
curl -X POST http://localhost:3000/api/utility/normalized \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "marketIds": ["inj123456789", "inj987654321"]
  }'

# Get multi-market aggregated data
curl -X GET http://localhost:3000/api/utility/multi-market?types=spot,derivative \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Social Trading

```bash
# Create a trading post
curl -X POST http://localhost:3000/api/social/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "content": "Bullish on INJ with target at $30",
    "marketId": "inj-usdt-spot",
    "positionType": "long",
    "entryPrice": "25.50",
    "stopLoss": "23.00",
    "takeProfit": "30.00"
  }'

# Get social feed
curl -X GET http://localhost:3000/api/social/feed \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Follow a user
curl -X POST http://localhost:3000/api/social/follow/inj1followeduser \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Like a post
curl -X POST http://localhost:3000/api/social/posts/POST_ID/like \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Comment on a post
curl -X POST http://localhost:3000/api/social/posts/POST_ID/comment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"comment": "Great analysis!"}'

# Share portfolio
curl -X POST http://localhost:3000/api/social/portfolio/share \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"portfolioData": {...}}'

# Get popular trade ideas
curl -X GET http://localhost:3000/api/social/ideas/popular \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get top traders
curl -X GET http://localhost:3000/api/social/top-traders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Error Response Format

In case of an error, the API returns:

```json
{
  "error": "Error message describing what went wrong"
}
```

## Health Check

```bash
# Check if the API is running
curl http://localhost:3000/health
```
