import express from 'express';
import { PrismaClient } from '@prisma/client';
import incidentsRouter from './api/incidents';
import promClient from 'prom-client';
import { authMiddleware } from './auth';

const app = express();
const prisma = new PrismaClient();

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
app.use(authMiddleware);
app.use(express.static('public'));
app.use('/api/incidents', incidentsRouter(prisma));

app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
