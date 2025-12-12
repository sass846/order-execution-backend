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

