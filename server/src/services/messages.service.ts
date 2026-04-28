import { ConversationType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { HttpError } from '../middleware/errorHandler';

async function findDirectConversation(aId: string, bId: string) {
  const parts = await prisma.conversationParticipant.findMany({
    where: { userId: { in: [aId, bId] } },
    select: { conversationId: true, userId: true },
  });
  const byConv = new Map<string, Set<string>>();
  for (const p of parts) {
    if (!byConv.has(p.conversationId)) byConv.set(p.conversationId, new Set());
    byConv.get(p.conversationId)!.add(p.userId);
  }
  for (const [cid, set] of byConv) {
    if (set.size === 2 && set.has(aId) && set.has(bId)) {
      const conv = await prisma.conversation.findFirst({
        where: { id: cid, type: ConversationType.DIRECT },
      });
      if (conv) return conv;
    }
  }
  return null;
}

export async function getOrCreateDirectConversation(userId: string, otherUserId: string) {
  if (userId === otherUserId) throw new HttpError(400, 'Invalid conversation');

  const existing = await findDirectConversation(userId, otherUserId);
  if (existing) return existing;

  const conv = await prisma.conversation.create({
    data: {
      type: ConversationType.DIRECT,
      participants: {
        create: [{ userId: userId }, { userId: otherUserId }],
      },
    },
  });
  return conv;
}

export async function createGroupConversation(
  creatorId: string,
  memberIds: string[],
  name?: string
) {
  if (memberIds.length < 2) throw new HttpError(400, 'Group must have at least 2 other members');
  if (memberIds.includes(creatorId)) throw new HttpError(400, 'Creator should not be in memberIds');

  const allParticipantIds = [creatorId, ...memberIds];

  const conv = await prisma.conversation.create({
    data: {
      type: ConversationType.GROUP,
      name: name?.trim() || null,
      participants: {
        create: allParticipantIds.map((userId) => ({ userId })),
      },
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
      },
    },
  });

  return {
    id: conv.id,
    type: conv.type,
    name: conv.name,
    participants: conv.participants.map((p) => ({ user: p.user })),
  };
}

export async function listConversations(userId: string) {
  const parts = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: { conversationId: true },
  });
  const ids = parts.map((p) => p.conversationId);
  if (ids.length === 0) return [];

  const convs = await prisma.conversation.findMany({
    where: { id: { in: ids } },
    include: {
      participants: {
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
      },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return convs.map((c) => {
    const other =
      c.type === ConversationType.DIRECT
        ? c.participants.find((p) => p.userId !== userId)?.user
        : null;
    const last = c.messages[0];
    return {
      id: c.id,
      type: c.type,
      name: c.name ?? other?.displayName ?? other?.username ?? 'Chat',
      otherUser: other,
      lastMessage: last
        ? { body: last.body, createdAt: last.createdAt.toISOString(), senderId: last.senderId }
        : null,
    };
  });
}

export async function getMessages(conversationId: string, userId: string, cursor?: string, take = 50) {
  const member = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId },
  });
  if (!member) throw new HttpError(403, 'Not a member');

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  });

  return messages.reverse();
}

export async function sendMessage(conversationId: string, senderId: string, body: string) {
  const member = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId: senderId },
  });
  if (!member) throw new HttpError(403, 'Not a member');

  const msg = await prisma.message.create({
    data: { conversationId, senderId, body: body.trim() },
    include: {
      sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return msg;
}
