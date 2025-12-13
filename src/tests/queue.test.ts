import { describe, it, expect } from '@jest/globals';
import { orderQueue } from '../worker/queue.js';

describe('Queue Behavior', () => {
    it('should add valid job to queue', async () => {
        await orderQueue.add('test-job', { foo: 'bar' });
        expect(orderQueue.add).toHaveBeenCalledWith('test-job', { foo: 'bar' });
    });
});
