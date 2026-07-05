import { getPayload } from 'payload';
import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
loadEnvConfig(process.cwd());

async function seedMedia(payload: any, relativePath: string, altText: string) {
  const cleanRelativePath = relativePath.replace(/^\//, '');
  const absPath = path.resolve(process.cwd(), 'public', cleanRelativePath);

  if (!fs.existsSync(absPath)) {
    console.warn(`Warning: Media file not found at ${absPath}. Skipping.`);
    return null;
  }

  // Idempotency check: search by alt
  const existing = await payload.find({
    collection: 'media',
    where: {
      alt: { equals: altText },
    },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    console.log(`Media found: "${altText}" already exists. Reusing.`);
    return existing.docs[0];
  }

  console.log(`Uploading media file: ${relativePath}...`);
  const media = await payload.create({
    collection: 'media',
    data: {
      alt: altText,
    },
    filePath: absPath,
  });
  console.log(`Media uploaded successfully: ${media.filename} (ID: ${media.id})`);
  return media;
}

async function run() {
  loadEnvConfig(process.cwd());
  console.log('Loaded DATABASE_URL:', process.env.DATABASE_URL);
  console.log('Initializing Payload Local API for seeding...');
  const config = (await import('../payload.config')).default;
  const payload = await getPayload({ config });

  console.log('Seeding User collection...');
  const adminEmail = 'admin@mybabypictures.in';
  const existingUsers = await payload.find({
    collection: 'users',
    where: {
      email: { equals: adminEmail },
    },
    limit: 1,
  });

  if (existingUsers.docs.length === 0) {
    console.log(`Creating default admin user: ${adminEmail}...`);
    await payload.create({
      collection: 'users',
      data: {
        email: adminEmail,
        password: 'admin-secure-password',
      },
    });
    console.log('Admin user created successfully.');
  } else {
    console.log(`Admin user: ${adminEmail} already exists. Skipping.`);
  }

  // 1. Resolve source directory from command-line arguments
  console.log('Resolving source directory for seed data...');
  const sourceDirArg = process.argv[2];

  if (!sourceDirArg) {
    console.error('\nError: Source directory path is required to seed the database.');
    console.error('Usage: npm run seed -- <path-to-content-directory>\n');
    process.exit(1);
  }

  const sourceDir = path.resolve(process.cwd(), sourceDirArg);
  if (!fs.existsSync(sourceDir)) {
    console.error(`\nError: Specified source directory does not exist: ${sourceDir}\n`);
    process.exit(1);
  }

  const siteJsonPath = path.join(sourceDir, 'site.json');
  const productsJsonPath = path.join(sourceDir, 'products.json');

  if (!fs.existsSync(siteJsonPath)) {
    console.error(`\nError: site.json content not found in source directory: ${siteJsonPath}\n`);
    process.exit(1);
  }
  if (!fs.existsSync(productsJsonPath)) {
    console.error(`\nError: products.json content not found in source directory: ${productsJsonPath}\n`);
    process.exit(1);
  }

  const siteData = JSON.parse(fs.readFileSync(siteJsonPath, 'utf8'));
  const productsData = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));

  const siteSettingsJson = siteData.site;

  // 2. Seeding Core Globals: SiteSettings and Navigation Logo
  console.log('Uploading default media files...');
  const logoMedia = await seedMedia(payload, siteSettingsJson.logo || '/images/mbp-favicon.png', 'My Baby Pictures Logo');
  const faviconMedia = await seedMedia(payload, siteSettingsJson.logo || '/images/mbp-favicon.png', 'My Baby Pictures Favicon');
  const ogMedia = await seedMedia(payload, siteSettingsJson.ogImage || '/images/hero-carousel-1.jpeg', 'My Baby Pictures OG Image');

  console.log('Seeding Site Settings Global...');
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      name: siteSettingsJson.name,
      domain: siteSettingsJson.domain,
      tagline: siteSettingsJson.tagline,
      description: siteSettingsJson.description,
      phone: siteSettingsJson.phone,
      phoneHref: siteSettingsJson.phoneHref,
      whatsapp: siteSettingsJson.whatsapp,
      email: siteSettingsJson.email,
      address: siteSettingsJson.address,
      googleMapsUrl: 'https://maps.google.com',
      rating: String(siteSettingsJson.rating || '4.9'),
      reviewCount: String(siteSettingsJson.reviewCount || '164'),
      analyticsId: siteSettingsJson.analyticsId,
      instagram: siteSettingsJson.instagram,
      youtube: siteSettingsJson.youtube,
      logo: logoMedia ? logoMedia.id : undefined,
      favicon: faviconMedia ? faviconMedia.id : undefined,
      heroCtaLabels: {
        primary: 'Book a Session',
        secondary: 'Explore Categories',
      },
      footerText: {
        copyright: `© ${new Date().getFullYear()} ${siteSettingsJson.name}. All rights reserved.`,
        description: siteSettingsJson.description,
      },
      defaultSeo: {
        title: siteSettingsJson.name + ' | Premium Photography',
        description: siteSettingsJson.description,
        ogImage: ogMedia ? ogMedia.id : undefined,
      },
    },
  });
  console.log('Site Settings Global seeded.');

  // 3. Seed Addons
  console.log('Compiling and seeding Addons collection...');
  const uniqueAddonNames = new Set<string>();
  siteData.categories.forEach((cat: any) => {
    if (cat.addons) {
      cat.addons.forEach((addon: string) => uniqueAddonNames.add(addon));
    }
  });

  const addonMap = new Map<string, any>();
  for (const addonName of uniqueAddonNames) {
    const existing = await payload.find({
      collection: 'addons',
      where: { name: { equals: addonName } },
      limit: 1,
    });

    let addonDoc;
    if (existing.docs.length > 0) {
      addonDoc = existing.docs[0];
    } else {
      addonDoc = await payload.create({
        collection: 'addons',
        data: { name: addonName },
      });
    }
    addonMap.set(addonName, addonDoc.id);
  }
  console.log(`Addons seeded: ${addonMap.size} unique addons registered.`);

  // 4. Seed Testimonials
  console.log('Seeding Testimonials collection...');
  const testimonialMap = new Map<string, any>();
  for (const t of siteData.testimonials) {
    const existing = await payload.find({
      collection: 'testimonials',
      where: {
        and: [
          { name: { equals: t.name } },
          { quote: { equals: t.quote } },
        ],
      },
      limit: 1,
    });

    let tDoc;
    if (existing.docs.length > 0) {
      tDoc = existing.docs[0];
      console.log(`Testimonial for "${t.name}" already exists. Reusing.`);
    } else {
      tDoc = await payload.create({
        collection: 'testimonials',
        data: {
          name: t.name,
          rating: Number(t.rating || 5),
          quote: t.quote,
        },
      });
      console.log(`Created testimonial for "${t.name}".`);
    }
    testimonialMap.set(t.name, tDoc.id);
  }

  // 5. Seed Parent Categories
  console.log('Seeding Categories (Parents)...');
  const categoryMap = new Map<string, any>(); // slug -> ID
  const rawCategories = siteData.categories;

  for (const cat of rawCategories) {
    // Media Uploads
    const heroMedia = await seedMedia(payload, cat.heroImage, `${cat.title} Hero Image`);

    const galleryDocs = [];
    if (cat.gallery) {
      for (let i = 0; i < cat.gallery.length; i++) {
        const item = cat.gallery[i];
        const mediaDoc = await seedMedia(payload, item.src, `${cat.title} Gallery Image ${i + 1}`);
        if (mediaDoc) {
          galleryDocs.push({
            image: mediaDoc.id,
            alt: item.alt || '',
            caption: item.caption || '',
          });
        }
      }
    }

    const btsDocs = [];
    if (cat.bts) {
      for (let i = 0; i < cat.bts.length; i++) {
        const b = cat.bts[i];
        const btsMedia = await seedMedia(payload, b.image, `${cat.title} BTS Image ${i + 1}`);
        if (btsMedia) {
          btsDocs.push({
            title: b.title,
            copy: b.copy,
            image: btsMedia.id,
          });
        }
      }
    }

    // Map relationships
    const linkedAddons = (cat.addons || []).map((addonName: string) => addonMap.get(addonName)).filter(Boolean);
    const linkedTestimonials = (cat.testimonials || []).map((name: string) => testimonialMap.get(name)).filter(Boolean);

    const pricingData = (cat.pricing || []).map((pkg: any) => ({
      name: pkg.name,
      price: pkg.price,
      featured: Boolean(pkg.featured),
      includes: (pkg.includes || []).map((inc: string) => ({ item: inc })),
    }));

    const existingCat = await payload.find({
      collection: 'categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
    });

    const categoryPayload = {
      slug: cat.slug,
      title: cat.title,
      label: cat.label,
      eyebrow: cat.eyebrow,
      summary: cat.summary,
      description: cat.description,
      heroImage: heroMedia ? heroMedia.id : undefined,
      gallery: galleryDocs,
      pricing: pricingData,
      addons: linkedAddons,
      testimonials: linkedTestimonials,
      videos: cat.videos || [],
      bts: btsDocs,
    };

    let catDoc;
    if (existingCat.docs.length > 0) {
      console.log(`Updating parent category: ${cat.slug}...`);
      catDoc = await payload.update({
        collection: 'categories',
        id: existingCat.docs[0].id,
        data: categoryPayload,
      });
    } else {
      console.log(`Creating parent category: ${cat.slug}...`);
      catDoc = await payload.create({
        collection: 'categories',
        data: categoryPayload,
      });
    }
    categoryMap.set(cat.slug, catDoc.id);

    // Link Category back to Testimonials
    for (const tName of (cat.testimonials || [])) {
      const tId = testimonialMap.get(tName);
      if (tId) {
        await payload.update({
          collection: 'testimonials',
          id: tId,
          data: {
            category: catDoc.id,
          },
        });
      }
    }
  }

  // 6. Seed Child Categories
  console.log('Seeding Child Categories...');
  for (const cat of rawCategories) {
    if (cat.children && cat.children.length > 0) {
      const parentId = categoryMap.get(cat.slug);
      for (const child of cat.children) {
        const childHeroMedia = await seedMedia(payload, child.heroImage, `${child.title} Child Hero Image`);

        const existingChild = await payload.find({
          collection: 'categories',
          where: { slug: { equals: child.slug } },
          limit: 1,
        });

        const childPayload = {
          slug: child.slug,
          title: child.title,
          label: `${child.title} Photography`,
          eyebrow: cat.title,
          summary: child.summary,
          description: child.summary,
          parent: parentId,
          heroImage: childHeroMedia ? childHeroMedia.id : undefined,
          gallery: [],
          pricing: [],
          addons: [],
          related: [],
          testimonials: [],
          videos: [],
          bts: [],
        };

        let childDoc;
        if (existingChild.docs.length > 0) {
          console.log(`Updating child category: ${child.slug}...`);
          childDoc = await payload.update({
            collection: 'categories',
            id: existingChild.docs[0].id,
            data: childPayload,
          });
        } else {
          console.log(`Creating child category: ${child.slug}...`);
          childDoc = await payload.create({
            collection: 'categories',
            data: childPayload,
          });
        }
        categoryMap.set(child.slug, childDoc.id);
      }
    }
  }

  // 7. Resolve related categories link
  console.log('Resolving related categories relationships...');
  for (const cat of rawCategories) {
    const parentId = categoryMap.get(cat.slug);
    if (parentId && cat.related) {
      const relatedIds = cat.related.map((rSlug: string) => categoryMap.get(rSlug)).filter(Boolean);
      await payload.update({
        collection: 'categories',
        id: parentId,
        data: {
          related: relatedIds,
        },
      });
    }
  }

  // 8. Seed Products
  console.log('Seeding Products collection...');
  const productMap = new Map<string, any>();
  const rawProducts = productsData.products;

  for (const prod of rawProducts) {
    const heroMedia = await seedMedia(payload, prod.heroImage, `${prod.name} Hero Image`);

    const galleryDocs = [];
    if (prod.gallery) {
      for (let i = 0; i < prod.gallery.length; i++) {
        const item = prod.gallery[i];
        const mediaDoc = await seedMedia(payload, item.src, `${prod.name} Gallery Image ${i + 1}`);
        if (mediaDoc) {
          galleryDocs.push({
            image: mediaDoc.id,
            alt: item.alt || '',
          });
        }
      }
    }

    const existingProduct = await payload.find({
      collection: 'products',
      where: { slug: { equals: prod.slug } },
      limit: 1,
    });

    const productPayload = {
      slug: prod.slug,
      name: prod.name,
      startingPrice: Number(prod.startingPrice),
      priceLabel: prod.priceLabel,
      summary: prod.summary,
      shortDescription: prod.shortDescription,
      heroImage: heroMedia ? heroMedia.id : undefined,
      gallery: galleryDocs,
      rating: String(prod.rating || '4.9'),
      reviewCount: Number(prod.reviewCount || 0),
      details: (prod.details || []).map((d: string) => ({ item: d })),
      howItWorks: (prod.howItWorks || []).map((h: string) => ({ item: h })),
      included: (prod.included || []).map((i: string) => ({ item: i })),
      reviews: prod.reviews || [],
      variants: (prod.variants || []).map((v: any) => ({
        name: v.name,
        key: v.key,
        options: v.options.map((opt: any) => ({ label: opt.label, price: Number(opt.price) })),
      })),
      personalizationFields: prod.personalizationFields || [],
      upload: {
        min: Number(prod.upload.min),
        max: Number(prod.upload.max),
        multiple: Boolean(prod.upload.multiple),
        guidance: prod.upload.guidance,
      },
    };

    let prodDoc;
    if (existingProduct.docs.length > 0) {
      console.log(`Updating product: ${prod.slug}...`);
      prodDoc = await payload.update({
        collection: 'products',
        id: existingProduct.docs[0].id,
        data: productPayload,
      });
    } else {
      console.log(`Creating product: ${prod.slug}...`);
      prodDoc = await payload.create({
        collection: 'products',
        data: productPayload,
      });
    }
    productMap.set(prod.slug, prodDoc.id);
  }

  // 9. Seed FAQs
  console.log('Seeding FAQs collection...');
  // Global FAQs
  for (const faq of siteData.faqs) {
    const existing = await payload.find({
      collection: 'faqs',
      where: { q: { equals: faq.q } },
      limit: 1,
    });

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'faqs',
        data: {
          q: faq.q,
          a: faq.a,
        },
      });
    }
  }

  // Category specific FAQs
  for (const cat of rawCategories) {
    const catId = categoryMap.get(cat.slug);
    if (catId && cat.faqs) {
      for (const faq of cat.faqs) {
        const existing = await payload.find({
          collection: 'faqs',
          where: { q: { equals: faq.q } },
          limit: 1,
        });

        if (existing.docs.length === 0) {
          await payload.create({
            collection: 'faqs',
            data: {
              q: faq.q,
              a: faq.a,
              categories: [catId],
            },
          });
        } else {
          // Link Category to existing FAQ if not already linked
          const faqDoc = existing.docs[0];
          const linkedCats = (faqDoc.categories || []).map((c: any) => typeof c === 'object' ? c.id : c);
          if (!linkedCats.includes(catId)) {
            await payload.update({
              collection: 'faqs',
              id: faqDoc.id,
              data: {
                categories: [...linkedCats, catId],
              },
            });
          }
        }
      }
    }
  }

  // Product specific FAQs
  for (const prod of rawProducts) {
    const prodId = productMap.get(prod.slug);
    if (prodId && prod.faqs) {
      for (const faq of prod.faqs) {
        const existing = await payload.find({
          collection: 'faqs',
          where: { q: { equals: faq.q } },
          limit: 1,
        });

        if (existing.docs.length === 0) {
          await payload.create({
            collection: 'faqs',
            data: {
              q: faq.q,
              a: faq.a,
              products: [prodId],
            },
          });
        } else {
          const faqDoc = existing.docs[0];
          const linkedProds = (faqDoc.products || []).map((p: any) => typeof p === 'object' ? p.id : p);
          if (!linkedProds.includes(prodId)) {
            await payload.update({
              collection: 'faqs',
              id: faqDoc.id,
              data: {
                products: [...linkedProds, prodId],
              },
            });
          }
        }
      }
    }
  }

  // 10. Seed Resources
  console.log('Seeding Resources collection...');
  const resourceMap = new Map<string, any>();
  for (const r of siteData.resources) {
    const existing = await payload.find({
      collection: 'resources',
      where: { slug: { equals: r.slug } },
      limit: 1,
    });

    const resourceImg = await seedMedia(payload, r.image, `${r.title} Image`);

    // Map Category (Maternity -> maternity slug, Newborn -> newborn, Birthday -> birthday-cake-smash)
    let categorySlug = r.category.toLowerCase();
    if (categorySlug === 'birthday') categorySlug = 'birthday-cake-smash';
    const catId = categoryMap.get(categorySlug);

    const resourcePayload = {
      slug: r.slug,
      title: r.title,
      category: catId,
      excerpt: r.excerpt,
      image: resourceImg ? resourceImg.id : undefined,
      contentPoints: [
        { item: 'Choose the right category page before comparing packages.' },
        { item: 'Share baby age, date, theme and location preferences with the studio.' },
        { item: 'Use the inquiry form to confirm current availability and add-ons.' },
      ],
    };

    let rDoc;
    if (existing.docs.length > 0) {
      console.log(`Updating resource: ${r.slug}...`);
      rDoc = await payload.update({
        collection: 'resources',
        id: existing.docs[0].id,
        data: resourcePayload,
      });
    } else {
      console.log(`Creating resource: ${r.slug}...`);
      rDoc = await payload.create({
        collection: 'resources',
        data: resourcePayload,
      });
    }
    resourceMap.set(r.title, rDoc.id);
  }

  // 11. Seed Homepage Global
  console.log('Seeding Homepage Global...');
  const homepageJson = siteData.homepage;
  const homepageHeroMedia = await seedMedia(payload, homepageJson.hero.image, 'Homepage Hero Image');
  const homepageStoryMedia = await seedMedia(payload, homepageJson.story.image, 'Homepage Story Image');

  const featuredResourceIds = (homepageJson.resources || []).map((title: string) => resourceMap.get(title)).filter(Boolean);

  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      seo: {
        title: homepageJson.seo.title,
        description: homepageJson.seo.description,
      },
      hero: {
        eyebrow: homepageJson.hero.eyebrow,
        title: homepageJson.hero.title,
        copy: homepageJson.hero.copy,
        image: homepageHeroMedia ? homepageHeroMedia.id : undefined,
        primaryCta: homepageJson.hero.primaryCta,
        secondaryCta: homepageJson.hero.secondaryCta,
        stats: homepageJson.hero.stats || [],
        trust: (homepageJson.hero.trust || []).map((t: string) => ({ item: t })),
      },
      story: {
        eyebrow: homepageJson.story.eyebrow,
        title: homepageJson.story.title,
        copy: homepageJson.story.copy,
        image: homepageStoryMedia ? homepageStoryMedia.id : undefined,
        points: (homepageJson.story.points || []).map((p: string) => ({ item: p })),
      },
      resources: featuredResourceIds,
    },
  });
  console.log('Homepage Global seeded.');

  // 12. Seed ShopSettings Global
  console.log('Seeding ShopSettings Global...');
  const shopJson = productsData.shop;
  const shopHeroMedia = await seedMedia(payload, shopJson.hero.image, 'Shop Hero Image');

  await payload.updateGlobal({
    slug: 'shop-settings',
    data: {
      seo: {
        title: shopJson.seo.title,
        description: shopJson.seo.description,
      },
      hero: {
        eyebrow: shopJson.hero.eyebrow,
        title: shopJson.hero.title,
        copy: shopJson.hero.copy,
        image: shopHeroMedia ? shopHeroMedia.id : undefined,
      },
      why: (shopJson.why || []).map((w: string) => ({ item: w })),
    },
  });
  console.log('ShopSettings Global seeded.');

  // 13. Update Navigation global to use newly seeded Category links
  console.log('Updating Navigation Global with Category pointers...');
  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      primaryNavigation: [
        { label: 'Categories', href: '/categories/maternity/' },
        { label: 'Portfolio', href: '/portfolio/' },
        { label: 'Shop', href: '/shop/' },
        { label: 'Pricing', href: '/pricing/' },
        { label: 'Resources', href: '/resources/' },
        { label: 'Contact', href: '/contact/' },
      ],
      footerNavigation: {
        studioLinks: [
          { label: 'Reviews', href: '/testimonials/' },
          { label: 'Privacy Policy', href: '/privacy-policy/' },
          { label: 'Guides', href: '/resources/' },
          { label: 'Inquiry', href: '/contact/' },
        ],
      },
      ctaButtons: {
        headerBookNow: {
          label: 'Book Now',
          href: siteSettingsJson.whatsapp,
        },
        footerWhatsApp: {
          label: 'WhatsApp',
          href: siteSettingsJson.whatsapp,
        },
      },
    },
  });
  console.log('Navigation Global seeded.');

  console.log('Seeding completed successfully!');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error during seeding:', err);
    process.exit(1);
  });
