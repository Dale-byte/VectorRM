import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import 'dotenv/config';
import { initDatabase } from './services/database.js';
import authRoutes from './routes/auth.js';
import riskRoutes from './routes/risks.js';
import dashboardRoutes from './routes/dashboard.js';
import metaRoutes from './routes/meta.js';

const fastify = Fastify({
  logger: true
});

const JWT_SECRET = process.env.JWT_SECRET || 'it-risk-register-secret-key-change-in-production';
const PORT = process.env.PORT || 3001;

await fastify.register(cors, {
  origin: true,
  credentials: true
});

await fastify.register(jwt, {
  secret: JWT_SECRET
});

fastify.decorate('authenticate', async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(riskRoutes, { prefix: '/api/risks' });
fastify.register(dashboardRoutes, { prefix: '/api/dashboard' });
fastify.register(metaRoutes, { prefix: '/api/meta' });

fastify.get('/api/health', async () => ({ status: 'ok' }));

const start = async () => {
  try {
    await initDatabase();
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
