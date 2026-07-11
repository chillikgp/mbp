/**
 * One-off content migration: ports the standalone "krishna.mybabypictures.in"
 * Janmashtami microsite (repo root ./janmashtami) into the live
 * /categories/festival/janmashtami page via Payload's Local API.
 *
 * Run: npx tsx --env-file=.env scripts/populate-janmashtami.ts
 */
import path from 'path';
import fs from 'fs';

const CONTENT_DIR = path.resolve(process.cwd(), 'janmashtami');
const IMAGES_DIR = path.join(CONTENT_DIR, 'images');
const VIDEOS_DIR = path.join(CONTENT_DIR, 'additional videos');

const THEMES: { key: string; label: string; prefix: string; count: number }[] = [
  { key: 'darbar', label: 'Darbar', prefix: 'darbar', count: 5 },
  { key: 'aangan', label: 'Aangan', prefix: 'aangan', count: 5 },
  { key: 'gokul', label: 'Gokul', prefix: 'gokul', count: 13 },
  { key: 'jhula', label: 'Jhula', prefix: 'jhulla', count: 7 },
  { key: 'kutiya', label: 'Kutiya', prefix: 'kutiya', count: 4 },
  { key: 'vrindavan', label: 'Vrindavan', prefix: 'vridanvan', count: 6 },
];

// Verbatim alt text extracted from the legacy microsite's altTextMappings object.
const ALT_TEXT: Record<string, string> = {
  'aangan1.jpeg': 'Baby girl in Radha dress with butter pot for Aangan theme photoshoot in Delhi.',
  'aangan2.jpeg': 'Yashoda ma playing with baby Krishna during a family photoshoot.',
  'aangan3.jpeg': 'Smiling baby girl dressed as Radha for Janmashtami Aangan theme photoshoot.',
  'aangan4.jpeg': 'An adorable baby Krishna leaning on Yashoda ma in a tender moment.',
  'aangan5.jpeg': 'Yashoda ma looking lovingly at baby Krishna for a themed photoshoot.',
  'darbar1.jpeg': 'Happy baby girl in a colorful Radha dress for a Darbar theme photoshoot.',
  'darbar2.jpeg': 'Cute baby boy dressed as little Krishna sitting on a small throne.',
  'darbar3.jpeg': 'Baby boy as Krishna with a playful expression and butter on his face.',
  'darbar4.jpeg': 'Innocent baby boy in Krishna costume for Janmashtami photoshoot.',
  'darbar5.jpeg': 'Little girl smiling brightly in a Radha costume for a studio photoshoot.',
  'gokul1.jpeg': 'Baby girl in Radha dress sitting in a Gokul theme with peacocks and cows.',
  'gokul2.jpeg': 'Baby Krishna looking up at Yashoda ma in a beautiful Gokul photoshoot setting.',
  'gokul3.jpeg': 'Toddler boy dressed as Krishna standing with a flute in a Gokul theme.',
  'gokul4.jpeg': 'Baby boy with a large colorful turban as Krishna in a Gokul photoshoot.',
  'gokul5.jpeg': 'Toddler Krishna with a mischievous smile in a vibrant Gokul setting.',
  'gokul6.jpeg': 'A cute baby boy as Krishna with a peacock feather on his head in a Gokul theme.',
  'gokul7.jpeg': 'Family photoshoot with baby Krishna and his parents in a Gokul theme.',
  'gokul8.jpeg': 'Smiling baby Krishna posing with pots of butter in a Gokul photoshoot.',
  'gokul9.jpeg': 'Baby boy as Krishna sitting on a small table for a photoshoot.',
  'gokul10.jpeg': 'A beautiful family portrait with baby Krishna sleeping peacefully.',
  'gokul11.jpeg': 'A joyful toddler boy as Krishna poses for his Janmashtami photoshoot.',
  'gokul12.jpeg': 'Baby boy in Krishna outfit for a professional studio photoshoot in Delhi.',
  'gokul13.jpeg': 'An adorable baby sitting playfully in a Gokul setting with a pot of butter.',
  'jhulla1.jpeg': 'Little girl in a yellow Krishna dress smiling on a decorated jhula (swing).',
  'jhulla2.jpeg': 'Happy baby boy in Krishna costume smiling on a white fur jhula.',
  'jhulla3.jpeg': 'Toddler boy in Krishna outfit sitting on a jhula for a photoshoot.',
  'jhulla4.jpeg': 'Baby boy with a crown as Krishna sitting with a butter pot on a jhula.',
  'jhulla5.jpeg': 'Cute baby Krishna holding a butter pot on a decorated studio jhula.',
  'jhulla6.jpeg': 'Toddler boy photoshoot in Delhi as Krishna on a beautiful swing.',
  'jhulla7.jpeg': 'A mother and son portrait with the child as Krishna on a jhula.',
  'kutiya1.jpeg': 'Baby boy photoshoot in a rustic hut (Kutiya) theme as Krishna.',
  'kutiya2.jpeg': 'Toddler boy in Krishna costume holding a flute in a Kutiya theme.',
  'kutiya3.jpeg': 'A waving baby boy dressed as Krishna in a straw hut studio setup.',
  'kutiya4.jpeg': 'Little girl dressed as Radha for a Janmashtami photoshoot in a Kutiya theme.',
  'vridanvan1.jpeg': 'Baby girl in Radha dress for a colorful Vrindavan theme photoshoot.',
  'vridanvan2.jpeg': 'A happy baby girl as Radha with a butter pot in a Vrindavan setting.',
  'vridanvan3.jpeg': 'Baby photoshoot for Janmashtami with a cute girl in Radha costume.',
  'vridanvan4.jpeg': 'A baby in a green Radha dress holds a butter pot in a Vrindavan theme.',
  'vridanvan5.jpeg': 'Baby photoshoot with a beautiful Vrindavan background and marigold flowers.',
  'vridanvan6.jpeg': 'Close-up of a baby in a lovely dress for a Vrindavan theme photoshoot.',
};

