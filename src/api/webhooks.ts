import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { IncidentService } from '../services/incidents';
import { z } from 'zod';

const webhookSchema = z.object({
  externalId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  severityLevel: z.enum(['SEV0', 'SEV1', 'SEV1A', 'SEV2', 'SEV3']).optional(),
  faultReported: z.string().optional(),
  customerId: z.string().uuid().optional(),
  siteId: z.string().uuid().optional(),
  chargerIds: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
});

export default function webhooksRouter(prisma: PrismaClient) {
  const router = Router();
  const service = new IncidentService(prisma);

  router.post('/incidents', async (req: Request, res: Response) => {
    try {
      const payload = webhookSchema.parse(req.body);
      
      // Check for existing incident with same external ID to prevent duplicates
      const existing = await prisma.incident.findFirst({
        where: { 
          tags: { 
            array_contains: [`externalId:${payload.externalId}`] 
          } 
        }
      });

      if (existing) {
        return res.status(409).json({ 
          error: 'Incident already exists', 
          incidentId: existing.id 
        });
      }

      // Create incident with external ID in tags
      const incident = await service.create({
        ...payload,
        source: 'IMPORTED',
        tags: [...(payload.tags || []), `externalId:${payload.externalId}`],
      }, 'system');

      res.status(201).json({ 
        incidentId: incident.id,
        message: 'Incident created successfully' 
      });
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return res.status(400).json({ 
          error: 'Invalid payload', 
          details: err.errors 
        });
      }
      res.status(500).json({ error: err.message });
    }
  });

  return router;
} 