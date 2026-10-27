# Uplift

Paste a `package.json`. Uplift looks up each dependency on the npm registry, tells you whether the bump is patch, minor, or major, flags deprecations and advisories, and turns the result into a plan you can share.

`npm outdated` stops at version numbers. This is the rest of that conversation: what changed, how risky it is, and what order you want to take the upgrades.

Live data comes from the public npm registry and, when a package points at GitHub, from the releases API.

## Why TanStack Query

Each row is its own query. One slow or missing package does not block the table.

- 150 dependencies would otherwise mean 150 unmanaged fetches. The key factory and a cap of six in-flight requests keep that under control.
- Package metadata barely changes in an hour, downloads in a day, advisories in fifteen minutes. `staleTime` is set per kind of data so a reload does not hammer the registry.
- GitHub allows 60 unauthenticated requests an hour. The persisted cache, plus an optional `GITHUB_TOKEN`, is what makes the drawer usable.
- Two projects that both depend on `react` share one cache entry.
- Hovering a row prefetches it. Opening the drawer should not wait on a spinner for data the table already has.
- Pasting a new file cancels in-flight lookups for the old one.
- Release notes wait for the repository URL (`enabled`). Older notes load with an infinite query.
- `select` is not needed on the hot path because the server already trims the registry document. The row only re-renders when its own query changes.
- Marking a package upgraded is optimistic. A forced failure (dev checkbox) rolls the cache back and shows a toast.
- Reorders share a mutation scope so they cannot save out of order.
- `networkMode: "offlineFirst"` queues writes while you are offline.
- Retry skips 400 and 404, backs off on 429 and 5xx, and never retries an aborted request.

The cache inspector (activity icon in the header) is the live version of this list.

## Why Zustand

Zustand holds what the server does not know: the pasted project, filters, the unsaved plan, layout flags.

TanStack Query holds what the server does know: package metadata, downloads, advisories, saved plans.

Typing a note must not re-render a 150-row table. Selector subscriptions are the reason it does not. The store is persisted with a versioned `migrate`, so an old localStorage shape does not crash a new deploy.

## Next.js

- App Router and Server Components for the shared plan page.
- `"use cache"` with `cacheLife` / `cacheTag` in front of npm and GitHub. That is the server cache. TanStack Query is the client cache.
- Route handlers trim huge registry responses and hide the GitHub token.
- Server Actions for plan writes, validated with Zod.
- Intercepting routes: a package opens as a drawer from the table, or as a full page from a copied URL.
- `loading.tsx` and per-package error boundaries.
- `generateMetadata` and an Open Graph image on `/p/[id]`.
- Command palette and inspector are `next/dynamic`. Fonts come from `next/font`.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click a sample project. There is no login.

Optional `.env.local`:

```
GITHUB_TOKEN=
DATABASE_URL=
```

`GITHUB_TOKEN` raises the GitHub rate limit. `DATABASE_URL` (Neon or any Postgres) persists shared plans. Without it, saved plans live in memory for the current server process, which is enough to demo optimistic updates locally.

```bash
npm test
npm run build
npx playwright install chromium
npx playwright test
```

To persist plans in Postgres:

```bash
psql "$DATABASE_URL" -f drizzle/0000_init.sql
```
