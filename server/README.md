# Scentra API

Express + TypeScript + Prisma + PostgreSQL backend for the Club Scentra Expo app.

## Prerequisites

- Node.js 20+
- PostgreSQL (local Docker recommended: `docker compose up -d` from repo root `scentra/`)

## Setup

```bash
cd server
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_ACCESS_SECRET (≥16 chars)

npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

- Health: `GET http://localhost:3000/health`
- Uploads are stored under `server/uploads/` and served at `GET /uploads/:filename` (URLs returned from `POST /api/uploads`).

## Environment

See `.env.example`. **Add later:** `GOOGLE_CLIENT_ID` for `POST /api/auth/google`, and optionally `PUBLIC_BASE_URL` if the API is not at `http://localhost:PORT`.

## API overview

All JSON APIs are under `/api` unless noted.

### Auth — `/api/auth`

| Method | Path | Body | Auth |
|--------|------|------|------|
| POST | `/register` | `{ username, email, password, displayName? }` | No |
| POST | `/login` | `{ email, password }` | No |
| POST | `/login-identifier` | `{ identifier, password }` (email or username) | No |
| POST | `/google` | `{ idToken }` | No (needs `GOOGLE_CLIENT_ID`) |
| POST | `/refresh` | `{ refreshToken }` | No |

Response includes `accessToken`, `refreshToken`, `user` (with `settings`).

### Users — `/api/users`

| Method | Path | Auth |
|--------|------|------|
| GET | `/me` | Bearer |
| PATCH | `/me` | Bearer — `{ displayName?, bio?, avatarUrl?, username? }` |
| GET | `/me/settings` | Bearer |
| PATCH | `/me/settings` | Bearer — notification/preference toggles |
| GET | `/search?q=` | Bearer |
| GET | `/:id` | Optional Bearer (sets `isFollowing` when present) |

### Events — `/api/events`

| Method | Path | Notes |
|--------|------|--------|
| POST | `/` | Bearer — create event (title, description, startAt ISO, optional location, imageUrl, etc.) |
| GET | `/explore` | Query: `q`, `location`, `dateFrom`, `dateTo`, `sort=popular\|nearest`, `lat`, `lng`, `radiusKm`, `skip`, `take`. Optional Bearer. |
| GET | `/:id` | Optional Bearer — detail + `goingCount`, `interestedCount`, `viewerStatus` |
| POST | `/:id/rsvp` | Bearer — `{ status: "GOING" \| "INTERESTED" }` |
| DELETE | `/:id/rsvp` | Bearer — remove RSVP |

### Meets — `/api/me`

| Method | Path | Query |
|--------|------|--------|
| GET | `/meets` | Bearer — `section=hosting\|going\|saved\|past`, optional `q`, `location`, `dateFrom`, `dateTo` |

### Friends — `/api/friends`

| Method | Path |
|--------|------|
| GET | `/` — list friends |
| GET | `/requests/incoming` |
| POST | `/requests` — `{ addresseeId }` |
| POST | `/requests/:id/accept` |
| DELETE | `/requests/:id` — decline |
| DELETE | `/:userId` — unfriend |
| POST | `/block` — `{ userId }` |
| DELETE | `/block/:userId` |

### Messages — `/api`

| Method | Path |
|--------|------|
| GET | `/conversations` |
| POST | `/conversations/direct` — `{ otherUserId }` |
| GET | `/conversations/:id/messages?cursor=&take=` |
| POST | `/conversations/:id/messages` — `{ body }` |

### Social — `/api/social`

| Method | Path |
|--------|------|
| POST | `/follow/:userId` |
| DELETE | `/follow/:userId` |
| POST | `/posts` — `{ imageUrl, caption? }` |
| GET | `/users/:userId/posts` |
| POST | `/stories` — `{ imageUrl, hoursValid? }` |
| GET | `/users/:userId/stories` |

### Uploads — `/api/uploads`

| Method | Path |
|--------|------|
| POST | `/` — Bearer, `multipart/form-data` field `file` (image) |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | `tsx watch` dev server |
| `npm run build` | `tsc` |
| `npm start` | run `dist/index.js` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:push` | `prisma db push` (prototyping) |
| `npm run db:seed` | seed demo user + events |
| `npm run db:studio` | Prisma Studio |

## Demo user (after seed)

- Email: `demo@clubscentra.test`
- Password: `Password1!`
