# Order Execution Engine

## Order Type Choice: Market Order
**Why**: Market orders are the fundamental primitive for DEX interaction, allowing us to focus on the core "Submission -> Routing -> Execution" loop, latency optimization, and feedback mechanisms without the added complexity of state monitoring (Limit) or mempool sniffing (Sniper).

**Extensibility**: To support Limit or Sniper orders, this engine can be extended by adding a "Trigger Service" that monitors on-chain conditions (price or new pool creation) and submits execution requests to this engine's API when criteria are met.

## Checklist

### [x] Setup
- [x] Initialize Project (package.json, tsconfig, git)
- [x] Setup Infrastructure (Docker Compose for Redis/Postgres)

### [ ] Implementation
- [ ] Implement Database Schema (Prisma)
- [ ] Implement Fastify Server & Swagger API
- [ ] Implement Queue System (BullMQ)
- [ ] Implement DEX Router & Mock Engine
- [ ] Implement WebSocket Updates

### [ ] Verification
- [ ] Verification & Testing
- [ ] Demonstration Video