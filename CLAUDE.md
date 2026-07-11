# CLAUDE.md

Guidance for working in this repo.

## Project overview

Next.js 16 (App Router) + Payload CMS 3.85 site for "My Baby Pictures," a photography studio. Postgres (Neon) via `@payloadcms/db-postgres`, media on S3 via `@payloadcms/storage-s3`, admin mounted in-process at `app/(payload)/`.

## Commands

- `npm run dev` — Next dev server on port **4173** (not the default 3000)
- `npm run build` / `npm start` — production build/serve
- `npm run seed` — runs `scripts/seed-payload.ts`, which calls `payload.delete()`. **Never run against the production DB** — it destroys real content.

## Architecture invariants (do not violate)

- **Static generation is the deployment model.** Pages use `generateStaticParams()` and are prerendered at build time. No `output: 'export'` (admin + API routes need a real server), but also no `force-dynamic` and no time-based `revalidate` — the app deliberately avoids per-request DB/Payload hits.
- **Cache invalidation is on-demand only**, via Payload `afterChange`/`afterDelete` hooks in `cms/hooks/revalidation.ts` calling `revalidatePath()`. See [docs/cache-strategy.md](docs/cache-strategy.md) for the full collection/global → route mapping. When adding a new collection/global, or a field that changes which routes render its data, update the hook's revalidation scope to match — don't over-invalidate (rebuilds unrelated pages) or under-invalidate (stale content survives edits).
- `revalidatePath()` only works inside a live Next.js request lifecycle — it throws when called from standalone scripts (seed scripts, one-off Local API scripts). Always call it through the guarded `safeRevalidatePath` helper, never bare.
- **URL strategy: no trailing slashes, anywhere** — routes, sitemap, canonical tags, JSON-LD, internal links, redirects. `next.config.mjs` has no `trailingSlash` key; keep it that way. When building absolute URLs, check `path.startsWith("http")` before prepending a domain — this exact double-prefix bug has already been fixed twice (`lib/schema.ts`, and `lib/seo.ts`'s `toAbsoluteUrl` helper). Don't reintroduce it.
- **Media/image data** comes from Payload relationship fields, normalized with the repo-wide pattern `typeof x === 'object' && x !== null ? x.id : x` (or `.url`/`.width`/`.height` for media). Don't assume local filesystem paths — media lives on S3 and URLs are absolute.
- **Portfolio/gallery masonry**: aspect-ratio class comes from real S3-reported `width`/`height` (`lib/image-utils.ts#getAspectRatioClass`), not filesystem probing. Grid CSS relies on `align-items: start` in `public/assets/styles.css` — restoring the default `stretch` reintroduces letterboxing on landscape images.

## Environment gotchas

- zsh: never name a loop variable `path` — it's a special array aliased to `$PATH` and silently breaks command resolution (e.g. `curl` disappears mid-loop). Use a different name (`route`, etc.) in shell one-liners/scripts.

## Working conventions

- Only commit/push when explicitly asked — implement first, wait for the go-ahead to commit.
- Don't run destructive or live-data operations (writes to the production DB, `npm run seed`, killing unfamiliar dev server processes) without explicit authorization each time; ask first.
- When a fix requires both a code change and a live CMS data fix (e.g. seeded content using an old convention), fix the seed script for future reseeds *and* treat the live-data migration as a separate, separately-authorized step.
