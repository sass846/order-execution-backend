import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { z } from 'zod';
import { orderQueue } from '../worker/queue.js';
import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
    logger: true,
})

const prisma = new PrismaClient();

const OrderSchema = z.object({
    inputToken: z.string(),
    outputToken: z.string(),
    amount: z.number().positive(),
});

const start = async () => {
    try {
        await fastify.register(websocket);

        fastify.get('/', async (request, reply) => {
            return { status: 'ok', service: 'Order Execution Engine' };
        });

        // Serve Test Client
        fastify.get('/test', async (req, reply) => {
            const html = fs.readFileSync(path.join(process.cwd(), 'test.html'), 'utf-8');
            reply.type('text/html').send(html);
        });

        // WebSocket Endpoint
        fastify.get('/ws', { websocket: true }, (connection: any, req) => {
            console.log('Client connected to WebSocket');

            const socket = connection.socket || connection;

            const redisSub = new Redis({
                host: process.env.REDIS_HOST || '127.0.0.1',
                port: Number(process.env.REDIS_PORT) || 6379,
                maxRetriesPerRequest: null,
            });

            socket.on('message', async (message: any) => {
                try {
                    const data = JSON.parse(message.toString());

                    if (data.type === 'subscribe' && data.orderId) {
                        console.log(`[WS] Client subscribing to order: ${data.orderId}`);
                        const channel = `order: ${data.orderId}`;

                        await redisSub.subscribe(channel);
                        redisSub.removeAllListeners('message');

                        redisSub.on('message', (chan, msg) => {
                            if (chan === channel) {
                                if (socket.readyState === 1) {
                                    socket.send(msg);
                                }
                            }
                        });
                    }
                } catch (e) {
                    console.error('[WS] Error processing message:', e);
                }
            });

            socket.on('close', () => {
                console.log('[WS] Client disconnected');
                redisSub.disconnect();
            });
        });

        fastify.post('/api/orders/execute', async (request, reply) => {
            const result = OrderSchema.safeParse(request.body);

            if (!result.success) {
                return reply.status(400).send({ error: 'Invalid input', details: result.error });
            }

            const { inputToken, outputToken, amount } = result.data;

            // Create Order in DB first to get the UUID
            const order = await prisma.order.create({
                data: {
                    inputToken,
                    outputToken,
                    amount,
                    status: 'PENDING'
                }
            });

            // Add job to queue with the UUID
            await orderQueue.add('execute-order', {
                orderId: order.id,
                inputToken,
                outputToken,
                amount,
            });

            // Return the UUID
            return { orderId: order.id, status: 'PENDING' };
        });

        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server running at http://localhost:3000');
    } catch (err) {
        console.error('FAILED TO START SERER:', err);
        process.exit(1);
    }
};

start();