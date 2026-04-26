# Event Stories — Backend Design Spec

**Owner:** Backend team
**Author:** Frontend / Mobile
**Date:** 2026-04-26
**Status:** Proposed — needs backend implementation before the feature can ship.

---

## 1. Background & current state

Club Scentra now ships story rings around every event card on the **Explore** and **Meets** screens. Tapping a ringed event opens a fullscreen Instagram-style story viewer (`app/stories.tsx`) that auto-advances through 5-second slides.

The viewer is **already wired and visible to users**, but the data path behind it is incomplete on the backend. Today every event opens straight to the placeholder fallback ("Be the first to share a moment from this meet") because:

1. The endpoint the viewer calls — `GET /api/events/:id/posts` — **does not exist on the server.** The frontend request silently fails and falls back to the cover image.
2. The `Post` and `Story` Prisma models have no `eventId` column, so even if the endpoint existed there is no way to filter posts by event.
3. The post/story creation endpoints (`POST /api/social/posts`, `POST /api/social/stories`) accept only `imageUrl` (+ optional caption / TTL). They cannot record which event a post belongs to.

The frontend is fully ready to render real data the moment the backend supports it. This spec defines what the backend needs to add.

---

## 2. Goals

- Allow an authenticated user to **publish a photo + optional caption tied to a specific event**.
- Allow any viewer (authenticated or anonymous) to **list those photos for a given event**, newest first.
- Match the existing API style (Express + Zod validation, JWT bearer auth, JSON responses, 400 with `{ error, details }` on validation errors).
- Be minimally invasive: extend the existing `Post` model rather than introducing a new one.
- Lay the groundwork for time-limited stories (24 h auto-expiry) without requiring it in v1.

## 3. Non-goals (for v1)

- Likes, comments, view counts, or reactions on event posts.
- Moderation tooling, reporting, or admin removal flows.
- Server-side image processing, transcoding, or thumbnailing.
- Push notifications for new event posts.
- Distinguishing between a permanent "post" and a 24 h "story" — see §8 for the migration path.

---

## 4. Data model changes

### 4.1 `Post` — add optional `eventId`

```prisma
model Post {
  id        String   @id @default(cuid())
  userId    String
  eventId   String?           // NEW — nullable for backward compatibility
  imageUrl  String
  caption   String?
  createdAt DateTime @default(now())

  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  event Event? @relation(fields: [eventId], references: [id], onDelete: SetNull)  // NEW

  @@index([userId, createdAt])
  @@index([eventId, createdAt])   // NEW — supports the per-event feed query
}
```

Add the inverse on `Event`:

```prisma
model Event {
  // ...existing fields...
  posts Post[]
}
```

**Migration notes**

- Field is nullable so existing rows in production stay valid (they remain "profile-only" posts).
- `onDelete: SetNull` so deleting an event does not cascade-delete user content; the post just becomes profile-only.
- Add the composite index `(eventId, createdAt)` because the viewer query is "newest posts for this event."

### 4.2 `Story` — same treatment (optional, can defer to v1.1)

If you want to ship time-limited event stories now, mirror the same change on `Story`. Otherwise treat the feature as permanent posts for v1 and add the column when stories ship.

---

## 5. API contract

All routes are mounted under the existing `/api` prefix. Validation errors must use the existing format the frontend already parses: `400 { error: "Validation error", details: { field: [messages] } }`.

### 5.1 `GET /api/events/:id/posts` — **NEW**

Returns the photos posted to an event, newest first.

- **Auth:** optional bearer token (same pattern as `GET /api/events/:id`). Anonymous viewers get the same data.
- **Path params:** `id` — event id (cuid).
- **Query params (optional):**
  - `limit` (int, 1–50, default 20)
  - `cursor` (string, opaque — recommend base64-encoded `createdAt|id` for stable pagination)
- **Response 200:**

```json
{
  "posts": [
    {
      "id": "ckxxxxxxxxxxxx",
      "imageUrl": "https://cdn.../uploads/abc.jpg",
      "caption": "Wild meet last night",
      "createdAt": "2026-04-25T22:14:00.000Z",
      "author": {
        "id": "ckyyyyyyyyyyy",
        "username": "adiba",
        "displayName": "Adiba Alif",
        "avatarUrl": "https://cdn.../avatars/adiba.jpg"
      }
    }
  ],
  "nextCursor": "MjAyNi0wNC0yNVQyMjoxNDowMC4wMDBafGNreHh4eA==" 
}
```

- **Response 404:** event does not exist — `{ error: "Event not found" }`.
- The `author` shape matches the `EventPost` type already declared in `lib/api.ts`. **Please do not rename these fields** or the viewer will need to be re-mapped.

