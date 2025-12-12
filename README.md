# Order Execution Engine

## Overview
This project is a high-performance, asynchronous Order Execution Engine designed for the Solana ecosystem (mocked). It features:
- Order Submission: Fastify API to submit Market Orders/
- Queue System: BullMQ (Redis) to decouple submission from execution.
- Smart Routing: Compares the prices between Raydium and Meteora (Mocked) to find the best route.
- Real-Time Updates: WebSocket updates to the client for order status.

## Order Type Choice: Market Order
**Why**: Market orders are the fundamental primitive for DEX interaction, allowing us to focus on the core "Submission -> Routing -> Execution" loop, latency optimization, and feedback mechanisms without the added complexity of state monitoring (Limit) or mempool sniffing (Sniper).

**Extensibility**: To support Limit or Sniper orders, this engine can be extended by adding a "Trigger Service" that monitors on-chain conditions (price or new pool creation) and submits execution requests to this engine's API when criteria are met.

## Tech Stack
- **Fastify**: High-performance web framework for Node.js
- **BullMQ**: Queue system for decoupling submission from execution
- **Prisma**: Database ORM for Postgres
- **Redis**: In-memory data store for BullMQ
- **TypeScript**: Typed JavaScript for better code quality
- **Docker**: Containerization for consistent development environments
- **Docker Compose**: running multiple containers (Redis, Postgres, Node.js)

## Checklist

### [x] Setup
- [x] Initialize Project (package.json, tsconfig, git)
- [x] Setup Infrastructure (Docker Compose for Redis/Postgres)

### [ ] Implementation
- [x] Implement Database Schema (Prisma)
- [x] Implement Fastify Server
- [x] Implement Queue System (BullMQ)
- [x] Implement DEX Router & Mock Engine
- [x] Implement Execution Worker (Processors)
- [x] Implement WebSocket Updates

### [x] Verification
- [x] Verification & Testing (See /test route)
- [ ] Demonstration Video

