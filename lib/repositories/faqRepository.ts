import { FAQItem } from "../types";

export async function getGlobalFAQs(): Promise<FAQItem[]> {
  const { getPayload } = await import("payload");
  const config = (await import("@/payload.config")).default;
  const payload = await getPayload({ config });
  
  const res = await payload.find({
    collection: 'faqs',
    where: {
      and: [
        { categories: { exists: false } },
        { products: { exists: false } },
      ],
    },
    limit: 100,
  });

  return res.docs.map((doc: any) => ({ q: doc.q, a: doc.a }));
}

export async function getFAQs(categorySlug: string, childSlug?: string): Promise<FAQItem[]> {
  const { getPayload } = await import("payload");
  const config = (await import("@/payload.config")).default;
  const payload = await getPayload({ config });

  async function faqsForSlug(slug: string): Promise<FAQItem[]> {
    const catRes = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
    });

    if (catRes.docs.length === 0) return [];

    const catId = catRes.docs[0].id;
    const faqRes = await payload.find({
      collection: 'faqs',
      where: { categories: { contains: catId } },
      limit: 50,
    });

    return faqRes.docs.map((doc: any) => ({ q: doc.q, a: doc.a }));
  }

  // Prefer FAQs linked directly to the child category (e.g. janmashtami)
  // over the shared parent (e.g. festival), so a subcategory can carry its
  // own specific Q&A without leaking onto every sibling subcategory.
  if (childSlug) {
    const childFaqs = await faqsForSlug(childSlug);
    if (childFaqs.length > 0) return childFaqs;
  }

  const parentFaqs = await faqsForSlug(categorySlug);
  if (parentFaqs.length > 0) return parentFaqs;

  // Fallback to first 3 global FAQs
  const globalFaqs = await getGlobalFAQs();
  return globalFaqs.slice(0, 3);
}
