import { PhotographyCategory, CategoryChild } from "../types";

export const mapCategory = (doc: any): PhotographyCategory => {
  const heroImage = typeof doc.heroImage === 'object' && doc.heroImage !== null ? (doc.heroImage as any).url || '' : '';
  
  const gallery = (doc.gallery || []).map((item: any) => {
    const image = typeof item.image === 'object' && item.image !== null ? (item.image as any) : null;
    return {
      src: image?.url || '',
      alt: item.alt || '',
      caption: item.caption || '',
      width: image?.width ?? undefined,
      height: image?.height ?? undefined,
    };
  });

  const pricing = (doc.pricing || []).map((pkg: any) => ({
    name: pkg.name,
    price: pkg.price,
    featured: Boolean(pkg.featured),
    includes: (pkg.includes || []).map((i: any) => i.item),
  }));

  const addons = (doc.addons || []).map((a: any) => typeof a === 'object' && a !== null ? a.name || '' : '');
  const testimonials = (doc.testimonials || []).map((t: any) => typeof t === 'object' && t !== null ? t.name || '' : '');
  const related = (doc.related || []).map((r: any) => typeof r === 'object' && r !== null ? r.slug || '' : '');
  
  const children = (doc.childrenDocs || []).map((child: any) => {
    const childHeroImage = typeof child.heroImage === 'object' && child.heroImage !== null ? (child.heroImage as any).url || '' : '';
    return {
      slug: child.slug,
      title: child.title,
      summary: child.summary || '',
      heroImage: childHeroImage,
    };
  });

  const videos = (doc.videos || []).map((v: any) => ({ title: v.title, embed: v.embed || '' }));
  
  const bts = (doc.bts || []).map((b: any) => {
    const btsImg = typeof b.image === 'object' && b.image !== null ? (b.image as any).url || '' : '';
    return {
      title: b.title,
      copy: b.copy,
      image: btsImg,
    };
  });

  return {
    slug: doc.slug,
    title: doc.title,
    label: doc.label,
    eyebrow: doc.eyebrow || '',
    summary: doc.summary || '',
    description: doc.description || '',
    heroImage,
    gallery,
    pricing,
    addons,
    testimonials,
    related,
    children,
    videos,
    bts,
  };
};

export async function getCategories(): Promise<PhotographyCategory[]> {
  const { getPayload } = await import("payload");
  const config = (await import("@/payload.config")).default;
  const payload = await getPayload({ config });

  // Fetch top-level parent categories only
  const res = await payload.find({
    collection: 'categories',
    where: {
      parent: { exists: false },
    },
    limit: 100,
  });

  const list: PhotographyCategory[] = [];
  for (const doc of res.docs) {
    // Fetch children categories for each parent
    const childrenRes = await payload.find({
      collection: 'categories',
      where: { parent: { equals: doc.id } },
      limit: 50,
    });
    (doc as any).childrenDocs = childrenRes.docs;
    list.push(mapCategory(doc));
  }

  // Sort according to user's preferred order: maternity, newborn, milestone, birthday, family, events, festival
  const preferredOrder = [
    "maternity",
    "newborn",
    "milestone",
    "birthday-cake-smash",
    "family-portrait",
    "events",
    "festival"
  ];

  return list.sort((a, b) => {
    let indexA = preferredOrder.indexOf(a.slug);
    let indexB = preferredOrder.indexOf(b.slug);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    return indexA - indexB;
  });
}

export async function getCategoryBySlug(slug: string): Promise<PhotographyCategory | undefined> {
  const { getPayload } = await import("payload");
  const config = (await import("@/payload.config")).default;
  const payload = await getPayload({ config });

  const res = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  });

  if (res.docs.length > 0) {
    const doc = res.docs[0];
    // Fetch children
    const childrenRes = await payload.find({
      collection: 'categories',
      where: { parent: { equals: doc.id } },
      limit: 50,
    });
    (doc as any).childrenDocs = childrenRes.docs;
    return mapCategory(doc);
  }
  return undefined;
}

export async function getCategoryChild(parentSlug: string, childSlug: string): Promise<{ parent: PhotographyCategory; child: CategoryChild } | undefined> {
  const parent = await getCategoryBySlug(parentSlug);
  if (!parent) return undefined;
  
  const child = parent.children?.find((c) => c.slug === childSlug);
  if (!child) return undefined;
  
  return { parent, child };
}
