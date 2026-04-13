import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, type AuthedRequest } from '../middleware/auth';
import * as eventsService from '../services/events.service';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get(
  '/meets',
  requireAuth,
  asyncHandler(async (req, res) => {
    const section = z.enum(['hosting', 'going', 'saved', 'past']).parse(req.query.section);
    const q = req.query.q as string | undefined;
    const location = req.query.location as string | undefined;
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;

    const list = await eventsService.getMeets((req as AuthedRequest).userId, section, {
      q,
      location,
      dateFrom,
      dateTo,
    });
    res.json({ events: list });
  })
);

export default router;