### 5.2 `POST /api/social/posts` — **EXTEND**

Accept an optional `eventId`. Existing callers (profile photo grid) keep working unchanged.

**Request body (Zod):**

```ts
z.object({
  imageUrl: z.string().url(),
  caption: z.string().max(2000).optional(),
  eventId: z.string().cuid().optional(),  // NEW
})
```

**Behaviour:**

- **Auth required.**
- If `eventId` is provided, verify the event exists. If not, return `400 { error: "Validation error", details: { eventId: ["Event not found"] } }`.
- Persist `eventId` on the `Post` row.
- Return `201` with the created post in the **same shape as the GET response item** (so the frontend can optimistically prepend it to the viewer without re-fetching). Include the `author` block.

**Authorization rule (v1, intentionally permissive):** any authenticated user can post to any event. We will tighten this to "host or RSVP'd attendee" in a follow-up once the meets-attendance flow is finalised.

### 5.3 `POST /api/social/stories` — **EXTEND** (optional, only if shipping stories in v1)

Same pattern: add optional `eventId`, validate it, store it, return the same shape used by `GET /api/events/:id/stories` (see §8). Skip if deferring stories to v1.1.

---

## 6. Image upload pipeline

The frontend already has a working uploader at `lib/api.ts → uploads.uploadImage(uri)` that hits `POST /api/uploads` and gets back `{ url, key }`. **No changes needed here.** The flow on the client will be:

1. User taps "Post Photo" or "Add to Story" on an event detail / story viewer.
2. Open image picker → get local URI.
3. `uploads.uploadImage(uri)` → returns hosted `url`.
4. `POST /api/social/posts` with `{ imageUrl: url, caption, eventId }`.
5. On success, optimistically prepend the returned post to the local story array.

So all the backend needs to do is **persist the eventId on the existing post-create endpoint** and **expose the per-event read endpoint**. Image storage is already solved.

---

## 7. Edge cases & validation

- **Event deletion:** posts survive (`onDelete: SetNull`) and revert to profile-only.
- **User deletion:** posts cascade-delete (`onDelete: Cascade` on `userId` already in the schema).
- **Invalid eventId on create:** 400 with the standard validation error shape.
- **Empty event feed:** return `{ posts: [], nextCursor: null }` — **never** 404. The frontend already shows a "Be the first to share" placeholder when the array is empty.
- **Pagination stability:** ordering is `createdAt DESC, id DESC`. Cursor must encode both so concurrent inserts don't shift the page.
- **Caption length:** keep the existing 2000-char cap.

---

## 8. Future: time-limited stories (v1.1+)

When you're ready to introduce a true ephemeral "story" tier:

- Add `eventId` (`String?`) and `expiresAt` (`DateTime`) to `Story` (the latter already exists).
- Add `GET /api/events/:id/stories` returning only `Story` rows where `expiresAt > now()`, same response shape as §5.1 but read from `Story` instead of `Post`.
- Frontend will switch the viewer's data source from `events.getPosts(eventId)` to a merged `getStories(eventId)` call. Single-line change.

This is intentionally out of scope for v1 so we can ship the visible feature with one migration and three small route changes.

---

## 9. Acceptance checklist

The feature is done when all of the following are true on the staging API (`https://api.airthreads.ai:4014/api`):

- [ ] Prisma migration applied; `Post.eventId` exists with the new index; production data preserved.
- [ ] `GET /api/events/:id/posts` returns 200 with the response shape in §5.1, including `author` sub-object, for any valid event id.
- [ ] `GET /api/events/:id/posts` returns 200 with `{ posts: [], nextCursor: null }` for an event that has no posts (NOT 404).
- [ ] `GET /api/events/:nonexistent/posts` returns 404.
- [ ] `POST /api/social/posts` with `{ imageUrl, caption, eventId }` returns 201 and a post that immediately appears in the next call to `GET /api/events/:id/posts`.
- [ ] `POST /api/social/posts` with an invalid `eventId` returns 400 with `{ error: "Validation error", details: { eventId: [...] } }`.
- [ ] `POST /api/social/posts` **without** an `eventId` still works exactly as before (profile-only post). No regression on the profile photo grid.
- [ ] Anonymous (no bearer token) `GET /api/events/:id/posts` returns the same data as authenticated.

Once these are green, the frontend creator UI (image picker → upload → post) is a 1-day task on our side and the feature ships.

---

## 10. Contact

Frontend questions / type shapes / shape negotiation: see `lib/api.ts` (`EventPost` type at the top of the file) and `app/stories.tsx` (consumer). Ping the mobile channel before changing field names.
