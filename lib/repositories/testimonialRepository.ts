import { Testimonial } from "../types";

export async function getTestimonials(): Promise<Testimonial[]> {
  const { getPayload } = await import("payload");
  const config = (await import("@/payload.config")).default;
  const payload = await getPayload({ config });
  
  const res = await payload.find({
    collection: 'testimonials',
    limit: 100,
  });

  return res.docs.map((doc: any) => ({
    name: doc.name,
    rating: doc.rating,
    quote: doc.quote,
    category: typeof doc.category === 'object' && doc.category !== null ? (doc.category as any).slug || '' : '',
  }));
}

export async function getTestimonialsByNames(names: string[]): Promise<Testimonial[]> {
  if (!names || names.length === 0) return await getTestimonials();

  const { getPayload } = await import("payload");
  const config = (await import("@/payload.config")).default;
  const payload = await getPayload({ config });
  
  const res = await payload.find({
    collection: 'testimonials',
    where: {
      name: { in: names },
    },
    limit: 100,
  });

  return res.docs.map((doc: any) => ({
    name: doc.name,
    rating: doc.rating,
    quote: doc.quote,
    category: typeof doc.category === 'object' && doc.category !== null ? (doc.category as any).slug || '' : '',
  }));
}
