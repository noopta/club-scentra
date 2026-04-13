import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from '../middleware/auth';
import * as friendsService from '../services/friends.service';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const friends = await friendsService.listFriends((req as AuthedRequest).userId);
    res.json({ friends });
  })
);

router.get(
  '/requests/incoming',
  requireAuth,
  asyncHandler(async (req, res) => {
    const rows = await friendsService.listPendingIncoming((req as AuthedRequest).userId);
    res.json({
      requests: rows.map((r) => ({
        id: r.id,
        requester: r.requester,
      })),
    });
  })
);

router.post(
  '/requests',
  requireAuth,
  asyncHandler(async (req, res) => {
    const schema = z.object({ addresseeId: z.string().min(10) });
    const { addresseeId } = schema.parse(req.body);
    const f = await friendsService.sendFriendRequest((req as AuthedRequest).userId, addresseeId);
    res.status(201).json(f);
  })
);

router.post(
  '/requests/:id/accept',
  requireAuth,
  asyncHandler(async (req, res) => {
    const f = await friendsService.acceptFriendRequest((req as AuthedRequest).userId, req.params.id);
    res.json(f);
  })
);

router.delete(
  '/requests/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await friendsService.declineFriendRequest((req as AuthedRequest).userId, req.params.id);
    res.json({ ok: true });
  })
);

router.delete(
  '/:userId',
  requireAuth,
  asyncHandler(async (req, res) => {
    await friendsService.unfriend((req as AuthedRequest).userId, req.params.userId);
    res.json({ ok: true });
  })
);

router.post(
  '/block',
  requireAuth,
  asyncHandler(async (req, res) => {
    const schema = z.object({ userId: z.string().min(10) });
    const { userId } = schema.parse(req.body);
    const f = await friendsService.blockUser((req as AuthedRequest).userId, userId);
    res.status(201).json(f);
  })
);

router.delete(
  '/block/:userId',
  requireAuth,
  asyncHandler(async (req, res) => {
    await friendsService.unblockUser((req as AuthedRequest).userId, req.params.userId);
    res.json({ ok: true });
  })
);

export default router;
