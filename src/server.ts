import express from 'express';
import { PrismaClient } from '@prisma/client';
import incidentsRouter from './api/incidents.js';
import webhooksRouter from './api/webhooks.js';
import supportingRouter from './api/supporting.js';
import configRouter from './api/config.js';
import promClient from 'prom-client';
import { authMiddleware } from './auth.js';

const app = express();
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Unhandled error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const log = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
    };
    console.log(JSON.stringify(log));
  });
  next();
});

app.use(express.json());
app.use(express.static('public'));

// Public endpoints (no auth required)
app.use('/api', configRouter());

// Webhook endpoints (no auth required)
app.use('/webhooks', webhooksRouter(prisma));

// Protected API endpoints
app.use('/api', authMiddleware);
app.use('/api/incidents', incidentsRouter(prisma));
app.use('/api', supportingRouter(prisma));

// Simple health check that doesn't require database
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/healthz', async (req, res) => {
  try {
    // Test database connection for health check
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

const port = parseInt(process.env.PORT || '8080', 10);

// Start server with database connection check
async function startServer() {
  console.log('🚀 Starting TOC Portal server...');
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Port: ${port}`);
  console.log(`📊 Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
  
  // Test database connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.error('❌ Failed to connect to database. Server will start but may not function properly.');
  }
  
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`📊 Health check available at http://localhost:${port}/health`);
    console.log(`📈 Metrics available at http://localhost:${port}/metrics`);
    console.log(`🔍 Database health check available at http://localhost:${port}/healthz`);
  });

  // Handle server errors
  server.on('error', (error: NodeJS.ErrnoException) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use`);
    }
    process.exit(1);
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
