import { PhotographyCategory, CategoryChild } from "../types";

const mapMediaUrl = (field: any): string => (typeof field === 'object' && field !== null ? field.url || '' : '');

const mapGallery = (rawGallery: any[]) =>
  (rawGallery || []).map((item: any) => {
    const image = typeof item.image === 'object' && item.image !== null ? (item.image as any) : null;
    return {
      src: image?.url || '',
      alt: item.alt || '',
      caption: item.caption || '',
      width: image?.width ?? undefined,
      height: image?.height ?? undefined,
      theme: item.theme || undefined,
    };
  });

const mapPricing = (rawPricing: any[]) =>
  (rawPricing || []).map((pkg: any) => ({
    name: pkg.name,
    price: pkg.price,
    featured: Boolean(pkg.featured),
    includes: (pkg.includes || []).map((i: any) => i.item),
  }));

const mapAddons = (rawAddons: any[]) =>
  (rawAddons || []).map((a: any) => typeof a === 'object' && a !== null ? a.name || '' : '');

const mapAddonDetails = (rawAddonDetails: any[]) =>
  (rawAddonDetails || []).map((a: any) => ({ name: a.name, price: a.price }));

const mapTestimonialNames = (rawTestimonials: any[]) =>
  (rawTestimonials || []).map((t: any) => typeof t === 'object' && t !== null ? t.name || '' : '');

const mapVideos = (rawVideos: any[]) =>
  (rawVideos || []).map((v: any) => ({
    title: v.title,
    embed: v.embed || '',
    file: mapMediaUrl(v.file) || undefined,
  }));

const mapBts = (rawBts: any[]) =>
  (rawBts || []).map((b: any) => ({
    title: b.title,
    copy: b.copy,
    image: mapMediaUrl(b.image),
  }));

export const mapCategory = (doc: any): PhotographyCategory => {
  const heroImage = mapMediaUrl(doc.heroImage);
  const heroVideo = mapMediaUrl(doc.heroVideo) || undefined;
  const heroVideoPoster = mapMediaUrl(doc.heroVideoPoster) || undefined;
  const ctaBadgeImage = mapMediaUrl(doc.ctaBadgeImage) || undefined;

  const gallery = mapGallery(doc.gallery);
  const pricing = mapPricing(doc.pricing);
  const addons = mapAddons(doc.addons);
  const addonDetails = mapAddonDetails(doc.addonDetails);
  const testimonials = mapTestimonialNames(doc.testimonials);
  const related = (doc.related || []).map((r: any) => typeof r === 'object' && r !== null ? r.slug || '' : '');
  const videos = mapVideos(doc.videos);
  const bts = mapBts(doc.bts);

  const children: CategoryChild[] = (doc.childrenDocs || []).map((child: any) => ({
    slug: child.slug,
    title: child.title,
    summary: child.summary || '',
    description: child.description || undefined,
    heroImage: mapMediaUrl(child.heroImage),
    heroVideo: mapMediaUrl(child.heroVideo) || undefined,
    heroVideoPoster: mapMediaUrl(child.heroVideoPoster) || undefined,
    gallery: mapGallery(child.gallery),
    pricing: mapPricing(child.pricing),
    addons: mapAddons(child.addons),
    addonDetails: mapAddonDetails(child.addonDetails),
    testimonials: mapTestimonialNames(child.testimonials),
    videos: mapVideos(child.videos),
    bts: mapBts(child.bts),
    ctaBadgeImage: mapMediaUrl(child.ctaBadgeImage) || undefined,
    updatedAt: child.updatedAt,
  }));

  return {
    slug: doc.slug,
    title: doc.title,
    label: doc.label,
    eyebrow: doc.eyebrow || '',
    summary: doc.summary || '',
    description: doc.description || '',
    heroImage,
    heroVideo,
    heroVideoPoster,
    gallery,
    pricing,
    addons,
    addonDetails,
    testimonials,
    related,
    children,
    videos,
    bts,
    ctaBadgeImage,
    updatedAt: doc.updatedAt,
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
