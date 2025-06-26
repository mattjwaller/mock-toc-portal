import { PrismaClient, Incident } from '@prisma/client';
import { incidentCreateSchema, incidentUpdateSchema, commentSchema, bulkActionSchema } from '../api/validators/incident';

export class IncidentService {
  constructor(private prisma: PrismaClient) {}

  async list(params: {
    limit: number;
    offset: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    status?: string;
    priority?: string;
    severityLevel?: string;
    customerId?: string;
    siteId?: string;
    tags?: string[];
    search?: string;
  }): Promise<Incident[]> {
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.priority) where.priority = params.priority;
    if (params.severityLevel) where.severityLevel = params.severityLevel;
    if (params.customerId) where.customerId = params.customerId;
    if (params.siteId) where.siteId = params.siteId;
    if (params.tags && params.tags.length) {
      where.tags = { hasSome: params.tags };
    }
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { rootCause: { contains: params.search, mode: 'insensitive' } },
        { actionTaken: { contains: params.search, mode: 'insensitive' } },
        { timeline: { some: { payload: { path: ['text'], string_contains: params.search, mode: 'insensitive' } } } },
      ];
    }
    return this.prisma.incident.findMany({
      skip: params.offset,
      take: params.limit,
      where,
      orderBy: { [params.sortBy]: params.sortOrder },
      include: { timeline: true, chargers: true },
    });
  }

  async create(data: unknown, authorId?: string) {
    const parsed = incidentCreateSchema.parse(data);
    if (parsed.customerId) {
      await this.prisma.customer.findUniqueOrThrow({ where: { id: parsed.customerId } });
    }
    if (parsed.siteId) {
      await this.prisma.site.findUniqueOrThrow({ where: { id: parsed.siteId } });
    }
    const chargers = parsed.chargerIds ? await this.prisma.charger.findMany({ where: { id: { in: parsed.chargerIds } } }) : [];
    if (parsed.chargerIds && chargers.length !== parsed.chargerIds.length) {
      throw new Error('Invalid charger reference');
    }
    const incident = await this.prisma.incident.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        severityLevel: parsed.severityLevel,
        faultReported: parsed.faultReported,
        rootCause: parsed.rootCause,
        actionTaken: parsed.actionTaken,
        inScope: parsed.inScope,
        priority: parsed.priority ?? undefined,
        source: parsed.source,
        customerId: parsed.customerId,
        siteId: parsed.siteId,
        tags: parsed.tags ?? [],
        chargers: { connect: parsed.chargerIds?.map(id => ({ id })) || [] },
      },
    });
    await this.prisma.timelineEvent.create({
      data: {
        incidentId: incident.id,
        authorId,
        type: 'comment',
        payload: { text: 'Incident created' },
      },
    });
    return incident;
  }

  async update(id: string, data: unknown) {
    const parsed = incidentUpdateSchema.parse(data);
    if (parsed.customerId) {
      await this.prisma.customer.findUniqueOrThrow({ where: { id: parsed.customerId } });
    }
    if (parsed.siteId) {
      await this.prisma.site.findUniqueOrThrow({ where: { id: parsed.siteId } });
    }
    if (parsed.chargerIds) {
      const chargers = await this.prisma.charger.findMany({ where: { id: { in: parsed.chargerIds } } });
      if (chargers.length !== parsed.chargerIds.length) throw new Error('Invalid charger reference');
    }
    const { chargerIds, ...rest } = parsed;
    const incident = await this.prisma.incident.update({
      where: { id },
      data: {
        ...rest,
        chargers: chargerIds ? { set: chargerIds.map(i => ({ id: i })) } : undefined,
      },
    });
    if (parsed.status) {
      await this.prisma.timelineEvent.create({
        data: {
          incidentId: id,
          type: 'status_change',
          payload: { status: parsed.status },
        },
      });
    }
    return incident;
  }

  async addComment(id: string, authorId: string, data: unknown) {
    const parsed = commentSchema.parse(data);
    return this.prisma.timelineEvent.create({
      data: {
        incidentId: id,
        authorId,
        type: 'comment',
        payload: { text: parsed.text },
      },
    });
  }

  async bulkAction(data: unknown) {
    const parsed = bulkActionSchema.parse(data);
    if (parsed.action === 'assign' && parsed.assignedToId) {
      return this.prisma.incident.updateMany({
        where: { id: { in: parsed.ids } },
        data: { assignedToId: parsed.assignedToId },
      });
    }
    if (parsed.action === 'tag' && parsed.tags) {
      const incidents = await Promise.all(parsed.ids.map(id =>
        this.prisma.incident.findUniqueOrThrow({ where: { id } })));
      await Promise.all(incidents.map(inc =>
        this.prisma.incident.update({
          where: { id: inc.id },
          data: { tags: Array.from(new Set([...inc.tags as string[], ...parsed.tags!])) },
        })));
      return { count: parsed.ids.length };
    }
    if (parsed.action === 'close') {
      return this.prisma.incident.updateMany({
        where: { id: { in: parsed.ids } },
        data: { status: 'RESOLVED' },
      });
    }
    throw new Error('Invalid bulk action');
  }
}
