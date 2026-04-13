import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type AccessPayload = { sub: string; type: 'access' };
export type RefreshPayload = { sub: string; type: 'refresh' };

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'access' } satisfies AccessPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(userId: string): string {
  const secret = env.JWT_REFRESH_SECRET ?? env.JWT_ACCESS_SECRET;
  return jwt.sign({ sub: userId, type: 'refresh' } satisfies RefreshPayload, secret, {
    expiresIn: env.JWT_REFRESH_EXPIRES as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
  if (decoded.type !== 'access') throw new Error('Invalid token type');
  return decoded;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  const secret = env.JWT_REFRESH_SECRET ?? env.JWT_ACCESS_SECRET;
  const decoded = jwt.verify(token, secret) as RefreshPayload;
  if (decoded.type !== 'refresh') throw new Error('Invalid token type');
  return decoded;
}
