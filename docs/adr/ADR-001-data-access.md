# ADR-001: Data Access via Repository Pattern

## Status
Accepted

## Context
The website's content was historically managed via static JSON files (`content/site.json` and `content/products.json`). Directly importing these JSON files into components, pages, or layouts couples the user interface implementation to a specific file-system structure. When we transition to Payload CMS in the future, these JSON files will be replaced by API calls or database queries, which would cause significant breaking changes across the presentation layer.

## Decision
All data access in the Next.js frontend MUST go through the Repository layer located under `lib/repositories/`. 
No React page, layout, template, component, or utility module may import content JSON files directly. 
Instead, they must consume data via repositories such as `settingsRepository`, `categoryRepository`, `productRepository`, `resourceRepository`, `testimonialRepository`, `pricingRepository`, `faqRepository`, and `navigationRepository`.

## Consequences
- **Decoupled Frontend**: The presentation layer remains completely agnostic of the database or CMS details.
- **Payload CMS Readiness**: Integrating Payload CMS in a future phase will only require modifying the implementation of the repository functions, with 0 impact on components, styling, or routing.
- **Mockability**: Content can be easily mocked or cached inside the repository functions for testing.
