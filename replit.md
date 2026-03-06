# Club Scentra - Car Meet App

## Overview
A car meet focused social app built with React Native (Expo SDK 54) and TypeScript. Users can discover car events, create meets, connect with friends, and manage their car enthusiast profiles.

## Tech Stack
- **Framework**: Expo SDK 54 (React Native)
- **Language**: TypeScript
- **Routing**: Expo Router v6 (file-based routing)
- **Icons**: @expo/vector-icons (Ionicons)
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

## Notes
- Currently using placeholder icons (Ionicons flame icon for logo)
- Profile images use Unsplash placeholder URLs
- Mock data in MockData.ts for all events, friends, messages
- No backend connected yet — all data is static
