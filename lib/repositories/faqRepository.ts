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

export async function getFAQs(categorySlug: string): Promise<FAQItem[]> {
  const { getPayload } = await import("payload");
  const config = (await import("@/payload.config")).default;
  const payload = await getPayload({ config });

  const catRes = await payload.find({
    collection: 'categories',
    where: { slug: { equals: categorySlug } },
    limit: 1,
  });

  if (catRes.docs.length > 0) {
    const catId = catRes.docs[0].id;
    const faqRes = await payload.find({
      collection: 'faqs',
      where: { categories: { contains: catId } },
      limit: 50,
    });

    if (faqRes.docs.length > 0) {
      return faqRes.docs.map((doc: any) => ({ q: doc.q, a: doc.a }));
    }
  }
  
  // Fallback to first 3 global FAQs
  const globalFaqs = await getGlobalFAQs();
  return globalFaqs.slice(0, 3);
}
