import { FriendshipStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { HttpError } from '../middleware/errorHandler';

export async function sendFriendRequest(requesterId: string, addresseeId: string) {
  if (requesterId === addresseeId) throw new HttpError(400, 'Cannot friend yourself');

  const blocked = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId, addresseeId, status: FriendshipStatus.BLOCKED },
        { requesterId: addresseeId, addresseeId: requesterId, status: FriendshipStatus.BLOCKED },
      ],
    },
  });
  if (blocked) throw new HttpError(403, 'Cannot send request');

  const alreadyFriends = await prisma.friendship.findFirst({
    where: {
      status: FriendshipStatus.ACCEPTED,
      OR: [
        { requesterId, addresseeId },
        { requesterId: addresseeId, addresseeId: requesterId },
      ],
    },
  });
  if (alreadyFriends) throw new HttpError(409, 'Already friends');

  const existing = await prisma.friendship.findUnique({
    where: { requesterId_addresseeId: { requesterId, addresseeId } },
  });
  if (existing) {
    if (existing.status === FriendshipStatus.ACCEPTED) throw new HttpError(409, 'Already friends');
    if (existing.status === FriendshipStatus.PENDING) throw new HttpError(409, 'Request already sent');
    throw new HttpError(409, 'Unable to send request');
  }

  const reverse = await prisma.friendship.findUnique({
    where: {
      requesterId_addresseeId: { requesterId: addresseeId, addresseeId: requesterId },
    },
  });
  if (reverse?.status === FriendshipStatus.PENDING) {
    return acceptFriendRequest(requesterId, reverse.id);
  }

  return prisma.friendship.create({
    data: { requesterId, addresseeId, status: FriendshipStatus.PENDING },
  });
}

export async function acceptFriendRequest(userId: string, friendshipId: string) {
  const f = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!f || f.addresseeId !== userId) throw new HttpError(404, 'Request not found');
  if (f.status !== FriendshipStatus.PENDING) throw new HttpError(400, 'Not a pending request');
  return prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: FriendshipStatus.ACCEPTED },
  });
}

export async function declineFriendRequest(userId: string, friendshipId: string) {
  const f = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!f || f.addresseeId !== userId) throw new HttpError(404, 'Request not found');
  await prisma.friendship.delete({ where: { id: friendshipId } });
  return { ok: true };
}

export async function unfriend(userId: string, otherUserId: string) {
  await prisma.friendship.deleteMany({
    where: {
      OR: [
        { requesterId: userId, addresseeId: otherUserId, status: FriendshipStatus.ACCEPTED },
        { requesterId: otherUserId, addresseeId: userId, status: FriendshipStatus.ACCEPTED },
      ],
    },
  });
  return { ok: true };
}

export async function blockUser(requesterId: string, addresseeId: string) {
  if (requesterId === addresseeId) throw new HttpError(400, 'Invalid');

  await prisma.friendship.deleteMany({
    where: {
      OR: [
        { requesterId, addresseeId },
        { requesterId: addresseeId, addresseeId: requesterId },
      ],
    },
  });

  return prisma.friendship.create({
    data: { requesterId, addresseeId, status: FriendshipStatus.BLOCKED },
  });
}

export async function unblockUser(requesterId: string, addresseeId: string) {
  await prisma.friendship.deleteMany({
    where: { requesterId, addresseeId, status: FriendshipStatus.BLOCKED },
  });
  return { ok: true };
}

export async function listFriends(userId: string) {
  const rows = await prisma.friendship.findMany({
    where: {
      status: FriendshipStatus.ACCEPTED,
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
  });

  const ids = rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId));
  if (ids.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      _count: { select: { followers: true } },
    },
  });

  return users.map((u) => ({
    id: u.id,
    username: u.username,
    name: u.displayName ?? u.username,
    car: null as string | null,
    location: null as string | null,
    avatar: u.avatarUrl,
    followers: u._count.followers,
  }));
}

export async function listPendingIncoming(userId: string) {
  return prisma.friendship.findMany({
    where: { addresseeId: userId, status: FriendshipStatus.PENDING },
    include: {
      requester: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    },
  });
}
