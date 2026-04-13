import { EventRsvpStatus } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from '../middleware/auth';
import * as eventsService from '../services/events.service';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  imageUrl: z.string().url().optional().nullable(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional().nullable(),
  addressLine: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = createEventSchema.parse(req.body);
    const event = await eventsService.createEvent((req as AuthedRequest).userId, body);
    res.status(201).json(event);
  })
);

router.get(
  '/explore',
  asyncHandler(async (req, res) => {
    const q = req.query.q as string | undefined;
    const location = req.query.location as string | undefined;
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;
    const sort = req.query.sort as 'popular' | 'nearest' | undefined;
    const lat = req.query.lat ? Number(req.query.lat) : undefined;
    const lng = req.query.lng ? Number(req.query.lng) : undefined;
    const radiusKm = req.query.radiusKm ? Number(req.query.radiusKm) : undefined;
    const skip = req.query.skip ? Number(req.query.skip) : undefined;
    const take = req.query.take ? Number(req.query.take) : undefined;

    let viewerId: string | undefined;
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      try {
        const { verifyAccessToken } = await import('../utils/jwt');
        viewerId = verifyAccessToken(auth.slice(7)).sub;
      } catch {
        viewerId = undefined;
      }
    }

    const list = await eventsService.explore({
      q,
      location,
      dateFrom,
      dateTo,
      sort,
      lat,
      lng,
      radiusKm,
      skip,
      take,
      viewerId,
    });
    res.json({ events: list });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    let viewerId: string | undefined;
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      try {
        const { verifyAccessToken } = await import('../utils/jwt');
        viewerId = verifyAccessToken(auth.slice(7)).sub;
      } catch {
        viewerId = undefined;
      }
    }
    const event = await eventsService.getEventById(id, viewerId);
    res.json(event);
  })
);

const rsvpSchema = z.object({
  status: z.nativeEnum(EventRsvpStatus),
});

router.post(
  '/:id/rsvp',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status } = rsvpSchema.parse(req.body);
    const event = await eventsService.setRsvp((req as AuthedRequest).userId, req.params.id, status);
    res.json(event);
  })
);

router.delete(
  '/:id/rsvp',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await eventsService.removeRsvp((req as AuthedRequest).userId, req.params.id);
    res.json(result);
  })
);

export default router;
