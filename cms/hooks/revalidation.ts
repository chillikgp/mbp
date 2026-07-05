import type { Payload } from 'payload';
import { revalidatePath } from 'next/cache';

/**
 * revalidatePath() only works inside a Next.js request/response lifecycle.
 * Payload hooks also fire from CLI flows (seed-payload.ts, migrations) that
 * run outside that context, where revalidatePath throws — swallow so those
 * flows keep working.
 */
function safeRevalidatePath(path: string, type?: 'layout' | 'page'): void {
  try {
    revalidatePath(path, type);
  } catch (err) {
    console.warn(`[revalidate] skipped "${path}": ${(err as Error).message}`);
  }
}

export function revalidatePaths(paths: Iterable<string>): void {
  const seen = new Set<string>();
  for (const path of paths) {
    if (seen.has(path)) continue;
    seen.add(path);
    safeRevalidatePath(path);
  }
}

/**
 * SiteSettings and Navigation are rendered by app/(app)/layout.tsx, which
 * wraps every public route. Revalidating the layout at the root segment
 * invalidates it (and everything nested under it) in one call instead of
 * enumerating every route.
 */
export function revalidateRootLayout(): void {
  safeRevalidatePath('/', 'layout');
}

function relId(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'object') return String((value as { id: unknown }).id);
  return String(value);
}

function relIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(relId).filter((id): id is string => Boolean(id));
}

/** Index/listing pages that enumerate the full category list. */
export function categoryListingPaths(): string[] {
  return ['/', '/portfolio', '/pricing', '/contact', '/testimonials'];
}

/**
 * Resolves every route affected by a single category document: its own
 * category/portfolio/pricing pages, its parent's page (if it's a child),
 * and its children's pages (if it's a parent) — since child pages read
 * FAQs/testimonials/related off the *parent* doc.
 */
export async function resolveCategoryPaths(
  payload: Payload,
  category: { id: number | string; slug: string; parent?: unknown }
): Promise<string[]> {
  const paths = new Set<string>();
  paths.add(`/categories/${category.slug}`);
  paths.add(`/portfolio/${category.slug}`);
  paths.add(`/pricing/${category.slug}`);

  const parentId = relId(category.parent);
  if (parentId) {
    const parent = await payload.findByID({ collection: 'categories', id: parentId }).catch(() => null);
    if (parent?.slug) {
      paths.add(`/categories/${parent.slug}`);
      paths.add(`/categories/${parent.slug}/${category.slug}`);
    }
  }

  const childrenRes = await payload
    .find({ collection: 'categories', where: { parent: { equals: category.id } }, limit: 100 })
    .catch(() => ({ docs: [] as Array<{ slug: string }> }));
  for (const child of childrenRes.docs) {
    paths.add(`/categories/${category.slug}/${child.slug}`);
  }

  return Array.from(paths);
}

async function resolveCategoryPathsById(payload: Payload, categoryId: string): Promise<string[]> {
  const category = await payload.findByID({ collection: 'categories', id: categoryId }).catch(() => null);
  if (!category) return [];
  return resolveCategoryPaths(payload, category as any);
}

/** Category IDs that have at least one FAQ of their own (i.e. not relying on the global FAQ fallback). */
async function categoryIdsWithOwnFaqs(payload: Payload): Promise<Set<string>> {
  const res = await payload.find({ collection: 'faqs', where: { categories: { exists: true } }, limit: 500 });
  const ids = new Set<string>();
  for (const faq of res.docs as any[]) {
    for (const id of relIds(faq.categories)) ids.add(id);
  }
  return ids;
}

/** Product IDs that have at least one FAQ of their own (i.e. not relying on the ShopSettings/global FAQ fallback). */
async function productIdsWithOwnFaqs(payload: Payload): Promise<Set<string>> {
  const res = await payload.find({ collection: 'faqs', where: { products: { exists: true } }, limit: 500 });
  const ids = new Set<string>();
  for (const faq of res.docs as any[]) {
    for (const id of relIds(faq.products)) ids.add(id);
  }
  return ids;
}

