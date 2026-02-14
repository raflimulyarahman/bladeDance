<p align="center">
  <img src="banner.png" alt="Blade Dance API Banner" width="600" />
</p>

<h1 align="center">⚔️ Blade Dance API</h1>

<p align="center">
  <strong>Built for Injective, by hokaPI.</strong><br/>
  An identity-aware API service for Injective blockchain data — powered by N1NJ4 identity.
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#problem-statement">Problem</a> •
  <a href="#solution">Solution</a> •
  <a href="#technology-stack">Tech Stack</a> •
  <a href="#system-architecture">Architecture</a> •
  <a href="#api-endpoints">API</a> •
  <a href="#setup-instructions">Setup</a>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Injective Data Sources](#injective-data-sources)
- [N1NJ4 Identity Tiers](#n1nj4-identity-tiers)
- [API Endpoints](#api-endpoints)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

Blade Dance API is a developer utility service that provides comprehensive access to **Injective blockchain data** with advanced analytics and social trading features. The API leverages [N1NJ4 NFT](https://www.n1nj4.fun/) identity (WHITE / PURPLE / ORANGE tiers) for personalized access control, offering tiered data feeds, analytics depth, and feature access based on **on-chain identity**.

### Key Innovation

Traditional blockchain APIs treat every user the same. Blade Dance API introduces **identity-aware access** through on-chain NFT verification:

- **N1NJ4 NFT Integration**: Cryptographic verification of holder tier via ERC-721Enumerable contract
- **Tiered Data Access**: Different data depth and feature availability per identity tier
- **Wallet-Based Auth**: JWT authentication with on-chain identity claims
- **Zero Trust**: All identity checks verified directly against the Injective EVM smart contract

---

## Problem Statement

Developers building on Injective face several challenges:

1. **Complex gRPC APIs**: Raw Injective SDK requires deep protocol knowledge and complex setup
2. **No Derived Insights**: Chain data is raw — no sentiment, volatility, or manipulation analysis available out of the box
3. **No Identity Layer**: No way to differentiate API access based on on-chain reputation or NFT holdings
4. **Fragmented Data**: Spot, derivative, oracle, bank, and exchange data all require separate API calls and different SDK modules
5. **No Social Layer**: No community-driven trading insights or social features built on top of chain data

---

## Solution

Blade Dance API addresses these challenges through:

### 1. Simplified Data Access

- Clean REST endpoints that abstract complex gRPC calls
- Consistent JSON response formats across all data types
- Single API for spot, derivative, oracle, bank, and exchange data

### 2. Advanced Analytics Engine

- Volatility calculation using orderbook price distribution
- Trend detection with bid/ask ratio strength analysis
- Manipulation pattern detection (concentration, spread, order size anomalies)
- Composite market sentiment scoring

### 3. Identity-Aware Architecture

- N1NJ4 NFT tier verification via on-chain smart contract
- Permission-based access control per tier
- Rate limiting scaled by identity level
- Personalized data feeds based on holder status

### 4. Developer Utilities

- TTL-based caching layer for frequently accessed data
- Normalized query endpoints for consistent cross-market formats
- Multi-market aggregation for spot and derivative overviews

### 5. Social Trading Platform

- Trading posts with position details (long/short, entry, SL, TP)
- User following system with social feed
- Portfolio sharing and trade idea creation
- Top traders leaderboard based on community activity

---

## Technology Stack

### Runtime & Framework

- **Node.js** + **Express.js**: Fast, lightweight HTTP server
- **JavaScript (ES6+)**: Modern JavaScript with async/await patterns

### Blockchain Integration

- **@injectivelabs/sdk-ts**: Official Injective SDK for gRPC API access
- **ethers.js**: EVM interaction for N1NJ4 NFT contract queries

### Authentication & Security

- **jsonwebtoken**: JWT-based authentication with identity claims
- **Helmet**: HTTP security headers
- **CORS**: Cross-origin resource sharing

### Data Layer

- **In-Memory TTL Cache**: Fast caching for frequently accessed data
- **Injective gRPC APIs**: Direct mainnet data access

### Development

- **dotenv**: Environment variable management
- **nodemon**: Hot-reload development server

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client                             │
│              (Developer / Application)                  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP REST
┌────────────────────────▼────────────────────────────────┐
│                 Express.js Server                       │
│  ┌──────────┐  ┌────────┐  ┌────────────────────────┐  │
│  │ Helmet   │  │ CORS   │  │ JWT Auth + N1NJ4       │  │
│  │ (sec)    │  │        │  │ Identity Middleware     │  │
│  └──────────┘  └────────┘  └────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                     Routes                              │
│  /api/auth   /api/markets   /api/analytics              │
│  /api/utility   /api/social                             │
├─────────────────────────────────────────────────────────┤
│                  Services Layer                         │
│  ┌──────────────────┐  ┌─────────────────────────────┐  │
│  │ IdentityService  │  │ InjectiveService            │  │
│  │ (N1NJ4 tiers)    │  │ (gRPC: Spot, Deriv,         │  │
│  │                  │  │  Oracle, Bank, Exchange)     │  │
│  └──────────────────┘  └─────────────────────────────┘  │
│  ┌──────────────────┐  ┌─────────────────────────────┐  │
│  │ Analytics        │  │ SocialTrading               │  │
│  │ Service          │  │ Service                     │  │
│  └──────────────────┘  └─────────────────────────────┘  │
│  ┌──────────────────┐                                   │
│  │ Utility          │                                   │
│  │ Service (cache)  │                                   │
│  └──────────────────┘                                   │
├─────────────────────────────────────────────────────────┤
│                   Data Sources                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │       Injective gRPC APIs (Mainnet)               │  │
│  │  IndexerGrpcSpotApi · IndexerGrpcDerivativesApi   │  │
│  │  ChainGrpcOracleApi · ChainGrpcBankApi            │  │
│  │  ChainGrpcExchangeApi                             │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │    N1NJ4 NFT Contract (Injective EVM)             │  │
│  │    NinjaLabsNFT (ERC-721Enumerable)               │  │
│  │    NinjaLabsNFTView (read-only queries)           │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Injective Data Sources

| Source             | SDK Module                  | Usage                                   |
| ------------------ | --------------------------- | --------------------------------------- |
| Spot Markets       | `IndexerGrpcSpotApi`        | Market summaries, orderbook, liquidity  |
| Derivative Markets | `IndexerGrpcDerivativesApi` | Derivatives data, derivatives orderbook |
| Oracle             | `ChainGrpcOracleApi`        | Price oracle data                       |
| Bank               | `ChainGrpcBankApi`          | Account balances                        |
| Exchange           | `ChainGrpcExchangeApi`      | Account portfolio                       |
| N1NJ4 NFT          | NinjaLabsNFT (EVM)          | Identity tier verification              |

---

## N1NJ4 Identity Tiers

The API integrates with the [N1NJ4 NFT](https://www.n1nj4.fun/) identity system on Injective EVM:

| Tier       | NFT Background | Access Level                                    |
| ---------- | -------------- | ----------------------------------------------- |
| Standard   | No NFT         | Basic market data                               |
| **WHITE**  | White          | + Advanced analytics, utility endpoints         |
| **PURPLE** | Purple         | + Personalized feeds, social trading            |
| **ORANGE** | Orange         | + Exclusive data, priority support, trade ideas |

---

## API Endpoints

### Authentication & Identity

| Method | Endpoint               | Description                           |
| ------ | ---------------------- | ------------------------------------- |
| POST   | `/api/auth/login`      | Authenticate with wallet address      |
| GET    | `/api/auth/profile`    | Get user profile with identity info   |
| GET    | `/api/auth/feed/:type` | Personalized feed (markets/analytics) |

### Markets

| Method | Endpoint                              | Description       |
| ------ | ------------------------------------- | ----------------- |
| GET    | `/api/markets/summary?type=spot`      | Market summaries  |
| GET    | `/api/markets/activity?timeframe=24h` | Trading activity  |
| GET    | `/api/markets/prices/:marketId`       | Historical prices |

### Analytics

| Method | Endpoint                                       | Description            |
| ------ | ---------------------------------------------- | ---------------------- |
| GET    | `/api/analytics/volume-spike`                  | Volume spike detection |
| GET    | `/api/analytics/risk/:marketId`                | Risk indicators        |
| GET    | `/api/analytics/liquidity/:marketId`           | Liquidity depth        |
| GET    | `/api/analytics/volatility/:marketId?period=7` | Volatility             |
| GET    | `/api/analytics/trend/:marketId?period=7`      | Trend analysis         |
| GET    | `/api/analytics/manipulation/:marketId`        | Manipulation patterns  |
| GET    | `/api/analytics/sentiment/:marketId`           | Sentiment score        |

### Utilities

| Method | Endpoint                                          | Description              |
| ------ | ------------------------------------------------- | ------------------------ |
| GET    | `/api/utility/cached/:type`                       | Cached data (TTL-based)  |
| POST   | `/api/utility/normalized`                         | Normalized market data   |
| GET    | `/api/utility/multi-market?types=spot,derivative` | Multi-market aggregation |

### Social Trading

| Method | Endpoint                            | Description                     |
| ------ | ----------------------------------- | ------------------------------- |
| POST   | `/api/social/posts`                 | Create trading post             |
| GET    | `/api/social/posts/user/:userId`    | User's trading posts            |
| GET    | `/api/social/feed`                  | Social feed                     |
| POST   | `/api/social/follow/:userId`        | Follow user                     |
| DELETE | `/api/social/follow/:userId`        | Unfollow user                   |
| POST   | `/api/social/posts/:postId/like`    | Like post                       |
| POST   | `/api/social/posts/:postId/comment` | Comment on post                 |
| POST   | `/api/social/portfolio/share`       | Share portfolio                 |
| GET    | `/api/social/portfolio/:userId`     | Get shared portfolio            |
| POST   | `/api/social/ideas`                 | Create trade idea (ORANGE tier) |
| GET    | `/api/social/ideas/popular`         | Popular trade ideas             |
| POST   | `/api/social/ideas/:ideaId/follow`  | Follow trade idea               |
| GET    | `/api/social/top-traders`           | Top traders leaderboard         |

---

## Key Features

### For Developers

- **Simplified Access**: Clean REST endpoints abstracting complex Injective gRPC APIs
- **Consistent Formats**: Normalized JSON responses across spot, derivative, oracle, bank data
- **Caching**: TTL-based cache layer reducing redundant chain queries
- **Multi-Market Queries**: Single endpoint for aggregated cross-market data

### For Traders

- **Social Feed**: Share trading positions, follow top traders, discuss market moves
- **Trade Ideas**: Create and follow trade ideas with entry/SL/TP levels
- **Portfolio Sharing**: Share your portfolio performance with the community
- **Leaderboard**: Top traders ranked by community engagement

### Technical Features

- **Identity Verification**: On-chain N1NJ4 NFT tier detection via ERC-721Enumerable
- **Tiered Rate Limiting**: Request limits scaled by identity tier
- **Security**: Helmet headers, CORS, JWT auth, input validation
- **Modular Architecture**: Clean separation of routes → services → data layer

---

## Project Structure

```
blade-dance-api/
├── index.js                          # Express server entry point
├── config/
│   └── config.js                     # App configuration & constants
├── middleware/
│   ├── auth.js                       # JWT + N1NJ4 identity middleware
│   └── errorHandler.js               # Global error handler
├── routes/
│   ├── auth.js                       # Authentication & identity routes
│   ├── markets.js                    # Market data routes
│   ├── analytics.js                  # Analytics routes
│   ├── utility.js                    # Developer utility routes
│   └── social.js                     # Social trading routes
├── services/
│   ├── identityService.js            # N1NJ4 NFT tier verification
│   ├── injectiveService.js           # Injective gRPC data access
│   ├── advancedAnalyticsService.js   # Analytics computation engine
│   ├── socialTradingService.js       # Social trading logic
│   └── utilityService.js             # Caching & data normalization
├── validators/
│   └── index.js                      # Input validation rules
├── .env.example                      # Environment variable template
├── .gitignore                        # Git ignore rules
├── package.json                      # Dependencies & scripts
└── API_EXAMPLES.md                   # API usage examples
```

---

## Setup Instructions

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/raflimulyarahman/bladeDance.git
   cd bladeDance
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env — set JWT_SECRET (required)
   ```

4. **Start development server:**

   ```bash
   npm run dev
   ```

5. **Verify the API is running:**

   ```bash
   curl http://localhost:3000/health
   ```

   Expected response:

   ```json
   {
     "status": "ok",
     "uptime": 1.234
   }
   ```

---

## Environment Variables

| Variable                      | Required | Description                        |
| ----------------------------- | -------- | ---------------------------------- |
| `JWT_SECRET`                  | Yes      | Secret key for JWT token signing   |
| `PORT`                        | No       | Server port (default: 3000)        |
| `NODE_ENV`                    | No       | Environment (default: development) |
| `N1NJ4_CONTRACT_ADDRESS`      | No       | NinjaLabsNFT contract address      |
| `N1NJ4_VIEW_CONTRACT_ADDRESS` | No       | NinjaLabsNFTView contract address  |
| `INJECTIVE_EVM_RPC`           | No       | Injective EVM RPC endpoint         |

---

## License

MIT
