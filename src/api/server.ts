import 'dotenv/config'
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { z } from 'zod';
import { orderQueue } from '../worker/queue.js';
import { redisSubscriber } from '../redis.js';
import { prisma } from '../prisma.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
    logger: true,
})

const OrderSchema = z.object({
    inputToken: z.string(),
    outputToken: z.string(),
    amount: z.number().positive(),
});

const subscribers = new Map<string, Set<any>>()

redisSubscriber.on('message', (channel, message) => {
    const orderId = channel.replace('order:', '')
    const sockets = subscribers.get(orderId)
    if (!sockets) return

    for (const socket of sockets) {
        if (socket.readyState === 1) {
            socket.send(message)
        }
    }
})

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
        fastify.get('/ws', { websocket: true }, (connection: any, req: any) => {
            console.log('Client connected to WebSocket');

            const socket = connection.socket ?? connection;
            const subs = new Set<string>();

            socket.on('message', async (message: any) => {
                try {
                    const data = JSON.parse(message.toString());

                    if (data.type === 'subscribe' && data.orderId) {
                        console.log(`[WS] Client subscribing to order: ${data.orderId}`);
                        const orderId = data.orderId;
                        const channel = `order:${orderId}`;

                        if (!subscribers.has(orderId)) {
                            subscribers.set(orderId, new Set())
                            await redisSubscriber.subscribe(channel)
                        }

                        subscribers.get(orderId)!.add(socket)
                        subs.add(orderId)

                        // Send current status immediately
                        const order = await prisma.order.findUnique({ where: { id: orderId } });
                        if (order) {
                            socket.send(JSON.stringify({
                                orderId: order.id,
                                status: order.status,
                                txHash: order.txHash,
                                executedPrice: order.executedPrice,
                                dex: order.dex
                            }));
                        }
                    }
                } catch (e) {
                    console.error('[WS] Error processing message:', e);
                }
            });

            socket.on('close', () => {
                console.log('[WS] Client disconnected');
                for (const orderId of subs) {
                    const room = subscribers.get(orderId)
                    if (!room) continue
                    room.delete(socket)
                    if (room.size === 0) {
                        subscribers.delete(orderId)
                        redisSubscriber.unsubscribe(`order:${orderId}`)
                    }
                }
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
                    status: 'pending'
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
            return { orderId: order.id, status: 'pending' };
        });

        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server running at http://localhost:3000');
    } catch (err) {
        console.error('FAILED TO START SERER:', err);
        process.exit(1);
    }
};

start();