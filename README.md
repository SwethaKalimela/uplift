# uplift
Plan npm dependency upgrades from a package.json — patch, minor, major, advisories, and a shareable install plan.
# Uplift

Plan npm dependency upgrades from a `package.json` — patch, minor, major, advisories, and a shareable install plan.

`npm outdated` stops at version numbers. Uplift looks up each dependency on the public npm registry, classifies the bump, flags deprecations and security advisories, and turns the result into a plan you can copy or share. When a package points at GitHub, release notes come from the GitHub releases API.

## What it does

- Paste, drop, or load a sample `package.json`
- Scan every dependency against live npm metadata
- Filter by patch / minor / major, deprecated, or risky (advisories or deprecated)
- Open a package for downloads, advisories, and release notes
- Add packages to a working plan, copy `npm install` commands, and share a read-only plan URL

There is no login.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click a sample project.

Optional `.env.local`:

```
GITHUB_TOKEN=
DATABASE_URL=
```

`GITHUB_TOKEN` raises the GitHub rate limit (60 unauthenticated requests per hour otherwise). `DATABASE_URL` (Neon or any Postgres) persists shared plans. Without it, saved plans live in memory for the current server process.

To persist plans in Postgres:

```bash
psql "$DATABASE_URL" -f drizzle/0000_init.sql
```

## Tests

```bash
npm test
npm run build
npx playwright install chromium
npx playwright test
```

## Stack

Next.js App Router, TanStack Query, Zustand, Tailwind, Drizzle.
