import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface User {
  id: string;
  role: 'viewer' | 'editor' | 'admin';
}

// Supabase JWT payload interface
interface SupabaseJWTPayload {
  aud: string;
  exp: number;
  sub: string;
  email: string;
  phone: string;
  app_metadata: {
    provider: string;
    providers: string[];
  };
  user_metadata: {
    role?: string;
  };
  role: string;
  aal: string;
  amr: Array<{ method: string; timestamp: number }>;
  session_id: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.header('Authorization');
  if (!header) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  
  const token = header.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Invalid Authorization header format' });
  }

  try {
    const secret = process.env.SUPABASE_JWT_SECRET as string;
    if (!secret) {
      console.error('SUPABASE_JWT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, secret) as SupabaseJWTPayload;
    
    // Extract user information from Supabase JWT
    const user: User = {
      id: decoded.sub,
      role: (decoded.user_metadata?.role as User['role']) || 'viewer' // Default to viewer if no role specified
    };
    
    req.user = user;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(roles: User['role'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export function requireViewer() {
  return requireRole(['viewer', 'editor', 'admin']);
}

export function requireEditor() {
  return requireRole(['editor', 'admin']);
}

export function requireAdmin() {
  return requireRole(['admin']);
}
