

# CineSearch Evolution - Implementation Plan

This is a major feature set requiring Supabase integration (auth, database, edge functions) and significant new UI. The project currently has zero Supabase setup.

## Prerequisites

- **Enable Lovable Cloud** to get a Supabase instance connected to the project
- Lovable Cloud will also provide `LOVABLE_API_KEY` for the AI recommendations feature

## Phase 1: Supabase Setup & Auth

### Database Tables (via migrations)

1. **`profiles`** table: `id` (uuid, FK to auth.users, PK), `username` (text), `avatar_url` (text), `xp` (int, default 0), `level` (int, default 1), `created_at`
2. **`user_interactions`** table: `id` (uuid, PK), `user_id` (uuid, FK to auth.users), `tmdb_id` (int), `media_type` (text, 'movie'/'tv'), `is_favorite` (bool, default false), `is_watched` (bool, default false), `created_at`. Unique constraint on `(user_id, tmdb_id, media_type)`
3. **Trigger** to auto-create a profile row on user signup
4. **RLS policies**: users can only SELECT/INSERT/UPDATE their own rows on both tables

### Auth UI

- Create `src/pages/Auth.tsx` with login/register form (email + password) using Supabase Auth
- Create `src/contexts/AuthContext.tsx` with `onAuthStateChange` listener
- Add `/auth` route in `App.tsx`
- Update the header in `Index.tsx` to show Login button or user avatar + link to profile

## Phase 2: Favorite & Watched Interactions

### MediaCard Updates

- Add Heart (favorite) and Eye (watched) icon buttons overlaid on `MediaCard`
- Buttons only appear when user is logged in
- Use `useMutation` + `useQuery` to read/write `user_interactions` table
- Optimistic updates for instant UI feedback

### XP Logic

- Create a helper `src/lib/gamification.ts` with XP rules:
  - Favorite: +10 XP, Unfavorite: -10 XP
  - Watched: +50 XP, Unwatched: -50 XP
- Level formula: `level = floor(xp / 100) + 1`
- After each interaction mutation, update `profiles.xp` and recalculate `profiles.level`
- Use `sonner` toast to show "+10 XP!" or "Level Up!" notifications

### Detail Pages

- Also add favorite/watched buttons on `MovieDetail.tsx` and `TVDetail.tsx`

## Phase 3: Profile Page

- Create `src/pages/Profile.tsx` at route `/profile`
- Display: avatar, username, current level, XP progress bar (using existing `Progress` component)
- Two grids: "Favoritos" and "Assistidos" -- query `user_interactions` then fetch TMDB data for each item
- **Achievements/Badges**: query watched items, fetch their genres from TMDB, and award badges like "Fan de Acao" (5+ action movies watched). Display as badge chips.

## Phase 4: AI Recommendations

- Create Supabase Edge Function `supabase/functions/ai-recommendations/index.ts`
  - Receives user's favorite titles
  - Calls Lovable AI Gateway (`google/gemini-3-flash-preview`) with a prompt asking for movie/TV recommendations
  - Uses tool calling to return structured JSON with TMDB-searchable titles
  - Returns list of recommended titles
- Frontend: new section in `Index.tsx` ("Sugestoes da IA para Voce") visible only when logged in
  - Fetches user's last 5 favorites from Supabase
  - Calls edge function with those titles
  - Maps returned titles back to TMDB via `searchMulti`
  - Displays as a horizontal carousel of `MediaCard` components

## Phase 5: Header & Navigation Updates

- Create a shared `Header` component extracted from `Index.tsx`
- Show user avatar + level badge when logged in, linking to `/profile`
- Show Login button when not logged in
- Reuse header on detail pages and profile page

## Files to Create/Modify

| File | Action |
|---|---|
| `src/integrations/supabase/client.ts` | Create (auto from Lovable Cloud) |
| `src/contexts/AuthContext.tsx` | Create |
| `src/pages/Auth.tsx` | Create |
| `src/pages/Profile.tsx` | Create |
| `src/lib/gamification.ts` | Create |
| `src/hooks/useInteractions.ts` | Create (favorite/watched queries + mutations) |
| `src/components/Header.tsx` | Create |
| `src/components/InteractionButtons.tsx` | Create |
| `src/components/AchievementBadges.tsx` | Create |
| `src/components/AIRecommendations.tsx` | Create |
| `supabase/functions/ai-recommendations/index.ts` | Create |
| `supabase/config.toml` | Update |
| `src/App.tsx` | Update (routes, auth provider) |
| `src/components/MediaCard.tsx` | Update (add interaction buttons) |
| `src/pages/Index.tsx` | Update (use Header, add AI section) |
| `src/pages/MovieDetail.tsx` | Update (add interaction buttons) |
| `src/pages/TVDetail.tsx` | Update (add interaction buttons) |
| Database migrations | 3 migrations (profiles, user_interactions, trigger + RLS) |

## Implementation Order

1. Enable Lovable Cloud (required first)
2. Database tables + RLS + trigger
3. Auth context + Auth page + Header
4. Interaction buttons + XP/gamification
5. Profile page with favorites/watched grids + achievements
6. AI recommendations edge function + frontend section