// ---- Per-collection/global revalidation entry points ----

export async function revalidateCategoryDoc(payload: Payload, doc: { id: number | string; slug: string; parent?: unknown }): Promise<void> {
  const paths = await resolveCategoryPaths(payload, doc);
  revalidatePaths(paths);
  revalidatePaths(categoryListingPaths());
  revalidateRootLayout();
}

export async function revalidateProductDoc(_payload: Payload, doc: { slug: string }): Promise<void> {
  revalidatePaths(['/shop', `/shop/${doc.slug}`]);
}

export async function revalidateResourceDoc(_payload: Payload, doc: { slug: string }): Promise<void> {
  revalidatePaths(['/resources', `/resources/${doc.slug}`]);
}

export async function revalidateTestimonialDoc(payload: Payload, doc: { id: number | string }): Promise<void> {
  const paths = new Set<string>(['/', '/testimonials']);
  const catRes = await payload.find({
    collection: 'categories',
    where: { testimonials: { contains: doc.id } },
    limit: 100,
  });
  for (const cat of catRes.docs as any[]) {
    for (const p of await resolveCategoryPaths(payload, cat)) paths.add(p);
  }
  revalidatePaths(paths);
}

export async function revalidateAddonDoc(payload: Payload, doc: { id: number | string }): Promise<void> {
  const paths = new Set<string>();
  const catRes = await payload.find({
    collection: 'categories',
    where: { addons: { contains: doc.id } },
    limit: 100,
  });
  for (const cat of catRes.docs as any[]) {
    for (const p of await resolveCategoryPaths(payload, cat)) paths.add(p);
  }
  revalidatePaths(paths);
}

export async function revalidateFaqDoc(payload: Payload, doc: { categories?: unknown; products?: unknown }): Promise<void> {
  const paths = new Set<string>();
  const categoryIds = relIds(doc.categories);
  const productIds = relIds(doc.products);

  for (const catId of categoryIds) {
    for (const p of await resolveCategoryPathsById(payload, catId)) paths.add(p);
  }

  if (productIds.length > 0) {
    paths.add('/shop');
    for (const prodId of productIds) {
      const product = await payload.findByID({ collection: 'products', id: prodId }).catch(() => null);
      if (product?.slug) paths.add(`/shop/${product.slug}`);
    }
  }

  if (categoryIds.length === 0 && productIds.length === 0) {
    // Global FAQ (no category/product links): feeds the homepage directly,
    // plus the fallback FAQ pool for any category or product that has none
    // of its own (see getFAQs()/getShopSettings() in lib/repositories).
    paths.add('/');
    paths.add('/shop');

    const [allCategories, allProducts, catIdsWithOwn, prodIdsWithOwn] = await Promise.all([
      payload.find({ collection: 'categories', limit: 200 }),
      payload.find({ collection: 'products', limit: 200 }),
      categoryIdsWithOwnFaqs(payload),
      productIdsWithOwnFaqs(payload),
    ]);

    for (const cat of allCategories.docs as any[]) {
      if (!catIdsWithOwn.has(String(cat.id))) {
        for (const p of await resolveCategoryPaths(payload, cat)) paths.add(p);
      }
    }
    for (const product of allProducts.docs as any[]) {
      if (!prodIdsWithOwn.has(String(product.id)) && product.slug) {
        paths.add(`/shop/${product.slug}`);
      }
    }
  }

  revalidatePaths(paths);
}

export async function revalidateShopSettings(payload: Payload): Promise<void> {
  const paths = new Set<string>(['/shop']);
  const res = await payload.find({ collection: 'products', limit: 200 });
  for (const product of res.docs as any[]) {
    if (product.slug) paths.add(`/shop/${product.slug}`);
  }
  revalidatePaths(paths);
}
