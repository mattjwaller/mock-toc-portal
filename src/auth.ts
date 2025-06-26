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
