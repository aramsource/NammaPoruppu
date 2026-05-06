# NammaPoruppu

Report issues. Support change. Improve your area.

NammaPoruppu is a civic accountability platform focused on Chennai (MVP): residents report issues, support unresolved reports, and track status with ward-level context.

## Stack

- Next.js (App Router), React, TypeScript
- Supabase (Auth, Postgres, Storage)
- Leaflet + React Leaflet for maps

## Features in this repo

- Issue reporting with GPS + photo upload
- Ward mapping and locality-aware browse map
- Email magic-link auth and phone OTP auth
- Support (upvote) flow with auth-enforced DB policy
- Resolve-proof upload and pending verification flow
- Escalation flow (create, view details, hard delete by owner)

## Project Structure

- `src/app` - pages and API route handlers
- `src/components` - reusable UI blocks and map renderer
- `src/context` - auth/city providers
- `src/lib` - domain types, configs, Supabase clients
- `supabase` - SQL migrations, seed files, email templates

## Environment Variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only; never expose publicly)

## Run Locally

```bash
bun install
bun run dev
```

Or with npm:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Required Migrations

Apply these in your Supabase project:

- `supabase/001_init.sql`
- `supabase/004_seed_all_chennai_wards.sql` (merged bootstrap migration)

## Open Source Safety

- Do not commit real `.env` files or secrets.
- Keep only placeholders in `.env.example`.
- Review migrations/data CSVs before publishing if they include sensitive personal data.

## Contributing

Issues and PRs are welcome. Please keep changes focused, include testing notes, and avoid committing secrets.

## Links

- GitHub: [https://github.com/aramsource/NammaPoruppu](https://github.com/aramsource/NammaPoruppu)
- Email: [hello@aramsource.org](mailto:hello@aramsource.org)
