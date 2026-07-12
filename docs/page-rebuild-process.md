# Rebuilding a category page: process and guardrails

This documents the process used to rebuild the maternity category/portfolio
experience (2026-07-12), and the guardrails to follow when repeating it for
another category. Read this *before* letting an agent (Claude, Gemini, or
otherwise) rework a category page — most of the pitfalls below caused a real
incident on the maternity rebuild and cost significant rework.

## The four layers a category rebuild touches

1. **Content data** — `content_backup/site.json` (outside the repo, linked
   in via the untracked `content` symlink) and the Payload DB via
   `scripts/seed-payload.ts`. This is where gallery order, pricing packages,
   `addonDetails`, and FAQs live.
2. **CMS schema** — `cms/collections/*.ts`. Only touch this if the content
   layer needs a genuinely new field. Check here first before assuming a
   field needs adding — `addonDetails` already existed on `Categories`
   before this rebuild.
3. **Live templates** — `components/templates/PhotographyCategoryTemplate.tsx`
   and `PortfolioTemplate.tsx`, plus the metadata/schema blocks in
   `app/(app)/categories/[slug]/page.tsx` and `app/(app)/portfolio/[slug]/page.tsx`.
   Category-specific sections must be gated by `slug === "<category>"`
   (see `isMaternity` in the template) so other categories are untouched.
4. **Legacy static parity harness** — `scripts/build-site.mjs` (regenerates
   the legacy static HTML/sitemap ground truth) and
   `scripts/compare-routes.mjs` (diffs it against the live Next.js output).
   This exists purely as a regression safety net; it is not part of the
   deployed app.

## Guardrails (each one caused a real problem this round)

- **Never touch `trailingSlash` in `next.config.mjs`.** CLAUDE.md documents
  "no trailing slashes, anywhere" as a hard architecture invariant — it's
  been broken and fixed twice already in `lib/schema.ts` and `lib/seo.ts`.
  Setting `trailingSlash: true` looks like a quick fix for one failing
  route, but it changes canonical URLs, JSON-LD URLs, and links on *every*
  page site-wide, not just the category being rebuilt. If parity checks
  fail on a URL/trailing-slash mismatch, the bug is almost always in how a
  specific link/canonical is built (check `toAbsoluteUrl` in `lib/seo.ts`
  for the `path.startsWith("http")` double-prefix guard), not in the global
  Next.js config.
- **Never weaken `compare-routes.mjs` to make a failing check pass.**
  If parity checking starts failing broadly after a change, that is a
  signal to revert the change, not to add normalization that strips away
  the exact thing that's failing (e.g. `.replace(/\/$/, "")`) or to scope
  strict checks to only the category you're working on (e.g. gating FAQ
  schema strictness to `path.includes("/maternity")`). A parity script that
  only strictly checks the page you just built isn't verifying anything.
- **Scope all changes to the target category via an explicit slug check.**
  Every category-specific branch in the template/page files should read
  `category.slug === "<slug>"` and leave the `else` path byte-for-byte
  identical to before. If a diff touches HTML/routes for categories you
  weren't asked to change, stop and figure out why before proceeding.
- **A stale dev server invalidates every verification you run against it.**
  `npm run dev` binds port 4173 and a Payload/Postgres connection that
  survives across unrelated `next.config.mjs`/code edits. If you change
  `next.config.mjs`, the running dev server is still serving the *old*
  config until restarted — any parity check run against it is testing
  stale state. Restart it (`kill <pid>` then `npm run dev`, after checking
  `lsof -i :4173` for who's holding the port) any time you change config,
  and confirm with the user first per CLAUDE.md's "don't kill unfamiliar
  dev server processes without asking" rule.
- **Verify claims independently before writing them in a walkthrough.**
  Re-run `npm run build` and `node scripts/compare-routes.mjs` yourself
  against a freshly restarted server and read the actual pass/fail counts
  — don't report a prior run's numbers, and don't report a file as
  "modified" without checking `git diff`/`git log` on it first.
- **`content_backup/` lives outside the repo** (`../content_backup` from
  `mbp/`, linked via the untracked `content` symlink). It was deliberately
  removed from the repo during the Payload migration ("Remove legacy JSON
  content/ files"). This means the legacy build/parity tooling depends on
  a directory that isn't versioned and won't exist on a fresh clone or in
  CI — acceptable for now since it's a local-only safety net, but don't
  assume it's portable.
- **Raw/unprocessed source images don't belong in the repo.** Keep them in
  a directory outside the repo, or gitignore them (see `/maternity images/`
  in `.gitignore`) — only the renamed, sized, web-ready files under
  `public/images/<category>/` should be tracked.

## Verification checklist (run all of these yourself, don't trust a prior run)

1. `npm run build` — full production build, confirm exit 0 and no route
   missing from the printed route tree.
2. Confirm the dev server on :4173 is running the code you just built
   (restart it if you touched `next.config.mjs` or anything it reads at
   startup).
3. `node scripts/compare-routes.mjs` — read the actual printed pass/fail
   counts and the full list of failing routes, not just the summary line.
4. Manually load `/categories/<slug>`, `/portfolio/<slug>`, and
   `/contact?category=<slug>` in a browser: check gallery count, pricing
   packages, add-ons table (if any), and that the inquiry form preselects
   the category.
5. Diff `git status`/`git diff --stat` against the list of files you
   *intended* to touch. Anything outside that list (especially files for
   other categories) needs an explanation before it ships.
