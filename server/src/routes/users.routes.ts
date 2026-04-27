import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from '../middleware/auth';
import * as authService from '../services/auth.service';
import * as usersService from '../services/users.service';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await authService.getUserById((req as AuthedRequest).userId);
    res.json(user);
  })
);

router.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      displayName: z.string().optional(),
      bio: z.string().optional(),
      avatarUrl: z.union([z.string().url(), z.literal('')]).optional(),
      username: z.string().min(2).max(32).optional(),
    });
    const body = schema.parse(req.body);
    const user = await usersService.updateMe((req as AuthedRequest).userId, {
      ...body,
      avatarUrl: body.avatarUrl === '' ? undefined : body.avatarUrl,
    });
    res.json(user);
  })
);

router.delete(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    await authService.deleteAccount((req as AuthedRequest).userId);
    res.status(204).end();
  })
);

router.get(
  '/me/settings',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await authService.getUserById((req as AuthedRequest).userId);
    res.json(user.settings);
  })
);

router.patch(
  '/me/settings',
  requireAuth,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      pushNotifications: z.boolean().optional(),
      emailNotifications: z.boolean().optional(),
      darkMode: z.boolean().optional(),
      locationServices: z.boolean().optional(),
      privateProfile: z.boolean().optional(),
      allowFriendRequests: z.boolean().optional(),
      allowDirectMessages: z.boolean().optional(),
      showLocationOnProfile: z.boolean().optional(),
    });
    const body = schema.parse(req.body);
    const settings = await usersService.updateSettings((req as AuthedRequest).userId, body);
    res.json(settings);
  })
);

router.delete(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await usersService.deleteAccount((req as AuthedRequest).userId);
    res.json(result);
  })
);

router.get(
  '/search',
  requireAuth,
  asyncHandler(async (req, res) => {
    const q = z.string().parse(req.query.q ?? '');
    const list = await usersService.searchUsers(q, (req as AuthedRequest).userId);
    res.json(list);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = z.string().min(1).parse(req.params.id);
    let viewerId: string | undefined;
    try {
      const { verifyAccessToken } = await import('../utils/jwt');
      const tok = req.headers.authorization?.slice(7);
      if (tok) viewerId = verifyAccessToken(tok).sub;
    } catch {
      viewerId = undefined;
    }
    const profile = await usersService.getPublicProfile(id, viewerId);
    res.json(profile);
  })
);

export default router;
