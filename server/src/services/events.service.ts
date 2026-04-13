import { EventRsvpStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { HttpError } from '../middleware/errorHandler';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const hostSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

export async function createEvent(
  hostId: string,
  input: {
    title: string;
    description: string;
    imageUrl?: string | null;
    startAt: string;
    endAt?: string | null;
    addressLine?: string | null;
    city?: string | null;
    region?: string | null;
    postalCode?: string | null;
    country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }
) {
  const event = await prisma.event.create({
    data: {
      hostId,
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl ?? null,
      startAt: new Date(input.startAt),
      endAt: input.endAt ? new Date(input.endAt) : null,
      addressLine: input.addressLine,
      city: input.city,
      region: input.region,
      postalCode: input.postalCode,
      country: input.country ?? 'CA',
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
    },
    include: { host: { select: hostSelect } },
  });
  return getEventById(event.id, hostId);
}

export async function getEventById(eventId: string, viewerId?: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      host: { select: hostSelect },
      ...(viewerId
        ? { rsvps: { where: { userId: viewerId } } }
        : {}),
    },
  });
  if (!event) throw new HttpError(404, 'Event not found');

  const interestedCount = await prisma.eventRsvp.count({
    where: { eventId, status: EventRsvpStatus.INTERESTED },
  });
  const goingCount = await prisma.eventRsvp.count({
    where: { eventId, status: EventRsvpStatus.GOING },
  });

  type WithRsvp = { rsvps?: { userId: string; status: EventRsvpStatus }[] };
  const rsvpRows = (event as WithRsvp).rsvps ?? [];
  const mine = viewerId ? rsvpRows.find((r) => r.userId === viewerId) : undefined;

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    imageUrl: event.imageUrl,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt?.toISOString() ?? null,
    addressLine: event.addressLine,
    city: event.city,
    region: event.region,
    postalCode: event.postalCode,
    country: event.country,
    latitude: event.latitude,
    longitude: event.longitude,
    host: event.host,
    goingCount,
    interestedCount,
    viewerStatus: mine?.status ?? null,
  };
}

export async function explore(params: {
  q?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: 'popular' | 'nearest';
  lat?: number;
  lng?: number;
  radiusKm?: number;
  skip?: number;
  take?: number;
  viewerId?: string;
}) {
  const take = Math.min(params.take ?? 30, 100);
  const skip = params.skip ?? 0;
  const now = new Date();

  const startGte = params.dateFrom ? new Date(params.dateFrom) : now;
  const startAt: Prisma.DateTimeFilter = { gte: startGte };
  if (params.dateTo) startAt.lte = new Date(params.dateTo);

  const andParts: Prisma.EventWhereInput[] = [{ startAt }];

  if (params.location?.trim()) {
    const loc = params.location.trim();
    andParts.push({
      OR: [
        { city: { contains: loc, mode: 'insensitive' } },
        { region: { contains: loc, mode: 'insensitive' } },
        { addressLine: { contains: loc, mode: 'insensitive' } },
      ],
    });
  }

  if (params.q?.trim()) {
    const term = params.q.trim();
    andParts.push({
      OR: [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { city: { contains: term, mode: 'insensitive' } },
      ],
    });
  }

  const where: Prisma.EventWhereInput = { AND: andParts };

  const events = await prisma.event.findMany({
    where,
    include: {
      host: { select: hostSelect },
      ...(params.viewerId
        ? { rsvps: { where: { userId: params.viewerId } } }
        : {}),
    },
    skip,
    take: take * 3,
  });

  const withCounts = await Promise.all(
    events.map(async (e) => {
      const goingCount = await prisma.eventRsvp.count({
        where: { eventId: e.id, status: EventRsvpStatus.GOING },
      });
      return { ...e, goingCount };
    })
  );

  let list = withCounts;

  if (params.sort === 'nearest' && params.lat != null && params.lng != null) {
    list = list
      .filter((e) => e.latitude != null && e.longitude != null)
      .map((e) => ({
        ...e,
        distanceKm: haversineKm(params.lat!, params.lng!, e.latitude!, e.longitude!),
      }))
      .filter((e) => (params.radiusKm ? e.distanceKm! <= params.radiusKm : true))
      .sort((a, b) => a.distanceKm! - b.distanceKm!);
  } else if (params.sort === 'popular' || !params.sort) {
    list = [...list].sort((a, b) => b.goingCount - a.goingCount);
  }

  list = list.slice(skip, skip + take);

  return list.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    imageUrl: e.imageUrl,
    startAt: e.startAt.toISOString(),
    endAt: e.endAt?.toISOString() ?? null,
    city: e.city,
    region: e.region,
    latitude: e.latitude,
    longitude: e.longitude,
    host: e.host,
    goingCount: e.goingCount,
    viewerStatus: e.rsvps[0]?.status ?? null,
  }));
}

