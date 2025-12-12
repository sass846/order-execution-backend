import { Worker } from 'bullmq';
import { executionProcessor } from './processors.js';
import { Redis } from 'ioredis';

const connection = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
});

console.log(`[Worker] Starting order execution worker...`);

const worker = new Worker('order-execution', executionProcessor, {
    connection,
    concurrency: 5
});

worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed!`);
});

worker.on('failed', (job) => {
    console.log(`[Worker] Job ${job?.id} failed!`);
});