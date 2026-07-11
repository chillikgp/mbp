import { Resource } from "../types";

export async function getResources(): Promise<Resource[]> {
  const { getPayload } = await import("payload");
  const config = (await import("@/payload.config")).default;
  const payload = await getPayload({ config });

  const res = await payload.find({
    collection: 'resources',
    limit: 100,
  });

  return res.docs.map((doc: any) => {
    const image = typeof doc.image === 'object' && doc.image !== null ? (doc.image as any).url || '' : '';
    const categoryLabel = typeof doc.category === 'object' && doc.category !== null ? (doc.category as any).title || '' : '';
    const categorySlug = typeof doc.category === 'object' && doc.category !== null ? (doc.category as any).slug || '' : '';
    return {
      slug: doc.slug,
      title: doc.title,
      category: categoryLabel,
      categorySlug,
      excerpt: doc.excerpt,
      image,
      contentPoints: (doc.contentPoints || []).map((p: any) => p.item),
      content: doc.content || undefined,
      gallery: (doc.gallery || []).map((item: any) => {
        const galleryImage = typeof item.image === 'object' && item.image !== null ? (item.image as any) : null;
        return {
          src: galleryImage?.url || '',
          alt: item.alt || '',
          caption: item.caption || '',
          width: galleryImage?.width ?? undefined,
          height: galleryImage?.height ?? undefined,
        };
      }),
      faqs: (doc.faqs || []).map((f: any) => ({ q: f.q, a: f.a })),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  });
}

export async function getResourceBySlug(slug: string): Promise<Resource | undefined> {
  const { getPayload } = await import("payload");
  const config = (await import("@/payload.config")).default;
  const payload = await getPayload({ config });

  const res = await payload.find({
    collection: 'resources',
    where: { slug: { equals: slug } },
    limit: 1,
  });

  if (res.docs.length > 0) {
    const doc: any = res.docs[0];
    const image = typeof doc.image === 'object' && doc.image !== null ? (doc.image as any).url || '' : '';
    const categoryLabel = typeof doc.category === 'object' && doc.category !== null ? (doc.category as any).title || '' : '';
    const categorySlug = typeof doc.category === 'object' && doc.category !== null ? (doc.category as any).slug || '' : '';
    return {
      slug: doc.slug,
      title: doc.title,
      category: categoryLabel,
      categorySlug,
      excerpt: doc.excerpt,
      image,
      contentPoints: (doc.contentPoints || []).map((p: any) => p.item),
      content: doc.content || undefined,
      gallery: (doc.gallery || []).map((item: any) => {
        const galleryImage = typeof item.image === 'object' && item.image !== null ? (item.image as any) : null;
        return {
          src: galleryImage?.url || '',
          alt: item.alt || '',
          caption: item.caption || '',
          width: galleryImage?.width ?? undefined,
          height: galleryImage?.height ?? undefined,
        };
      }),
      faqs: (doc.faqs || []).map((f: any) => ({ q: f.q, a: f.a })),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
  return undefined;
}
