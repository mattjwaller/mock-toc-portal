import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { IncidentService } from '../services/incidents.js';
import { requireViewer, requireEditor, requireAdmin } from '../auth.js';

export default function incidentsRouter(prisma: PrismaClient) {
  const router = Router();
  const service = new IncidentService(prisma);

  router.get('/', requireViewer(), async (req: Request, res: Response) => {
    try {
      const limit = parseInt(String(req.query.limit || '50'), 10);
      const offset = parseInt(String(req.query.offset || '0'), 10);
      const sortBy = String(req.query.sortBy || 'createdAt');
      const sortOrder = String(req.query.sortOrder || 'desc') as 'asc' | 'desc';
      
      // Validate sort field
      const validSortFields = [
        'createdAt', 'updatedAt', 'title', 'status', 'priority', 
        'severityLevel', 'customerId', 'siteId', 'assignedToId'
      ];
      
      if (!validSortFields.includes(sortBy)) {
        return res.status(400).json({ 
          error: `Invalid sort field: ${sortBy}`,
          validFields: validSortFields,
          receivedField: sortBy
        });
      }
      
      console.log('🔍 Fetching incidents with params:', {
        limit,
        offset,
        sortBy,
        sortOrder,
        status: req.query.status,
        priority: req.query.priority,
        severityLevel: req.query.severityLevel,
        customerId: req.query.customerId,
        siteId: req.query.siteId,
        tags: req.query.tags,
        search: req.query.search,
      });

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
      
      console.log(`✅ Found ${incidents.length} incidents`);
      res.json(incidents);
    } catch (err: any) {
      console.error('❌ Error fetching incidents:', err);
      console.error('❌ Error stack:', err.stack);
      res.status(400).json({ 
        error: err.message,
        details: err.stack,
        type: err.constructor.name
      });
    }
  });

  router.post('/', requireEditor(), async (req: Request, res: Response) => {
    try {
      const incident = await service.create(req.body, req.user?.id);
      res.status(201).json(incident);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/:id', requireViewer(), async (req: Request, res: Response) => {
    const incident = await prisma.incident.findUnique({
      where: { id: req.params.id },
      include: { timeline: true, chargers: true },
    });
    if (!incident) return res.status(404).json({ error: 'Not found' });
    res.json(incident);
  });

  router.patch('/:id', requireEditor(), async (req: Request, res: Response) => {
    try {
      const incident = await service.update(req.params.id, req.body);
      res.json(incident);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/:id/comment', requireEditor(), async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id as string;
      const event = await service.addComment(req.params.id, userId, req.body);
      res.status(201).json(event);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/bulk', requireEditor(), async (req: Request, res: Response) => {
    try {
      const result = await service.bulkAction(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}
