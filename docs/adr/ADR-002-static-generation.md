# ADR-002: Static Generation (generateStaticParams)

## Status
Accepted

## Context
My Baby Pictures is a content-focused business website requiring near-instant load times, high SEO performance, and low hosting costs. Relying on Server-Side Rendering (SSR) for every request would increase load times, add server compute costs, and introduce potential database query bottlenecks.

## Decision
All dynamic routes—including portfolios, photography categories, subcategories, product detail pages, pricing details, and resource guides—MUST be statically pre-rendered at build time. 
We enforce this by exporting `generateStaticParams()` on every dynamic route file under `app/`:
- `app/categories/[slug]/page.tsx`
- `app/categories/[slug]/[childSlug]/page.tsx`
- `app/portfolio/[slug]/page.tsx`
- `app/pricing/[slug]/page.tsx`
- `app/shop/[slug]/page.tsx`
- `app/resources/[slug]/page.tsx`

Additionally, because we do not have dynamic users or real-time comments, dynamic data fetching is not required on the client. 

## Consequences
- **Static Assets**: Build output consists of raw HTML and JSON files, allowing hosting on global CDNs.
- **Fast TTFB**: Time-to-First-Byte is reduced to the network latency of the CDN edge, matching or exceeding the original static site generator's performance.
- **Incremental builds**: Future content changes in the CMS can trigger standard static rebuilds or on-demand revalidation.
