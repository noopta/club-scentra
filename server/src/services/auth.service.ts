import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { HttpError } from '../middleware/errorHandler';

const SALT_ROUNDS = 12;

function validatePasswordRules(password: string): void {
  if (password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) throw new HttpError(400, 'Password must contain an uppercase letter');
  if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
    throw new HttpError(400, 'Password must contain a number or symbol');
  }
}

export async function register(input: {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}) {
  validatePasswordRules(input.password);
  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existing) {
    throw new HttpError(409, 'Username or email already in use');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      displayName: input.displayName ?? username,
      settings: { create: {} },
    },
  });

  return tokensForUser(user.id);
}

export async function login(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) {
    throw new HttpError(401, 'Invalid email or password');
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'Invalid email or password');
  return tokensForUser(user.id);
}

export async function loginWithUsernameOrEmail(identifier: string, password: string) {
  const q = identifier.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: q }, { username: q }] },
  });
  if (!user?.passwordHash) {
    throw new HttpError(401, 'Invalid credentials');
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'Invalid credentials');
  return tokensForUser(user.id);
}

export async function googleAuth(idToken: string) {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new HttpError(503, 'Google Sign-In is not configured (set GOOGLE_CLIENT_ID)');
  }
  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new HttpError(401, 'Invalid Google token');
  }
  if (!payload?.email) {
    throw new HttpError(400, 'Google account has no email');
  }

  const email = payload.email.toLowerCase();
  const googleId = payload.sub;
  const name = payload.name ?? email.split('@')[0];

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
  });

  if (!user) {
    const baseUsername = email.split('@')[0].replace(/[^a-z0-9_]/gi, '').slice(0, 20) || 'user';
    let username = baseUsername;
    let n = 0;
    while (await prisma.user.findUnique({ where: { username } })) {
      n += 1;
      username = `${baseUsername}${n}`;
    }
    user = await prisma.user.create({
      data: {
        username,
        email,
        googleId,
        displayName: name,
        avatarUrl: payload.picture,
        settings: { create: {} },
      },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId, avatarUrl: user.avatarUrl ?? payload.picture },
    });
  }

  return tokensForUser(user.id);
}

export async function refresh(refreshToken: string) {
  const { verifyRefreshToken } = await import('../utils/jwt');
  let sub: string;
  try {
    const payload = verifyRefreshToken(refreshToken);
    sub = payload.sub;
  } catch {
    throw new HttpError(401, 'Invalid refresh token');
  }
  const user = await prisma.user.findUnique({ where: { id: sub } });
  if (!user) throw new HttpError(401, 'User not found');
  return tokensForUser(user.id);
}

async function tokensForUser(userId: string) {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { settings: true },
  });
  if (!user) throw new HttpError(404, 'User not found');
  return {
    accessToken,
    refreshToken,
    expiresIn: env.JWT_ACCESS_EXPIRES,
    user: serializeUser(user),
  };
}

function serializeUser(
  user: {
    id: string;
    username: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    createdAt: Date;
    settings: {
      pushNotifications: boolean;
      emailNotifications: boolean;
      darkMode: boolean;
      locationServices: boolean;
    } | null;
  }
) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),
    settings: user.settings ?? {
      pushNotifications: true,
      emailNotifications: false,
      darkMode: false,
      locationServices: true,
    },
  };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { settings: true },
  });
  if (!user) throw new HttpError(404, 'User not found');
  return serializeUser(user);
}
