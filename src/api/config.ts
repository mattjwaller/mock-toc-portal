import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export default function configRouter() {
  const router = Router();

  // Serve public configuration to frontend
  router.get('/config', (req: Request, res: Response) => {
    res.json({
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      API_BASE_URL: process.env.GOTRUE_SITE_URL || req.get('origin'),
      APP_NAME: 'TOC Portal',
      VERSION: '1.0.0'
    });
  });

  // Debug endpoint to test authentication
  router.get('/debug/auth', (req: Request, res: Response) => {
    const header = req.header('Authorization');
    const token = header?.replace('Bearer ', '');
    
    const debugInfo: any = {
      hasHeader: !!header,
      hasToken: !!token,
      tokenLength: token?.length || 0,
      hasJwtSecret: !!process.env.SUPABASE_JWT_SECRET,
      jwtSecretLength: process.env.SUPABASE_JWT_SECRET?.length || 0,
      supabaseUrl: !!process.env.SUPABASE_URL,
      supabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
    };

    if (token && process.env.SUPABASE_JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET) as any;
        debugInfo.decoded = {
          sub: decoded.sub,
          email: decoded.email,
          role: decoded.user_metadata?.role || 'none',
          exp: decoded.exp,
          isExpired: decoded.exp ? Date.now() / 1000 > decoded.exp : false
        };
      } catch (error) {
        debugInfo.jwtError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    res.json(debugInfo);
  });

  // Database test endpoint
  router.get('/debug/db', async (req: Request, res: Response) => {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const debugInfo: any = {
        hasPrisma: true,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      };

      try {
        // Test database connection
        await prisma.$connect();
        debugInfo.connection = 'success';
        
        // Test if tables exist
        try {
          const incidentCount = await prisma.incident.count();
          debugInfo.incidentTable = 'exists';
          debugInfo.incidentCount = incidentCount;
        } catch (error) {
          debugInfo.incidentTable = 'missing';
          debugInfo.incidentError = error instanceof Error ? error.message : 'Unknown error';
        }

        try {
          const customerCount = await prisma.customer.count();
          debugInfo.customerTable = 'exists';
          debugInfo.customerCount = customerCount;
        } catch (error) {
          debugInfo.customerTable = 'missing';
          debugInfo.customerError = error instanceof Error ? error.message : 'Unknown error';
        }

        await prisma.$disconnect();
      } catch (error) {
        debugInfo.connection = 'failed';
        debugInfo.connectionError = error instanceof Error ? error.message : 'Unknown error';
      }

      res.json(debugInfo);
    } catch (error) {
      res.json({
        hasPrisma: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return router;
} 