async function uploadMedia(payload: any, absPath: string, alt: string) {
  if (!fs.existsSync(absPath)) {
    throw new Error(`Media file not found: ${absPath}`);
  }
  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: alt } },
    limit: 1,
  });
  if (existing.docs.length > 0) {
    console.log(`Reusing existing media: "${alt}"`);
    return existing.docs[0];
  }
  console.log(`Uploading: ${path.basename(absPath)}...`);
  const media = await payload.create({
    collection: 'media',
    data: { alt },
    filePath: absPath,
  });
  console.log(`  -> uploaded as ${media.filename} (id: ${media.id})`);
  return media;
}

async function findPosterMedia(payload: any) {
  const byFilename = await payload.find({
    collection: 'media',
    where: { filename: { contains: 'story-3-6-months-5' } },
    limit: 1,
  });
  if (byFilename.docs.length > 0) return byFilename.docs[0];

  console.warn('Could not find media by filename "story-3-6-months-5"; falling back to Homepage story image.');
  const homepage = await payload.findGlobal({ slug: 'homepage' });
  const storyImage = homepage?.story?.image;
  if (!storyImage) {
    console.warn('No Homepage story image found either; heroVideoPoster will be left unset.');
    return null;
  }
  const id = typeof storyImage === 'object' ? storyImage.id : storyImage;
  return { id };
}

async function upsertAddon(payload: any, name: string, price: string) {
  const existing = await payload.find({
    collection: 'addons',
    where: { name: { equals: name } },
    limit: 1,
  });
  if (existing.docs.length > 0) {
    return payload.update({ collection: 'addons', id: existing.docs[0].id, data: { price } });
  }
  return payload.create({ collection: 'addons', data: { name, price } });
}

async function upsertTestimonial(payload: any, data: { name: string; rating: number; quote: string; category: string | number }) {
  const existing = await payload.find({
    collection: 'testimonials',
    where: { name: { equals: data.name }, quote: { equals: data.quote } },
    limit: 1,
  });
  if (existing.docs.length > 0) return existing.docs[0];
  return payload.create({ collection: 'testimonials', data });
}

