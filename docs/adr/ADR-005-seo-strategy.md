# ADR-005: SEO and Metadata Strategy

## Status
Accepted

## Context
Search rankings are a primary driver of client acquisition for the photography studio. Any regression in page title, description, Open Graph tags, canonical URLs, or JSON-LD structured schemas could negatively impact SEO performance and page rankings.

## Decision
1. **Metadata API**: All pages MUST construct their HTML head fields using Next.js standard `generateMetadata()` page exporter, consuming the centralized `buildMetadata()` helper from `lib/seo.ts`. This dynamically creates:
   - `<title>`
   - `<meta name="description">`
   - Canonical `<link rel="canonical" href="...">`
   - Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`)
   - Twitter card tags
2. **JSON-LD Schema Injection**: Structured schemas (e.g. `LocalBusiness`, `FAQPage`, `Product`, `Service`) are constructed in `lib/schema.ts` and rendered inline as JSON script blocks within the Server Page components.
3. **Parity Enforcement**: The canonical URL structure MUST preserve the trailing slash convention (e.g., `/categories/maternity/`), matched by the Next.js routing structure. Legacy `.html` routes must be permanently redirected (301 redirects) to clean endpoints inside `next.config.mjs` to preserve search authority.

## Consequences
- **100% SEO Parity**: Automating checks with `compare-routes.mjs` guarantees zero meta or head-tag regressions.
- **Dynamic Sitemap**: `app/sitemap.ts` and `app/robots.ts` dynamically generate current indexes from repositories, ensuring Google Search Console indexes pages accurately.
