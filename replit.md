# Club Scentra - Car Meet App

## Overview
A car meet focused social app built with React Native (Expo SDK 54) and TypeScript. Users can discover car events, create meets, connect with friends, and manage their car enthusiast profiles.

## Tech Stack
- **Framework**: Expo SDK 54 (React Native)
- **Language**: TypeScript
- **Routing**: Expo Router v6 (file-based routing)
- **Icons**: @expo/vector-icons (Ionicons) + custom PNG tab icons
- **Animations**: react-native-reanimated

## Project Structure
```
app/
├── _layout.tsx              # Root Stack navigator
├── index.tsx                # Entry redirect to auth
├── (auth)/                  # Auth flow screens
│   ├── _layout.tsx          # Auth Stack layout
│   ├── landing.tsx          # Landing page with logo
│   ├── login.tsx            # Login screen
│   ├── signup.tsx           # Sign up step 1
│   └── signup-details.tsx   # Sign up step 2
├── (tabs)/                  # Main tab navigator
│   ├── _layout.tsx          # Bottom tab layout (5 tabs)
│   ├── explore.tsx          # Explore events
│   ├── meets.tsx            # My meets
│   ├── event.tsx            # Create event (step 1)
│   ├── friends.tsx          # Friends list
│   └── profile.tsx          # User profile
├── create-event-location.tsx  # Create event step 2
├── create-event-schedule.tsx  # Create event step 3
├── create-event-photo.tsx     # Create event step 4
├── friend-profile.tsx         # Friend profile view
├── event-detail.tsx           # Single event detail
├── settings.tsx               # Settings screen
├── edit-profile.tsx           # Edit profile
├── messages.tsx               # Messages list
├── terms.tsx                  # Terms and conditions
└── +not-found.tsx             # 404 page

components/
├── RedButton.tsx             # Primary red CTA button
├── InputField.tsx            # Styled text input with label
├── EventCard.tsx             # Event card (default/popular/past)
├── StepIndicator.tsx         # Dot progress indicator
├── SearchBar.tsx             # Search input with icon
├── ProfileHeader.tsx         # Profile header with avatar/stats
└── PhotoGrid.tsx             # 2-column photo grid

constants/
├── Theme.ts                  # App theme (colors, spacing, typography)
├── Colors.ts                 # Color exports for navigation
└── MockData.ts               # Sample event/profile/friend data
```

## Design Language
- **Background**: #E8EAED (light grey-blue)
- **Primary/Accent**: #D32F2F (red)
- **Cards**: White with rounded corners (12px radius)
- **Inputs**: #F5F5F5 grey background
- **Auth bottom bars**: Black #000000
- **Tab bar**: White, red active state

## Navigation Flow
1. Landing → Login or Sign Up
2. Sign Up: Step 1 (email/Google) → Step 2 (details) → Explore
3. Login → Explore
4. Bottom tabs: EXPLORE | MEETS | EVENT | FRIENDS | PROFILE
5. Create Event: 4-step wizard (Name → Location → Schedule → Photo)
6. Profiles: Own profile (Edit/Share) vs Friend profile (Follow/Message)
7. Settings: Accessible from Profile screen

## Running the App
- Dev server: `npx expo start` (configured as "Dev Server" workflow)
- Preview on phone: Scan QR code with Expo Go
- Web preview: Press 'w' in terminal for web version

## Brand Assets
- **Logo**: `assets/images/logo.png` — Red S flame logo with "CLUB SCENTRA" text (used on landing, login, signup screens)
- **Header Logo**: `assets/images/club-scentra-text.png` — "CLUB SCENTRA" text only (used on explore/meets page headers)
- **Tab Icons**: `assets/images/icons/` — 5 custom PNGs (explore, meets, event, friends, profile) with opacity-based active/inactive states

## Notes
- Profile images use Unsplash placeholder URLs as fallback
- **Backend is live**: `https://api.airthreads.ai:4014/api` (Express + Prisma + PostgreSQL on EC2)
- API client in `lib/api.ts` covers auth, events, meets, friends, messages, social, uploads

## Event Stories Feature (live)
- **Story rings** wrap every event card on Explore + Meets via `components/StoryRing.tsx`
- **Viewer**: `app/stories.tsx` — fullscreen, 5-sec auto-advance, tap-zones for nav
  - Loads via `events.getPosts(eventId, { limit?, cursor? })` → `{ posts, nextCursor }`
  - Header has a "+" button that opens the creator pre-filled with this meet's id/title/image
  - Falls back to event cover image with "Be the first to share" placeholder when feed is empty
- **Creator**: `app/create-post.tsx` — image picker (camera + library) → `uploads.uploadImage` → `social.createPost({ imageUrl, caption?, eventId? })`
  - Tied-to-event mode shows an orange event tag and `replace`s into `/stories` on success
  - Profile-only mode (no eventId) just `back()`s on success
- **Profile sheet** "Post Photo" → `/create-post` (profile-only); "Post to a Meet" → meets tab to pick a meet first
- Backend contract documented in `docs/EVENT_STORIES_DESIGN_SPEC.md`

## UI/UX Polish (Task #2)
- **Filter pills**: shared `components/FilterPill.tsx` (44pt min-height, icon + value/placeholder, chevron or close × when filled, active = red border + #FFF5F5). Used by `LocationDropdown` and `DateDropdown`. Identical look on Explore + Meets headers.
- **Calendar grid**: `cellWrap` cells use `width: 100/7%` + `aspectRatio: 1` + 3px padding + circular inner button. Day labels uppercase, evenly spaced. Applied in `DateDropdown` filter sheet and the `create-event-schedule` date sheet.
- **EventCard "Add to Story"**: optional `onAddToStory` prop renders a small bordered pill below the date row. Light variant on red/dark cards, primary-coloured on default cards. Wired in `app/(tabs)/explore.tsx` (popular + nearby) and `app/(tabs)/meets.tsx` (hosted, going, past) → routes to `/create-post` with `eventId` / `eventTitle` / `eventImage` params.
- **Wizard header (`components/WizardHeader.tsx`)**: back arrow + step title + Cancel button on every Create Event step. Cancel shows confirm (Alert on native, `window.confirm` on web), then `router.dismissAll()` + `router.replace(cancelTo)`. Step 1 (`(tabs)/event.tsx`) uses `backBehavesAsCancel` since it's a tab. Steps 2–4 use real back navigation. All steps land on `/(tabs)/meets` after cancel and reset their local state, so no partial event is sent to the API.
- **Combined address input** (`app/create-event-location.tsx`): single autocomplete field replaces the four separate address/city/region/postal inputs. Nominatim suggestions populate a hidden `resolved` object; "Next" requires picking a suggestion, then forwards `addressLine`, `city`, `region`, `postalCode` to step 3.
- **Profile grid filter**: `Post.eventId?: string | null` added to `lib/api.ts`. `app/(tabs)/profile.tsx` filters out posts with an `eventId` before passing them to `PhotoGrid`. No-op until the backend persists/returns the field (server contract is in `docs/EVENT_STORIES_DESIGN_SPEC.md`).
- **Settings rows** (`app/settings.tsx`):
  - Change Password, Privacy, Help Center, Report a Problem, Privacy Policy → transient "Coming soon" banner at the top of the screen (auto-dismisses after ~2.8s).
  - Delete Account → destructive Alert (or `window.confirm` on web) with explanation; "Delete" surfaces a "coming soon" banner (no destructive backend call).
  - Toggles (push, email, dark mode, location) show an inline spinner while `users.updateSettings` is in flight, then a red "Saved" pill for ~1.8s. On API failure, the toggle reverts and the banner shows an error.
