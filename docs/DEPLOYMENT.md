# Deployment — Neon Postgres + Vercel (zero-config)

This runbook deploys the Nomenclator backend as a **single Vercel Function** with a
**Neon Postgres** database. It follows the serverless-deploy spec (REQ-SD-1..4) and
design decisions D1-D4.

## How it works (what you get out of the box)

- **Zero-config single Function**: Vercel detects NestJS from the `@nestjs/core`
  dependency, builds with `npm run build` (`nest build`), and boots the compiled
  `dist/main.js` from the conventional `bootstrap()` in `src/main.ts` — the same
  entrypoint used locally. **No `vercel.json` and no `serverless-http` wrapper.**
- **Do NOT add a `vercel.json` with `"framework": null`** — that override disables
  NestJS detection and breaks the deployment. If you need per-function settings
  later (e.g. `maxDuration`), configure them in the Vercel project settings or in a
  `vercel.json` that does NOT set `framework`.
- **Runtime DB**: `DATABASE_URL` (pooled, `-pooler` host) with `ssl: true` and a
  tiny pool (`max: 5`, `connectionTimeoutMillis: 10000`) — see
  `src/config/database.config.ts` (D2).
- **Migrations**: run manually against the **direct** (non-pooler) endpoint via
  `DIRECT_DATABASE_URL` — never `synchronize` in production (REQ-SD-3).
- **Environment discrimination**: Vercel forces `NODE_ENV=production` on every
  deployment, including previews. The app gates Swagger on `VERCEL_ENV` instead
  (`src/config/environment.config.ts`, D3, REQ-SD-4).

## Prerequisites

