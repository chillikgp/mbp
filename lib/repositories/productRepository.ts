import { Product, ShopSettings } from "../types";

export async function getShopSettings(): Promise<ShopSettings> {
  const { getPayload } = await import("payload");
  const config = (await import("@/payload.config")).default;
  const payload = await getPayload({ config });

  const data = await payload.findGlobal({
    slug: 'shop-settings',
  }) as any;

  if (!data || !data.hero) {
    throw new Error("Shop settings global is not seeded in the database.");
  }

  const heroImg = typeof data.hero.image === 'object' && data.hero.image !== null ? (data.hero.image as any).url || '' : '';
  
  // Query global shop FAQs (faqs where products and categories are empty)
  const faqRes = await payload.find({
    collection: 'faqs',
    where: {
      and: [
        { categories: { exists: false } },
        { products: { exists: false } },
      ],
    },
    limit: 100,
  });

  const faqs = faqRes.docs.map((doc: any) => ({ q: doc.q, a: doc.a }));

  return {
    seo: {
      title: data.seo?.title || '',
      description: data.seo?.description || '',
    },
    hero: {
      eyebrow: data.hero.eyebrow,
      title: data.hero.title,
      copy: data.hero.copy,
      image: heroImg,
    },
    why: (data.why || []).map((w: any) => w.item),
    faqs,
  };
}

const mapProduct = async (doc: any, payload: any): Promise<Product> => {
  const heroImage = typeof doc.heroImage === 'object' && doc.heroImage !== null ? (doc.heroImage as any).url || '' : '';
  
  const gallery = (doc.gallery || []).map((item: any) => ({
    src: typeof item.image === 'object' && item.image !== null ? (item.image as any).url || '' : '',
    alt: item.alt || '',
  }));
  
  // Fetch FAQs linked to this product
  const faqRes = await payload.find({
    collection: 'faqs',
    where: { products: { contains: doc.id } },
    limit: 50,
  });
  
  let productFaqs = faqRes.docs.map((f: any) => ({ q: f.q, a: f.a }));
  if (productFaqs.length === 0) {
    const shopSettings = await getShopSettings();
    productFaqs = shopSettings.faqs;
  }

  const variants = (doc.variants || []).map((v: any) => ({
    name: v.name,
    key: v.key,
    options: (v.options || []).map((opt: any) => ({ label: opt.label, price: opt.price })),
  }));

  const personalizationFields = (doc.personalizationFields || []).map((p: any) => ({
    label: p.label,
    key: p.key,
    placeholder: p.placeholder || '',
  }));

  return {
    slug: doc.slug,
    name: doc.name,
    startingPrice: doc.startingPrice,
    priceLabel: doc.priceLabel,
    summary: doc.summary,
    shortDescription: doc.shortDescription,
    heroImage,
    gallery,
    rating: doc.rating || '4.9',
    reviewCount: doc.reviewCount || 0,
    details: (doc.details || []).map((d: any) => d.item),
    howItWorks: (doc.howItWorks || []).map((h: any) => h.item),
    included: (doc.included || []).map((i: any) => i.item),
    reviews: (doc.reviews || []).map((r: any) => ({ name: r.name, quote: r.quote })),
    faqs: productFaqs,
    variants,
    personalizationFields,
    updatedAt: doc.updatedAt,
    upload: {
      min: doc.upload?.min || 1,
      max: doc.upload?.max || 12,
      multiple: doc.upload?.multiple !== false,
      guidance: doc.upload?.guidance || '',
    },
  };
};

export async function getProducts(): Promise<Product[]> {
  const { getPayload } = await import("payload");
  const config = (await import("@/payload.config")).default;
  const payload = await getPayload({ config });

  const res = await payload.find({
    collection: 'products',
    limit: 100,
  });

  const list: Product[] = [];
  for (const doc of res.docs) {
    list.push(await mapProduct(doc, payload));
  }
  return list;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const { getPayload } = await import("payload");
  const config = (await import("@/payload.config")).default;
  const payload = await getPayload({ config });

  const res = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
  });

  if (res.docs.length > 0) {
    return await mapProduct(res.docs[0], payload);
  }
  return undefined;
}
