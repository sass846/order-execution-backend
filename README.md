# Order Execution Engine

An asynchronous order execution backend that simulates DEX-style trade execution with smart routing, transactional settlements, and real-time order status updates.

The system is designed to handle concurrent order submissions efficiently by decoupling request ingestion from execution.

---

## Overview

This project implements an order execution pipeline where incoming orders are:
- validated and persisted
- queued for asynchronous execution
- routed across simulated liquidity sources
- executed by background workers
- streamed back to clients in real time

The design focuses on correctness under concurrency, clear state transitions, and observable execution flow rather than on-chain integration or ultra-low latency.

---

## Order Type Choice

### Market Orders

The engine currently supports **Market Orders**, which execute immediately at the best available price.

**Why Market Orders?**
Market orders are the simplest order type and allow the system to clearly demonstrate routing, concurrency, state transitions, and real-time updates without additional trigger logic.

**Extending to other order types**
- **Limit Orders** can be supported by persisting price conditions and delaying execution until the condition is met.
- **Sniper Orders** can be implemented by triggering execution based on external events (e.g., token launch or liquidity migration).

The existing queue-based architecture supports these extensions without structural changes.

We also mocked the implementation of the liquidity pools to focus on system design and execution flow.

---

## Execution Flow

1. Client submits an order via `POST /api/orders/execute`
2. API validates input and stores the order with status `pending`
3. Order ID is enqueued in a Redis-backed queue
4. A worker processes the order asynchronously:
   - routing
   - transaction building
   - execution
5. Order state transitions are persisted
6. Status updates are published via Redis
7. Clients receive updates over WebSockets

---

## Architecture

![Order Execution Pipeline](./flow-diagram/DEX-Order-Execution-Pipeline.png)

The system follows an event-driven, producer–consumer architecture.

### Components

- **API Server (Fastify)**
  - Accepts and validates orders
  - Persists initial order state
  - Enqueues orders for execution
  - Hosts WebSocket connections

- **Queue (BullMQ + Redis)**
  - Buffers incoming orders
  - Enables concurrent execution
  - Retries failed jobs with backoff

- **Execution Worker**
  - Pulls orders from the queue
  - Applies DEX routing logic
  - Updates order state transactionally

- **DEX Router (Mock)**
  - Fetches quotes from Raydium and Meteora mocks
  - Compares prices and selects the best venue
  - Simulates execution with realistic delays

- **Real-time Layer**
  - Redis Pub/Sub for event propagation
  - WebSockets for client updates

- **Persistence Layer**
  - PostgreSQL for order history
  - Prisma ORM for transactional updates

---

## Key Design Decisions

- **Asynchronous execution**
  Keeps API latency low and isolates heavy processing.

- **Persistent state transitions**
  Order status is always stored in the database to ensure consistency.

- **Push-based updates**
  WebSockets eliminate polling and provide immediate feedback.

- **Mocked DEX layer**
  Focuses the project on backend architecture rather than blockchain integration.

---

## Order Lifecycle

Orders transition through the following states:

`pending` → `routing` → `building` → `submitted` → `confirmed`

If execution fails after retries:

`failed`

All state transitions are persisted in the database.

---

## API Endpoints

### Health Check
Check the status of the service.

- **Endpoint:** `/`
- **Method:** `GET`

**Response:**
```json
{
  "status": "ok",
  "service": "Order Execution Engine"
}
```

### Submit Order (Market Order)
Submit a new token swap order for execution.

- **Endpoint:** `/api/orders/execute`
- **Method:** `POST`

**Request Body:**
```json
{
  "inputToken": "SOL",
  "outputToken": "USDC",
  "amount": 10
}
```

**Response:**
```json
{
  "orderId": "uuid",
  "status": "pending"
}
```

---

## Real-time Updates (WebSocket)

After submitting an order via HTTP, clients connect to the WebSocket endpoint and subscribe using the returned orderId.

This ensures:
- HTTP endpoints are stateless
- long-lived WebSocket connections for updates
- scales better under concurrent clients

