import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface User {
  id: string;
  role: 'viewer' | 'editor' | 'admin';
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
  try {
    const secret = process.env.SUPABASE_JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as User;
    req.user = decoded;
    next();
  } catch (err) {
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
