# Order Execution Engine

## Overview

This project is a high-performance, asynchronous Order Execution Engine designed for the Solana ecosystem (mocked). It features:

- Order Submission: Fastify API to submit Market Orders/
- Queue System: BullMQ (Redis) to decouple submission from execution.
- Smart Routing: Compares the prices between Raydium and Meteora (Mocked) to find the best route.
- Real-Time Updates: WebSocket updates to the client for order status.

## Deployment

**Live URL:** [https://order-execution-backend-3.onrender.com](https://order-execution-backend-3.onrender.com)

## Demo Video

🎥 **System Walkthrough & Live Demo**  
https://www.youtube.com/watch?v=-3IIsREzqxg

## Order Type Choice: Market Order

I selected Market Orders because Raydium and Meteora AMMs naturally support immediate swaps at the best available pool price. Market orders demonstrate routing, execution, queue handling, and WebSocket streaming without additional price monitoring logic. So now we can focus on the core logic of the engine rather than price monitoring.

Limit and sniper orders can be implemented later by adding price watchers (limit) or pool-creation listeners (sniper).

## Tech Stack

- **Fastify**: High-performance web framework for Node.js
- **BullMQ**: Queue system for decoupling submission from execution
- **Prisma**: Database ORM for Postgres
- **Redis**: In-memory data store for BullMQ
- **TypeScript**: Typed JavaScript for better code quality
- **Docker**: Containerization for consistent development environments
- **Docker Compose**: running multiple containers (Redis, Postgres, Node.js)

## Order Execution Pipeline

![Order Execution Pipeline](./flow-diagram/DEX-Order-Execution-Pipeline.png)



## How to Run

### Prerequisites

- Node.js v20+
- Docker & Docker Compose

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start Infrastructure (Redis & Postgres):
   ```bash
   docker compose up -d redis postgres
   ```
4. Push Database Schema:
   ```bash
   npx prisma db push
   ```

### Execution

#### Option A: Run Locally (Recommended for Dev)

1. Start the API Server:
   ```bash
   npm run dev
   ```
2. Start the Worker (in a separate terminal):
   ```bash
   npm run worker
   ```

#### Option B: Run with Docker

Build and start all services (API, Worker, Redis, Postgres):

```bash
docker compose up --build
```

## Checklist

### Setup

- [x] Initialize Project (package.json, tsconfig, git)
- [x] Setup Infrastructure (Docker Compose for Redis/Postgres)

### Implementation

- [x] Implement Database Schema (Prisma)
- [x] Implement Fastify Server
- [x] Implement Queue System (BullMQ)
- [x] Implement DEX Router & Mock Engine
- [x] Implement Execution Worker (Processors)
- [x] Implement WebSocket Updates

### Verification

- [x] Verification & Testing (See /test route)
- [x] Demonstration Video
- [x] Deployment

### Future Improvements

- [ ] Real DEX implementation on devnet
