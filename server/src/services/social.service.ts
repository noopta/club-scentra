import { prisma } from '../lib/prisma';
import { HttpError } from '../middleware/errorHandler';

export async function follow(followerId: string, followingId: string) {
  if (followerId === followingId) throw new HttpError(400, 'Cannot follow yourself');
  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
    create: { followerId, followingId },
    update: {},
  });
  return { ok: true };
}

export async function unfollow(followerId: string, followingId: string) {
  await prisma.follow.deleteMany({ where: { followerId, followingId } });
  return { ok: true };
}

export async function createPost(userId: string, imageUrl: string, caption?: string) {
  return prisma.post.create({
    data: { userId, imageUrl, caption },
  });
}

export async function listPosts(userId: string) {
  return prisma.post.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createStory(userId: string, imageUrl: string, hoursValid = 24) {
  const expiresAt = new Date(Date.now() + hoursValid * 60 * 60 * 1000);
  return prisma.story.create({
    data: { userId, imageUrl, expiresAt },
  });
}

export async function listActiveStories(userId: string) {
  const now = new Date();
  return prisma.story.findMany({
    where: { userId, expiresAt: { gt: now } },
    orderBy: { createdAt: 'desc' },
  });
}
