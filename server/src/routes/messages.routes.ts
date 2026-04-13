import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from '../middleware/auth';
import * as messagesService from '../services/messages.service';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get(
  '/conversations',
  requireAuth,
  asyncHandler(async (req, res) => {
    const list = await messagesService.listConversations((req as AuthedRequest).userId);
    res.json({ conversations: list });
  })
);

router.post(
  '/conversations/direct',
  requireAuth,
  asyncHandler(async (req, res) => {
    const schema = z.object({ otherUserId: z.string().min(10) });
    const { otherUserId } = schema.parse(req.body);
    const conv = await messagesService.getOrCreateDirectConversation(
      (req as AuthedRequest).userId,
      otherUserId
    );
    res.status(201).json(conv);
  })
);

router.get(
  '/conversations/:id/messages',
  requireAuth,
  asyncHandler(async (req, res) => {
    const cursor = req.query.cursor as string | undefined;
    const take = req.query.take ? Number(req.query.take) : 50;
    const messages = await messagesService.getMessages(
      req.params.id,
      (req as AuthedRequest).userId,
      cursor,
      take
    );
    res.json({ messages });
  })
);

router.post(
  '/conversations/:id/messages',
  requireAuth,
  asyncHandler(async (req, res) => {
    const schema = z.object({ body: z.string().min(1).max(8000) });
    const { body } = schema.parse(req.body);
    const msg = await messagesService.sendMessage(req.params.id, (req as AuthedRequest).userId, body);
    res.status(201).json(msg);
  })
);

export default router;
