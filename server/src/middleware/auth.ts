import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { HttpError } from './errorHandler';

export type AuthedRequest = Request & { userId: string };

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new HttpError(401, 'Missing or invalid Authorization header');
    }
    const token = header.slice(7);
    const payload = verifyAccessToken(token);
    (req as AuthedRequest).userId = payload.sub;
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired token'));
  }
}
