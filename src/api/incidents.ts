import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { IncidentService } from '../services/incidents';

export default function incidentsRouter(prisma: PrismaClient) {
  const router = Router();
  const service = new IncidentService(prisma);

  router.get('/', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(String(req.query.limit || '50'), 10);
      const offset = parseInt(String(req.query.offset || '0'), 10);
      const sortBy = String(req.query.sortBy || 'createdAt');
      const sortOrder = String(req.query.sortOrder || 'desc') as 'asc' | 'desc';
      const incidents = await service.list({
        limit,
        offset,
        sortBy,
        sortOrder,
        status: req.query.status as string | undefined,
        priority: req.query.priority as string | undefined,
        severityLevel: req.query.severityLevel as string | undefined,
        customerId: req.query.customerId as string | undefined,
        siteId: req.query.siteId as string | undefined,
        tags: typeof req.query.tags === 'string' ? String(req.query.tags).split(',') : undefined,
        search: req.query.search as string | undefined,
      });
      res.json(incidents);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/', async (req: Request, res: Response) => {
    try {
      const incident = await service.create(req.body, req.user?.id);
      res.status(201).json(incident);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/:id', async (req: Request, res: Response) => {
    const incident = await prisma.incident.findUnique({
      where: { id: req.params.id },
      include: { timeline: true, chargers: true },
    });
    if (!incident) return res.status(404).json({ error: 'Not found' });
    res.json(incident);
  });

  router.patch('/:id', async (req: Request, res: Response) => {
    try {
      const incident = await service.update(req.params.id, req.body);
      res.json(incident);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/:id/comment', async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id as string;
      const event = await service.addComment(req.params.id, userId, req.body);
      res.status(201).json(event);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/bulk', async (req: Request, res: Response) => {
    try {
      const result = await service.bulkAction(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}
