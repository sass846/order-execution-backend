import 'dotenv/config'
import { fileURLToPath } from 'url';
import { buildServer } from './api/server.js';

const start = async () => {
  try {
    const server = await buildServer();
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running at http://localhost:3000');
  } catch (err) {
    console.error('FAILED TO START SERER:', err);
    process.exit(1);
  }
};

start();
