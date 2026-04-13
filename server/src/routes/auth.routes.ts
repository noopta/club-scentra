import { Router } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(2).max(32),
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

const googleSchema = z.object({
  idToken: z.string().min(10),
});

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);
    const result = await authService.register(body);
    res.status(201).json(result);
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const result = await authService.login({
      email: body.email,
      password: body.password,
    });
    res.json(result);
  })
);

router.post(
  '/login-identifier',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      identifier: z.string().min(1),
      password: z.string().min(1),
    });
    const body = schema.parse(req.body);
    const result = await authService.loginWithUsernameOrEmail(body.identifier, body.password);
    res.json(result);
  })
);

router.post(
  '/google',
  asyncHandler(async (req, res) => {
    const body = googleSchema.parse(req.body);
    const result = await authService.googleAuth(body.idToken);
    res.json(result);
  })
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const schema = z.object({ refreshToken: z.string() });
    const body = schema.parse(req.body);
    const result = await authService.refresh(body.refreshToken);
    res.json(result);
  })
);

export default router;
