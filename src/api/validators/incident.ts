import { z } from 'zod';
import { IncidentPriority, IncidentSource, IncidentStatus, SeverityLevel } from '@prisma/client';

export const incidentCreateSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  severityLevel: z.nativeEnum(SeverityLevel).optional(),
  faultReported: z.string().optional(),
  rootCause: z.string().optional(),
  actionTaken: z.string().optional(),
  inScope: z.boolean().optional(),
  priority: z.nativeEnum(IncidentPriority).optional(),
  source: z.nativeEnum(IncidentSource),
  customerId: z.string().uuid().optional(),
  siteId: z.string().uuid().optional(),
  chargerIds: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
});

export const incidentUpdateSchema = z.object({
  title: z.string().optional(),
  priority: z.nativeEnum(IncidentPriority).optional(),
  status: z.nativeEnum(IncidentStatus).optional(),
  assignedToId: z.string().uuid().optional(),
  severityLevel: z.nativeEnum(SeverityLevel).optional(),
  faultReported: z.string().optional(),
  rootCause: z.string().optional(),
  actionTaken: z.string().optional(),
  inScope: z.boolean().optional(),
  customerId: z.string().uuid().optional(),
  siteId: z.string().uuid().optional(),
  chargerIds: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
});

export const commentSchema = z.object({
  text: z.string(),
});

export const bulkActionSchema = z.object({
  ids: z.array(z.string().uuid()),
  action: z.enum(['assign', 'tag', 'close']),
  assignedToId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
});
