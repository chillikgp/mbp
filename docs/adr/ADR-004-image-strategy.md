# ADR-004: Image Strategy

## Status
Accepted

## Context
High-resolution images are the core of a photography portfolio website. Improperly sized images lead to large payloads, poor performance, and layout shifts (Cumulative Layout Shift) when images load. In the legacy static builder, image dimensions were parsed from files at build time to add aspect ratio utility classes ("portrait", "landscape", "square") to gallery layouts.

## Decision
1. **Dimension Detection**: Image sizes are resolved at build time using the server-only `getImageSize()` helper in `lib/image-utils.ts` by reading the binary headers of JPG/PNG files directly from `public/images/`.
2. **Layout Classes**: The aspect ratio class is calculated using `getImageAspectRatioClass()` and injected into dynamic masonry/grid blocks (`PortfolioGrid.tsx`) to avoid structural layout shifting.
3. **Image Component**: Visual presentation relies on our custom `ResponsiveImage` and `GalleryImage` primitives which render standard, semantic picture/img elements styled with flexible viewport dimensions.
4. **No Tailwind / Next Image**: We maintain layout styling via the existing Vanilla CSS framework (`public/assets/styles.css`) to match legacy design perfectly. Next.js `next/image` is deferred to a future performance-specific milestone to keep the CSS footprint light and predictable.

## Consequences
- **Build-Time Extraction**: No runtime image inspection. Image size mappings are cached in memory during static exports.
- **Perfect Visual Parity**: Aspect-ratio grids align identically to the legacy layout.
- **Cumulative Layout Shift = 0**: Elements are reserved with proper aspect boxes prior to images loading.
