## Nordic Spirit Portal

Mobile-first white-on-white portal for photo collection and workday reportings. Built with Next.js (App Router), TypeScript, Tailwind, Supabase, and deployable to Vercel.

### Stack
- Next.js 14 (App Router, TypeScript)
- TailwindCSS
- Supabase (Postgres + Storage)
- Vercel

### Setup
1. Create a Supabase project.
2. Create a storage bucket named `photos` (public).
3. Run the SQL in `supabase/schema.sql`.
4. Copy `.env.example` to `.env.local` and set keys.
5. `npm i` then `npm run dev`.

### Deploy to Vercel
1. Push to GitHub (e.g., `SalesCrew/Nordic-Spirit-Portal-`).
2. On Vercel, import the repo.
3. Add env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Build & deploy.


### Env
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Notes
- Images are uploaded to bucket `photos` under `eventId/filename`.
- Event cover images are stored in the same bucket and their public URLs saved in `events.cover_url`.
- Admin route `/admin` includes a hidden login placeholder (toggle with Ctrl+Shift+L). Secure admin access later.


