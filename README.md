# Order Execution Engine

## Overview
This project is a high-performance, asynchronous Order Execution Engine designed for the Solana ecosystem (mocked). It features:
- Order Submission: Fastify API to submit Market Orders/
- Queue System: BullMQ (Redis) to decouple submission from execution.
- Smart Routing: Compares the prices between Raydium and Meteora (Mocked) to find the best route.
- Real-Time Updates: WebSocket updates to the client for order status.

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
- [ ] Demonstration Video

43: 
44: ## How to Run
45: 
46: ### Prerequisites
47: - Node.js v20+
48: - Docker & Docker Compose
49: 
50: ### Setup
51: 1. Install dependencies:
52:    ```bash
53:    npm install
54:    ```
55: 2. Set up environment variables:
56:    ```bash
57:    cp .env.example .env
58:    ```
59: 3. Start Infrastructure (Redis & Postgres):
60:    ```bash
61:    docker compose up -d redis postgres
62:    ```
63: 4. Push Database Schema:
64:    ```bash
65:    npx prisma db push
66:    ```
67: 
68: ### Execution
69: 
70: #### Option A: Run Locally (Recommended for Dev)
71: 
72: 1. Start the API Server:
73:    ```bash
74:    npm run dev
75:    ```
76: 2. Start the Worker (in a separate terminal):
77:    ```bash
78:    npm run worker
79:    ```
80: 
81: #### Option B: Run with Docker
82: Build and start all services (API, Worker, Redis, Postgres):
83: ```bash
84: docker compose up --build
85: ```