### Subscribe to an order

- **Endpoint:** `/ws`

Send the following message after connecting:

```json
{
  "type": "subscribe",
  "orderId": "uuid"
}
```

### Example updates

Clients receive updates as the order progresses:
```json
{ "orderId": "uuid", "status": "pending" }
{ "orderId": "uuid", "status": "routing" }
{ "orderId": "uuid", "status": "building" }
{ "orderId": "uuid", "status": "submitted" }
```

**Confirmation:**
```json
{
  "orderId": "uuid",
  "status": "confirmed",
  "txHash": "tx_abc123",
  "executedPrice": 151.2
}
```

**Failure**
```json
{
  "orderId": "uuid",
  "status": "failed",
  "error": "execution error message"
}
```

---

## DEX Routing

The routing engine simulates DEX aggregation by:

1. Querying multiple liquidity sources in parallel.
2. Comparing returned prices.
3. Selecting the optimal execution path.
4. Logging routing decisions for transparency.

**Mock DEXes used:**
- Raydium (simulated)
- Meteora (simulated)

Routing and execution are abstracted to allow future integration with real on-chain sources.

---

## Transaction Settlement

- Execution is simulated with 2-3 second delays.
- Slippage protection is simulated as part of mock execution
- Final execution price and transaction hash are returned
- In a real implementation, minimum output constraints would be enforced at transaction construction time.

---

## Concurrency & Retries 

- Orders are processed asynchronously using BullMQ.
- Multiple workers can run in parallel.
- Each order is retried up to 3 times with exponential backoff.
- If all retries fail:
   - order is marked as `failed`
   - clients are notified via websocket
- Order state is always persisted before publishing updates.
- Database writes ensure consistency under concurrent execution.
- Real-time updates reflect the persisted state.

---

## Perormance Characteristics

- Queue-based execution prevents API blocking
- Designed to handle dozens to hundreds of orders per minute
- Worker concurrency can be increased horizontally
- WebSockets eliminate polling overhead for status updates

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Fastify (WebSocket support)
- **Queue:** BullMQ + Redis
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Real-time:** WebSockets + Redis Pub/Sub
- **Validation:** Zod
- **Testing:** Jest
- **Containerization:** Docker

---

## Running Locally

### Prerequisites
- Node.js v20+
- Docker & Docker Compose

### Installation

```bash
git clone [https://github.com/sass846/order-execution-backend.git](https://github.com/sass846/order-execution-backend.git)
cd order-execution-backend
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

### Start Infrastructure
Start Redis and PostgreSQL using Docker:

```bash
docker compose up -d redis postgres
```

### Database Setup
Push the Prisma schema to the database:

```bash
npx prisma db push
```

### Start Services

**API Server:**
```bash
npm run dev
```

**Execution Worker:**
```bash
npm run worker
```

### Testing

```bash
npm test
```
Includes tests for:
- API input validation
- Queue job processing
- Routing logic
- WebSocket update flow

---

## Deployment

**Live deployment:** [https://order-execution-backend-3.onrender.com](https://order-execution-backend-3.onrender.com)

**System walkthrough and demo:** [https://www.youtube.com/watch?v=-3IIsREzqxg](https://www.youtube.com/watch?v=-3IIsREzqxg)

---

## Design Tradeoffs

### Asynchronous execution vs synchronous processing
Improves API responsiveness at the cost of increased system complexity.

### Transactional state vs in-memory state
Ensures correctness and recoverability under concurrency.

### Push-based updates vs polling
Reduces server load and improves client responsiveness.

### Mocked DEXes vs real-chain integration
Keeps the project focused on backend architecture rather than blockchain specifics.

---

## Possible Improvements

- Partial fills and order book simulation
- Rate limiting and backpressure
- Metrics and tracing for observability
- Multi-instance workers with distributed locking
- Integration with real on-chain liquidity sources

---

## Notes

This project was built to explore asynchronous backend design, concurrency handling, and real-time systems, rather than on-chain execution or financial modeling.
