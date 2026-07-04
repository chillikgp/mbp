# My Baby Pictures CMS Architecture

The production pages are generated from `content/site.json` by `npm run build`.

## Editable Models

- `site`: contact details, social links, brand SEO defaults, analytics ID and trust signals.
- `homepage`: hero, story, homepage resources and featured homepage sections.
- `categories`: all photography category pages, including child pages for Events and Festival Based sessions.
- `pricing`: stored inside each category so package pricing can vary by category.
- `gallery`: reusable media items per category; each item supports image, alt text and caption.
- `videos` and `bts`: optional category blocks for embedded films and behind-the-scenes sections.
- `testimonials`: reusable reviews that can be attached to categories.
- `faqs`: global FAQs plus category-level FAQs.
- `resources`: blog/resource cards and generated resource pages.

## Publishing Workflow

1. Edit `content/site.json`.
2. Set content by adding, reordering or removing objects in the relevant array.
3. Run `npm run build`.
4. Deploy the generated HTML, `assets/`, `images/`, `robots.txt` and `sitemap.xml`.

This structure is intentionally compatible with a later headless CMS. The JSON model can map directly to collections such as Site Settings, Homepage Sections, Categories, Pricing Packages, Portfolio Items, Testimonials, FAQs, Resources and Media.
