import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from '../middleware/auth';
import * as socialService from '../services/social.service';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post(
  '/follow/:userId',
  requireAuth,
  asyncHandler(async (req, res) => {
    await socialService.follow((req as AuthedRequest).userId, req.params.userId);
    res.json({ ok: true });
  })
);

router.delete(
  '/follow/:userId',
  requireAuth,
  asyncHandler(async (req, res) => {
    await socialService.unfollow((req as AuthedRequest).userId, req.params.userId);
    res.json({ ok: true });
  })
);

router.post(
  '/posts',
  requireAuth,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      imageUrl: z.string().url(),
      caption: z.string().max(2000).optional(),
    });
    const body = schema.parse(req.body);
    const post = await socialService.createPost((req as AuthedRequest).userId, body.imageUrl, body.caption);
    res.status(201).json(post);
  })
);

router.get(
  '/users/:userId/posts',
  asyncHandler(async (req, res) => {
    const posts = await socialService.listPosts(req.params.userId);
    res.json({ posts });
  })
);

router.post(
  '/stories',
  requireAuth,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      imageUrl: z.string().url(),
      hoursValid: z.number().min(1).max(168).optional(),
    });
    const body = schema.parse(req.body);
    const story = await socialService.createStory(
      (req as AuthedRequest).userId,
      body.imageUrl,
      body.hoursValid
    );
    res.status(201).json(story);
  })
);

router.get(
  '/users/:userId/stories',
  asyncHandler(async (req, res) => {
    const stories = await socialService.listActiveStories(req.params.userId);
    res.json({ stories });
  })
);

export default router;
