import 'dotenv/config'
import { fileURLToPath } from 'url';
import { buildServer } from './api/server.js';

const start = async () => {
  try {
    if (process.env.RUN_WORKER_IN_PROCESS === 'true') {
      console.log('[Main] Running in unified mode: Starting Worker...');
      const { startWorker } = await import('./worker/index.js');
      await startWorker();
    }

    const server = await buildServer();
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running at http://localhost:3000');
  } catch (err) {
    console.error('FAILED TO START SERER:', err);
    process.exit(1);
  }
};

start();
