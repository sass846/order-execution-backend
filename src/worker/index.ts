import 'dotenv/config'

import { Worker } from 'bullmq';
import { executionProcessor } from './processors.js';
import { redisConnection } from '../redis.js';

console.log(`[Worker] Starting order execution worker...`);

const worker = new Worker(
    'order-execution', executionProcessor,
    {
        connection: redisConnection,
        concurrency: 5
    }
);

worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed!`);
});

worker.on('failed', (job) => {
    console.log(`[Worker] Job ${job?.id} failed!`);
});