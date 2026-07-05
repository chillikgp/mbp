import { HomepageData } from "../types";
import { Homepage as PayloadHomepage } from "@/payload-types";
import { mapCategory } from "./categoryRepository";

export async function getHomepage(): Promise<HomepageData> {
  const { getPayload } = await import("payload");
  const config = (await import("@/payload.config")).default;
  const payload = await getPayload({ config });
  
  const data = await payload.findGlobal({
    slug: 'homepage',
  }) as unknown as PayloadHomepage;

  if (!data || !data.hero) {
    throw new Error("Homepage global is not seeded in the database.");
  }

  const heroImgUrl = typeof data.hero.image === 'object' && data.hero.image !== null ? (data.hero.image as any).url || '' : '';
  const storyImgUrl = typeof data.story?.image === 'object' && data.story.image !== null ? (data.story.image as any).url || '' : '';
  
  // Map featured resources from relationship field
  const resourceTitles = (data.resources || []).map((r: any) => {
    return typeof r === 'object' && r !== null ? r.title || '' : '';
  }).filter(Boolean);

  // Map featured categories from relationship field with their children categories
  const homepageCategories: any[] = [];
  if (data.categories && data.categories.length > 0) {
    for (const catDoc of data.categories) {
      const doc = typeof catDoc === 'object' ? catDoc : null;
      if (doc) {
        // Fetch children categories for each parent
        const childrenRes = await payload.find({
          collection: 'categories',
          where: { parent: { equals: doc.id } },
          limit: 50,
        });
        (doc as any).childrenDocs = childrenRes.docs;
        homepageCategories.push(mapCategory(doc));
      }
    }
  }

  return {
    seo: {
      title: data.seo?.title || '',
      description: data.seo?.description || '',
    },
    hero: {
      eyebrow: data.hero.eyebrow,
      title: data.hero.title,
      copy: data.hero.copy,
      image: heroImgUrl,
      primaryCta: data.hero.primaryCta || undefined,
      secondaryCta: data.hero.secondaryCta || undefined,
      stats: (data.hero.stats || []).map(s => ({ value: s.value, label: s.label })),
      trust: (data.hero.trust || []).map(t => t.item),
    },
    story: {
      eyebrow: data.story?.eyebrow || '',
      title: data.story?.title || '',
      copy: data.story?.copy || '',
      image: storyImgUrl,
      points: (data.story?.points || []).map(p => p.item),
    },
    resources: resourceTitles,
    categories: homepageCategories.length > 0 ? homepageCategories : undefined,
  };
}
