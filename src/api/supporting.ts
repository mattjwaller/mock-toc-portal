import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireViewer } from '../auth.js';

export default function supportingRouter(prisma: PrismaClient) {
  const router = Router();

  // Get all customers
  router.get('/customers', requireViewer(), async (req: Request, res: Response) => {
    try {
      const customers = await prisma.customer.findMany({
        orderBy: { name: 'asc' }
      });
      res.json(customers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get sites for a customer
  router.get('/customers/:customerId/sites', requireViewer(), async (req: Request, res: Response) => {
    try {
      const sites = await prisma.site.findMany({
        where: { customerId: req.params.customerId },
        orderBy: { name: 'asc' }
      });
      res.json(sites);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get all sites
  router.get('/sites', requireViewer(), async (req: Request, res: Response) => {
    try {
      const sites = await prisma.site.findMany({
        include: { customer: true },
        orderBy: { name: 'asc' }
      });
      res.json(sites);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get chargers for a site
  router.get('/sites/:siteId/chargers', requireViewer(), async (req: Request, res: Response) => {
    try {
      const chargers = await prisma.charger.findMany({
        where: { siteId: req.params.siteId },
        orderBy: { identifier: 'asc' }
      });
      res.json(chargers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get all chargers
  router.get('/chargers', requireViewer(), async (req: Request, res: Response) => {
    try {
      const chargers = await prisma.charger.findMany({
        include: { site: { include: { customer: true } } },
        orderBy: { identifier: 'asc' }
      });
      res.json(chargers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
} 