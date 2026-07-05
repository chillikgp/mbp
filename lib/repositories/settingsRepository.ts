import { SiteSettings } from "../types";
import { SiteSetting as PayloadSiteSetting } from "@/payload-types";

export async function getSiteSettings(): Promise<SiteSettings> {
  const { getPayload } = await import("payload");
  const config = (await import("@/payload.config")).default;
  const payload = await getPayload({ config });
  
  const settings = await payload.findGlobal({
    slug: 'site-settings',
  }) as unknown as PayloadSiteSetting;

  if (!settings || !settings.name) {
    throw new Error("Site settings global is not seeded in the database.");
  }

  const logoUrl = typeof settings.logo === 'object' && settings.logo !== null ? (settings.logo as any).url || '' : '';
  const ogImageUrl = typeof settings.defaultSeo?.ogImage === 'object' && settings.defaultSeo.ogImage !== null ? (settings.defaultSeo.ogImage as any).url || '' : '';
  
  return {
    name: settings.name,
    domain: settings.domain,
    tagline: settings.tagline || '',
    description: settings.description || '',
    phone: settings.phone,
    phoneHref: settings.phoneHref,
    whatsapp: settings.whatsapp,
    email: settings.email,
    address: settings.address,
    instagram: settings.instagram || '',
    youtube: settings.youtube || '',
    logo: logoUrl,
    ogImage: ogImageUrl,
    analyticsId: settings.analyticsId || '',
    rating: settings.rating || '4.9',
    reviewCount: settings.reviewCount || '164',
  };
}
