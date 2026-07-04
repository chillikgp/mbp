# ADR-003: Rendering Strategy (Server vs. Client Components)

## Status
Accepted

## Context
React Client Components require client-side hydration, increasing the JavaScript bundle size transmitted to the browser and delaying the Time to Interactive (TTI) or Interaction to Next Paint (INP). Next.js App Router defaults to Server Components, which render HTML on the server and ship zero client-side React code by default.

## Decision
All layout files, templates, pages, grids, and form structures MUST remain 100% React Server Components. The `"use client"` directive should only be used when client-side React state (`useState`, `useContext`) or hooks are strictly necessary.

Interactivity (such as mobile menu toggling, portfolio image lightbox overlays, and form click trackings) will continue to be handled by a lightweight vanilla JS bundle (`public/assets/site.js`) loaded after hydration. 

## Consequences
- **Minimal JavaScript**: Client bundles contain near-zero framework script overhead, resulting in 100/100 Mobile Lighthouse Performance scores.
- **Immediate Hydration**: Since there is no complex client component tree to hydrate, interactions are snappy.
- **Simplicity**: Code remains straightforward and easily readable by AI agents and new contributors alike.