export async function setRsvp(userId: string, eventId: string, status: EventRsvpStatus) {
  await prisma.eventRsvp.upsert({
    where: { userId_eventId: { userId, eventId } },
    create: { userId, eventId, status },
    update: { status },
  });
  return getEventById(eventId, userId);
}

export async function removeRsvp(userId: string, eventId: string) {
  await prisma.eventRsvp.deleteMany({ where: { userId, eventId } });
  return { ok: true };
}

export async function getMeets(
  userId: string,
  section: 'hosting' | 'going' | 'saved' | 'past',
  filters: { q?: string; location?: string; dateFrom?: string; dateTo?: string }
) {
  const now = new Date();
  const term = filters.q?.trim().toLowerCase();

  const textMatch = (e: { title: string; description: string; city: string | null }) => {
    if (!term) return true;
    return (
      e.title.toLowerCase().includes(term) ||
      e.description.toLowerCase().includes(term) ||
      (e.city?.toLowerCase().includes(term) ?? false)
    );
  };

  const locMatch = (e: { city: string | null; region: string | null }) => {
    if (!filters.location?.trim()) return true;
    const l = filters.location.trim().toLowerCase();
    return (
      e.city?.toLowerCase().includes(l) || e.region?.toLowerCase().includes(l) || false
    );
  };

  if (section === 'hosting') {
    let list = await prisma.event.findMany({
      where: { hostId: userId },
      include: { host: { select: hostSelect } },
      orderBy: { startAt: 'desc' },
    });
    list = list.filter((e) => textMatch(e) && locMatch(e));
    return list.filter((e) => {
      if (filters.dateFrom && e.startAt < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && e.startAt > new Date(filters.dateTo)) return false;
      return true;
    });
  }

  if (section === 'going') {
    const rsvps = await prisma.eventRsvp.findMany({
      where: {
        userId,
        status: EventRsvpStatus.GOING,
        event: { startAt: { gte: now } },
      },
      include: { event: { include: { host: { select: hostSelect } } } },
    });
    return rsvps
      .map((r) => r.event)
      .filter((e) => textMatch(e) && locMatch(e));
  }

  if (section === 'saved') {
    const rsvps = await prisma.eventRsvp.findMany({
      where: {
        userId,
        status: EventRsvpStatus.INTERESTED,
      },
      include: { event: { include: { host: { select: hostSelect } } } },
    });
    return rsvps
      .map((r) => r.event)
      .filter((e) => e.startAt >= now)
      .filter((e) => textMatch(e) && locMatch(e));
  }

  if (section === 'past') {
    const rsvps = await prisma.eventRsvp.findMany({
      where: {
        userId,
        status: EventRsvpStatus.GOING,
        event: { startAt: { lt: now } },
      },
      include: { event: { include: { host: { select: hostSelect } } } },
    });
    const hosted = await prisma.event.findMany({
      where: { hostId: userId, startAt: { lt: now } },
      include: { host: { select: hostSelect } },
    });
    const merged = [...rsvps.map((r) => r.event), ...hosted];
    const seen = new Set<string>();
    const unique = merged.filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
    return unique
      .filter((e) => textMatch(e) && locMatch(e))
      .sort((a, b) => b.startAt.getTime() - a.startAt.getTime());
  }

  return [];
}
