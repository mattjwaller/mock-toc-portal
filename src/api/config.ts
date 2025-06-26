import { Router, Request, Response } from 'express';

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

  return router;
} 