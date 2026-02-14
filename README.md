# Blade Dance API

An identity-aware API service for Injective blockchain data, built for the [Ninja API Forge](https://hackquest.io/en/hackathons/Ninja-API-Forge) hackathon.

## Overview

The Blade Dance API provides developers with tools to access and analyze Injective blockchain data. It combines data aggregation, computation services, developer utilities, and social trading features with **N1NJ4 identity awareness** for tiered access and personalized experiences.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Client                        │
│         (Developer / Application)               │
└──────────────────┬──────────────────────────────┘
                   │ HTTP REST
┌──────────────────▼──────────────────────────────┐
│              Express.js Server                  │
│  ┌─────────┐ ┌────────┐ ┌──────────────────┐   │
│  │ Helmet  │ │ CORS   │ │ JWT Auth + N1NJ4  │   │
│  │ (sec)   │ │        │ │ Identity Middleware│   │
│  └─────────┘ └────────┘ └──────────────────┘   │
├─────────────────────────────────────────────────┤
│                  Routes                         │
│  /api/auth  /api/markets  /api/analytics        │
│  /api/utility  /api/social                      │
├─────────────────────────────────────────────────┤
│                Services Layer                   │
│  ┌────────────────┐  ┌───────────────────────┐  │
│  │IdentityService │  │ InjectiveService      │  │
│  │ (N1NJ4 tiers)  │  │ (gRPC: Spot, Deriv,  │  │
│  │                │  │  Oracle, Bank, Exch)  │  │
│  └────────────────┘  └───────────────────────┘  │
│  ┌────────────────┐  ┌───────────────────────┐  │
│  │ Analytics      │  │ SocialTrading         │  │
│  │ Service        │  │ Service               │  │
│  └────────────────┘  └───────────────────────┘  │
│  ┌────────────────┐                             │
│  │ Utility        │                             │
│  │ Service (cache)│                             │
│  └────────────────┘                             │
├─────────────────────────────────────────────────┤
│            Data Sources                         │
│  ┌─────────────────────────────────────────┐    │
│  │     Injective gRPC APIs (Mainnet)       │    │
│  │  IndexerGrpcSpotApi, Derivatives       │    │
│  │  ChainGrpcOracleApi, ChainGrpcBankApi   │    │
│  │  ChainGrpcExchangeApi                   │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │  N1NJ4 NFT Contract (Injective EVM)     │    │
│  │  NinjaLabsNFT (ERC-721Enumerable)       │    │
│  │  NinjaLabsNFTView (read-only queries)   │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

## Injective Data Sources

| Source             | SDK Module                  | Usage                                   |
| ------------------ | --------------------------- | --------------------------------------- |
| Spot Markets       | `IndexerGrpcSpotApi`        | Market summaries, orderbook, liquidity  |
| Derivative Markets | `IndexerGrpcDerivativesApi` | Derivatives data, derivatives orderbook |
| Oracle             | `ChainGrpcOracleApi`        | Price oracle data                       |
| Bank               | `ChainGrpcBankApi`          | Account balances                        |
| Exchange           | `ChainGrpcExchangeApi`      | Account portfolio                       |
| N1NJ4 NFT          | NinjaLabsNFT (EVM)          | Identity tier verification              |

## N1NJ4 Identity Tiers

The API integrates with the [N1NJ4 NFT](https://www.n1nj4.fun/) identity system on Injective EVM:

| Tier       | NFT Background | Access Level                                    |
| ---------- | -------------- | ----------------------------------------------- |
| Standard   | No NFT         | Basic market data                               |
| **WHITE**  | White          | + Advanced analytics, utility endpoints         |
| **PURPLE** | Purple         | + Personalized feeds, social trading            |
| **ORANGE** | Orange         | + Exclusive data, priority support, trade ideas |

## API Endpoints

### Authentication

- `POST /api/auth/login` — Authenticate with wallet address
- `GET /api/auth/profile` — Get user profile with identity info
- `GET /api/auth/feed/:type` — Personalized feed (markets/analytics)

### Markets

- `GET /api/markets/summary?type=spot|derivative` — Market summaries
- `GET /api/markets/activity?timeframe=24h` — Trading activity
- `GET /api/markets/prices/:marketId` — Historical prices

### Analytics

- `GET /api/analytics/volume-spike` — Volume spike detection
- `GET /api/analytics/risk/:marketId` — Risk indicators
- `GET /api/analytics/liquidity/:marketId` — Liquidity depth analysis
- `GET /api/analytics/volatility/:marketId?period=7` — Volatility calculation
- `GET /api/analytics/trend/:marketId?period=7` — Trend detection
- `GET /api/analytics/manipulation/:marketId` — Manipulation patterns
- `GET /api/analytics/sentiment/:marketId` — Sentiment score

### Utilities

- `GET /api/utility/cached/:type` — Cached data (TTL-based)
- `POST /api/utility/normalized` — Normalized market data
- `GET /api/utility/multi-market?types=spot,derivative` — Multi-market aggregation

### Social Trading

- `POST /api/social/posts` — Create trading post
- `GET /api/social/posts/user/:userId` — User's trading posts
- `GET /api/social/feed` — Social feed
- `POST /api/social/follow/:userId` — Follow user
- `DELETE /api/social/follow/:userId` — Unfollow user
- `POST /api/social/posts/:postId/like` — Like post
- `POST /api/social/posts/:postId/comment` — Comment
- `POST /api/social/portfolio/share` — Share portfolio
- `GET /api/social/portfolio/:userId` — Get shared portfolio
- `POST /api/social/ideas` — Create trade idea (ORANGE tier)
- `GET /api/social/ideas/popular` — Popular trade ideas
- `POST /api/social/ideas/:ideaId/follow` — Follow trade idea
- `GET /api/social/top-traders` — Top traders leaderboard

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/rafli/blade-dance-api.git
cd blade-dance-api
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your JWT_SECRET
```

4. Run the development server:

```bash
npm run dev
```

5. Test the health endpoint:

```bash
curl http://localhost:3000/health
```

## Environment Variables

| Variable                      | Required | Description                        |
| ----------------------------- | -------- | ---------------------------------- |
| `JWT_SECRET`                  | Yes      | Secret key for JWT token signing   |
| `PORT`                        | No       | Server port (default: 3000)        |
| `NODE_ENV`                    | No       | Environment (default: development) |
| `N1NJ4_CONTRACT_ADDRESS`      | No       | NinjaLabsNFT contract address      |
| `N1NJ4_VIEW_CONTRACT_ADDRESS` | No       | NinjaLabsNFTView contract address  |
| `INJECTIVE_EVM_RPC`           | No       | Injective EVM RPC endpoint         |

## License

MIT
