import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { z } from 'zod';
import { orderQueue } from '../worker/queue.js';

const fastify = Fastify({
    logger: true,
})

fastify.register(websocket);

fastify.get('/', async (request, reply) => {
    return { status: 'ok', service: 'Order Execution Engine' };
});

const OrderSchema = z.object({
    inputToken: z.string(),
    outputToken: z.string(),
    amount: z.number().positive(),
});

fastify.post('/api/orders/execute', async (request, reply) => {
    const result = OrderSchema.safeParse(request.body);

    if (!result.success) {
        return reply.status(400).send({ error: 'Invalid input', details: result.error });
    }

    // TODO: Add strict queue logic here
    const { inputToken, outputToken, amount } = result.data;

    const job = await orderQueue.add('execute-order', {
        inputToken,
        outputToken,
        amount,
    });

    return { orderId: job.id, status: 'PENDING' };
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server running at http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();