async function main() {
  const { getPayload } = await import('payload');
  const config = (await import('../payload.config')).default;
  const payload = await getPayload({ config });

  const janRes = await payload.find({
    collection: 'categories',
    where: { slug: { equals: 'janmashtami' } },
    limit: 1,
  });
  if (janRes.docs.length === 0) {
    throw new Error('categories/janmashtami not found — expected it to already exist as a child of festival.');
  }
  const janmashtamiId = janRes.docs[0].id;
  console.log(`Found janmashtami category doc: ${janmashtamiId}`);

  // 1. Themed gallery images
  const galleryEntries: any[] = [];
  for (const theme of THEMES) {
    for (let i = 1; i <= theme.count; i++) {
      const filename = `${theme.prefix}${i}.jpeg`;
      const alt = ALT_TEXT[filename] || `${theme.label} theme Janmashtami baby photoshoot`;
      const media = await uploadMedia(payload, path.join(IMAGES_DIR, filename), alt);
      galleryEntries.push({
        image: media.id,
        alt,
        caption: `${theme.label} Theme`,
        theme: theme.label,
      });
    }
  }

  // 2. Decorative gif
  const gifMedia = await uploadMedia(
    payload,
    path.join(IMAGES_DIR, 'mbp-gif.gif'),
    'Animated GIF of a cute baby dressed in a yellow Krishna costume'
  );

  // 3. Videos (hero + 2 media-support)
  const heroVideoMedia = await uploadMedia(
    payload,
    path.join(VIDEOS_DIR, 'janmashtami_hero_video.mp4'),
    'Janmashtami baby photoshoot hero video'
  );
  const mediaSupport1 = await uploadMedia(
    payload,
    path.join(VIDEOS_DIR, 'media_support_janmashtami_video_1.mp4'),
    'Behind the scenes: Janmashtami baby photoshoot, video 1'
  );
  const mediaSupport2 = await uploadMedia(
    payload,
    path.join(VIDEOS_DIR, 'media_support_janmashtami_video_2.mp4'),
    'Highlights: Janmashtami baby photoshoot, video 2'
  );

  // 4. Hero video poster (reuse existing S3 asset, do not re-upload)
  const posterMedia = await findPosterMedia(payload);

  // 5. Add-ons (shared Addons collection, now with price)
  const addonDefs = [
    { name: 'Include Family', price: '₹700' },
    { name: 'Instagram Reel', price: '₹1,000' },
    { name: '5 Photo Hard Copies', price: '₹500' },
    { name: '1 Photo Frame 12x18', price: '₹800' },
    { name: '2nd Kid (Sibling)', price: '25% OFF on package' },
  ];
  const addonIds: (string | number)[] = [];
  for (const addon of addonDefs) {
    const doc = await upsertAddon(payload, addon.name, addon.price);
    addonIds.push(doc.id);
  }

  // 6. Testimonials (verbatim from the legacy microsite)
  const testimonialDefs = [
    {
      name: 'Supriya Malik',
      rating: 5,
      quote: 'If you want art, emotion, and pure magic captured forever... Highly recommended for all parents!',
      category: janmashtamiId,
    },
    {
      name: 'Raman Deep',
      rating: 5,
      quote: 'Incredible job capturing the essence of Janmashtami... The photos are a treasure to cherish. Highly recommend!',
      category: janmashtamiId,
    },
    {
      name: 'Sankalp Sharma',
      rating: 5,
      quote: "We had our daughter's Janmashtami shoot and really enjoyed it. They have beautiful costumes for both Radha and Krishna.",
      category: janmashtamiId,
    },
  ];
  const testimonialIds: (string | number)[] = [];
  for (const testimonial of testimonialDefs) {
    const doc = await upsertTestimonial(payload, testimonial);
    testimonialIds.push(doc.id);
  }

  // 7. Pricing packages (4, verbatim pricing/inclusions from legacy microsite)
  const pricing = [
    {
      name: 'Bal Gopal Mini',
      price: '₹1,599',
      featured: false,
      includes: [
        { item: '20-minute solo session' },
        { item: '5 edited digital photos' },
        { item: 'Best for: quick, budget-friendly portraits' },
        { item: '1 themed set (Krishna dress complimentary)' },
      ],
    },
    {
      name: 'Nandlala Classic',
      price: '₹2,599',
      featured: true,
      includes: [
        { item: '30-minute session' },
        { item: '10 edited digital photos' },
        { item: 'Best for: variety and family moments' },
        { item: '2 themed sets incl. Jhula (dress complimentary)' },
      ],
    },
    {
      name: 'Vrindavan Grand',
      price: '₹3,999',
      featured: false,
      includes: [
        { item: '60-minute session' },
        { item: '20+ edited digital photos' },
        { item: 'Best for: the complete family celebration' },
        { item: 'Up to 4 themed sets incl. Jhula (dress complimentary)' },
        { item: 'Free Instagram reel' },
      ],
    },
    {
      name: 'Vrindavan @ Your Home',
      price: '₹4,599',
      featured: false,
      includes: [
        { item: '~45-minute session at your home (Delhi NCR)' },
        { item: '10+ edited digital photos' },
        { item: "Best for: families who'd rather stay home" },
        { item: '1 themed set, full family included' },
      ],
    },
  ];

  // 8. Update the janmashtami category doc
  const updateData: any = {
    summary:
      'Celebrate your little Krishna’s first Janmashtami with a joyful, festival-ready photoshoot — complimentary Krishna and Radha outfits, dreamy themed sets, and a keepsake gallery starting at just ₹1,599.',
    description:
      'From a playful Gokul courtyard to a swinging jhula and a rustic kutiya hut, our Janmashtami sessions blend tradition with tender baby-led storytelling. The Krishna or Radha dress is complimentary — bring any other accessories you like, and we’ll help plan the rest.',
    heroVideo: heroVideoMedia.id,
    heroVideoPoster: posterMedia ? posterMedia.id : undefined,
    gallery: galleryEntries,
    pricing,
    addons: addonIds,
    addonDetails: addonDefs,
    testimonials: testimonialIds,
    videos: [
      { title: 'Behind the Scenes: Janmashtami Shoot', file: mediaSupport1.id },
      { title: 'Highlights: Janmashtami Photoshoot', file: mediaSupport2.id },
    ],
    ctaBadgeImage: gifMedia.id,
  };

  await payload.update({
    collection: 'categories',
    id: janmashtamiId,
    data: updateData,
  });

  console.log('\nDone. janmashtami category updated:');
  console.log(`  - ${galleryEntries.length} themed gallery images across ${THEMES.length} themes`);
  console.log(`  - ${pricing.length} pricing packages`);
  console.log(`  - ${addonDefs.length} add-ons`);
  console.log(`  - ${testimonialDefs.length} testimonials`);
  console.log('  - hero video + 2 media-support videos');
  console.log('  - decorative CTA gif');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
