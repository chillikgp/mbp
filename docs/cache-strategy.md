# Cache strategy: on-demand ISR

The site is fully statically generated at build time (`next build`, no
`output: 'export'`, no `dynamic = 'force-dynamic'`, no `revalidate = <n>`
anywhere in `app/(app)/`). Content edits in `/admin` don't require a
redeploy — Payload's `afterChange`/`afterDelete` hooks call
`revalidatePath()` directly (in-process, since the admin runs inside the
same Next.js app), which only regenerates the specific routes affected by
that edit. Everything else keeps serving the existing static HTML from
the CDN.

All path-resolution logic lives in [`cms/hooks/revalidation.ts`](../cms/hooks/revalidation.ts).
`revalidatePath()` is wrapped in a try/catch there because it only works
inside a Next.js request lifecycle — CLI flows like `scripts/seed-payload.ts`
call the same hooks outside that context, where it would otherwise throw.

## Collection / global → routes → reason

| Source | Routes revalidated | Reason |
|---|---|---|
| **Homepage** (global) | `/` | Only the home page reads this global. |
| **SiteSettings** (global) | Root layout (`revalidatePath('/', 'layout')`) | Rendered in `Header`/`Footer` inside `app/(app)/layout.tsx`, which wraps every route. Invalidating the layout segment revalidates it — and everything nested under it — in one call instead of listing every route by hand. |
| **Navigation** (global) | Root layout | Same reasoning as SiteSettings — header/footer nav is rendered in the shared layout. |
| **ShopSettings** (global) | `/shop`, every `/shop/[slug]` | `/shop/[slug]` reads `getShopSettings()` directly, and its `faqs` field is the fallback FAQ pool for any product with none of its own. |
| **Products** | `/shop`, `/shop/[slug]` (its own slug) | `/shop` lists all products; only the edited product's own detail page needs to change. |
| **Resources** | `/resources`, `/resources/[slug]` (its own slug) | Same pattern as Products. |
| **Categories** | `/categories/[slug]`, `/portfolio/[slug]`, `/pricing/[slug]` for the doc; `/categories/[parentSlug]` + `/categories/[parentSlug]/[slug]` if it's a child; `/categories/[slug]/[childSlug]` for each child if it's a parent; plus `/`, `/categories`, `/portfolio`, `/pricing`, `/contact`, `/testimonials`; plus root layout | Every one of those listing pages calls `getCategories()` directly (confirmed by reading each page/repository), and the footer nav (root layout) is built from the full category list too. Parent/child pages share data (FAQs, testimonials, related) off the *parent* doc, so editing either needs to invalidate both. |
| **Testimonials** | `/`, `/testimonials`, plus any category (and its parent/children) whose `testimonials` relationship includes this doc | Homepage shows the first 3 testimonials; category pages show only the ones explicitly linked via `Category.testimonials`. |
| **Addons** | Any category (and its parent/children) whose `addons` relationship includes this doc | Addons only ever render as part of a category's page. |
| **FAQs** | Its linked categories'/products' pages directly; if unlinked (a "global" FAQ with no category/product), `/`, `/shop`, plus every category/product that currently has *no FAQs of its own* | `getFAQs()`/`getShopSettings()` fall back to the pool of global FAQs when a category/product has none of its own — a global FAQ edit can affect any of those fallback consumers, not just the homepage. |
| **Media** | *(not tracked — known gap)* | Editing an existing Media doc's file in place doesn't invalidate whatever pages reference it. Doing this precisely would need a reverse-relationship scan across every collection/global that holds a `relationship: 'media'` field (hero images, gallery arrays, logos, OG images). Flagged as a follow-up, not urgent unless editors frequently replace images in place rather than uploading new ones. |
| **Users** | *(none)* | Admin-only; no public page reads this collection. |

## Verifying after a deploy

1. Edit the Homepage hero title in `/admin` → save → refresh `/`. The new
   title should appear on the next request; every other page stays served
   from cache.
2. Edit a product's price in `/admin` → refresh `/shop` and that product's
   `/shop/[slug]`.
3. Edit a testimonial linked to a category → refresh that category's page
   and `/testimonials`.
4. Edit Navigation → refresh any page and confirm the header/footer
   updated (this one touches every route, by design).

If all four pick up the change on the very next request without a
redeploy, the loop is working end to end.
