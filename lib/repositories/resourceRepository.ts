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
    return {
      slug: doc.slug,
      title: doc.title,
      category: categoryLabel,
      excerpt: doc.excerpt,
      image,
      contentPoints: (doc.contentPoints || []).map((p: any) => p.item),
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
    const doc = res.docs[0];
    const image = typeof doc.image === 'object' && doc.image !== null ? (doc.image as any).url || '' : '';
    const categoryLabel = typeof doc.category === 'object' && doc.category !== null ? (doc.category as any).title || '' : '';
    return {
      slug: doc.slug,
      title: doc.title,
      category: categoryLabel,
      excerpt: doc.excerpt,
      image,
      contentPoints: (doc.contentPoints || []).map((p: any) => p.item),
    };
  }
  return undefined;
}
