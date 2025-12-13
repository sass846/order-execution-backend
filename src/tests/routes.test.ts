import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { buildServer } from '../api/server.js';
import { prisma } from '../prisma.js';
import { orderQueue } from '../worker/queue.js';

describe('API Routes', () => {
    let app: any;

    beforeAll(async () => {
        app = await buildServer();
    });

    afterAll(async () => {
        await app.close();
    });

    it('GET / returns 200', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/'
        });
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ status: 'ok', service: 'Order Execution Engine' });
    });

    it('POST /api/orders/execute creates order', async () => {
        (prisma.order.create as jest.Mock).mockResolvedValue({
            id: 'mock-order-id',
            status: 'pending'
        });

        const payload = {
            inputToken: 'SOL',
            outputToken: 'USDC',
            amount: 1.5
        };

        const response = await app.inject({
            method: 'POST',
            url: '/api/orders/execute',
            payload
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ orderId: 'mock-order-id', status: 'pending' });

        expect(prisma.order.create).toHaveBeenCalledWith({
            data: {
                ...payload,
                status: 'pending'
            }
        });

        expect(orderQueue.add).toHaveBeenCalledWith('execute-order', {
            orderId: 'mock-order-id',
            ...payload
        });
    });

    it('POST /api/orders/execute validates input', async () => {
        const payload = {
            inputToken: 'SOL',
            // Missing outputToken
            amount: 1.5
        };

        const response = await app.inject({
            method: 'POST',
            url: '/api/orders/execute',
            payload
        });

        expect(response.statusCode).toBe(400);
    });
});