- Node.js >= 20 (see `engines` in `package.json`) and npm.
- A [Vercel](https://vercel.com) account.
- A [Neon](https://neon.tech) account (free tier is fine).

---

## Step 1 — Create the Neon project and get both URLs

1. Create a project in the Neon console. Pick a region close to your Vercel
   function region (e.g. `us-east-1`) to keep latency low.
2. Neon exposes **two** connection strings for the same database:

   | URL | Where it points | Used for |
   |---|---|---|
   | `DATABASE_URL` | `...-pooler.neon.tech/...` | Runtime (pooled via PgBouncer) |
   | `DIRECT_DATABASE_URL` | `...neon.tech/...` (no `-pooler`) | Migrations (DDL) |

   The pooled endpoint breaks DDL (PgBouncer transaction mode), so migrations MUST
   use the direct endpoint. Copy both strings now.

3. Keep them out of git: only `.env.example` is committed. Never commit the real
   `.env`.

---

## Step 2 — Run the initial migration (once, against the direct URL)

From the repo root:

```bash
# Option A — npm script (recommended; flag order is already correct):
DIRECT_DATABASE_URL=postgres://user:pass@host.neon.tech/db npm run migration:run

# Option B — long form (note: -r is a NODE flag and MUST precede the script path;
# putting it after node_modules/typeorm/cli.js silently skips ts-node and the
# .ts data source will not load):
DIRECT_DATABASE_URL=postgres://user:pass@host.neon.tech/db \
  node -r ts-node/register node_modules/typeorm/cli.js migration:run -d src/data-source.ts
```

`src/data-source.ts` reads `DIRECT_DATABASE_URL` (with `DATABASE_URL_DIRECT` as an
accepted alias) and falls back to `DATABASE_URL`; it also loads a local `.env` via
dotenv, so `DIRECT_DATABASE_URL` can live there instead of inline.

What it does (src/migrations/1753000000000-InitSchema.ts):

- Creates `users`, `postals`, `likes`, `saved_items` with their unique/FK
  constraints (CASCADE) and the `saved_items_item_type_enum` type.
- Seeds the 4 catalog postals (p3/p5/p7/p9) with `ON CONFLICT DO NOTHING`, so
  re-running is idempotent.

Verify the schema:

```bash
# 4 tables + 1 enum
psql "$DIRECT_DATABASE_URL" -c '\dt'
# 4 seeded postals
psql "$DIRECT_DATABASE_URL" -c 'SELECT id FROM postals;'
```

### Rollback of the migration

```bash
DIRECT_DATABASE_URL=postgres://user:pass@host.neon.tech/db npm run migration:revert
```

`down()` drops the tables in reverse order (constraints first). This reverts the
schema but does NOT drop the database itself.

---

## Step 3 — Set environment variables in Vercel

Project → Settings → Environment Variables:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | Neon **pooled** URL (`-pooler`) | Required at runtime |
| `JWT_SECRET` | same value used locally | Required; sign JWTs with it |
| `DIRECT_DATABASE_URL` | Neon **direct** URL (optional) | Only needed if you run `vercel env pull` and migrations from your machine |

Do NOT define `PORT` or `VERCEL_ENV` — the platform injects `PORT` and sets
`VERCEL_ENV` per deployment (`production` / `preview` / `development`).

---

## Step 4 — Deploy

From Git (recommended): push the branch and import the repo at
[vercel.com/new](https://vercel.com/new). Vercel detects NestJS automatically:

- Build command: `nest build` (from the `build` script)
- Output directory: `dist`
- Runtime: single Vercel Function on Fluid compute

From the CLI (alternative):

```bash
npx vercel            # preview deployment
npx vercel --prod     # promote to production
```

No `vercel.json` is required (REQ-SD-1). `start:prod` (`node dist/main`) mirrors
what the platform runs after the build.

---

## Step 5 — Post-deploy verification

Against the deployment URL (`https://<project>.vercel.app`):

| Check | Command | Expected |
|---|---|---|
| Health (incl. DB) | `curl -i https://<project>.vercel.app/api/health` | `200` |
| Catalog seeded | `curl -s https://<project>.vercel.app/api/postals` | `{"statusCode":200,"data":[...4 rows...]}` |
| Swagger (preview) | `curl -o /dev/null -w '%{http_code}' https://<preview-url>/api/docs` | `200` on previews (`VERCEL_ENV=preview`) |
| Swagger (production) | `curl -o /dev/null -w '%{http_code}' https://<project>.vercel.app/api/docs` | `404` (`VERCEL_ENV=production`, REQ-SD-4) |
| Guest auth idempotent | `POST /api/auth/guest` twice with the same `{"deviceId": "<uuid>"}` | 2× `200` with `access_token`, only 1 user row |
| Like flow | `PUT /api/postals/p3/like` with `Authorization: Bearer <token>` | `200` `{"statusCode":200,"data":{"liked":true}}` |

### Rollback of a deployment

Use Vercel **Instant Rollback** (Deployments tab) to restore the previous
deployment; environment variables stay intact. Schema rollback is Step 2's
`migration:revert`.

---

## Cold starts (expected behavior — not a bug)

- Neon scales the compute to zero after ~5 minutes of idle. The first request
  after idle pays a wake-up latency on top of the serverless cold start.
- The runtime pool is sized to absorb it: `connectionTimeoutMillis: 10000`
  (`connect_timeout=10`) gives the connection 10 s to wake the compute, and with
  Vercel's Fluid compute the function default `maxDuration` is 300 s on all plans
  (Hobby included), so there is ample headroom.
- Expect the first request after idle to take a few extra seconds; subsequent
  requests return to normal latency.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `migration:run` fails with a PgBouncer/DDL error | You used the pooled URL. Re-run with `DIRECT_DATABASE_URL` (non-pooler). |
| Tables appear but seed is missing | Migration was interrupted mid-run; re-run `npm run migration:run` — the seed uses `ON CONFLICT DO NOTHING` and is idempotent. |
| Swagger missing on a preview | Check `VERCEL_ENV` in the deployment's runtime logs; it must be `preview`, not `production`. `NODE_ENV` is always `production` on Vercel. |
| Schema changed on boot in production | `synchronize` must stay off. `src/config/database.config.ts` sets it from `NODE_ENV`, which Vercel forces to `production` — do not override `NODE_ENV`. |