/**
 * Populates the first Resources blog post: "DIY Krishna Theme Baby
 * Photoshoot at Home: 12 Easy & Beautiful Ideas for Janmashtami," adapted
 * from the ready-made content brief + 12 images in
 * "DIY HomeShoot Images/" at the repo root.
 *
 * Run: npx tsx --env-file=.env scripts/populate-diy-blog.ts
 */
import fs from 'fs';
import os from 'os';
import path from 'path';

const IMAGES_DIR = path.resolve(process.cwd(), 'DIY HomeShoot Images');
const TMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'mbp-diy-blog-'));

const IDEAS: { source: string; slug: string; alt: string; caption: string }[] = [
  {
    source: 'Basket Krishna Theme.jpg',
    slug: '01-basket-krishna',
    alt: 'DIY basket Krishna theme baby photoshoot at home with peacock feather and flute props.',
    caption: 'Basket Krishna',
  },
  {
    source: 'Makhan Chor Setup.jpg',
    slug: '02-makhan-chor',
    alt: 'DIY Makhan Chor baby Krishna photoshoot at home with a clay matki and cotton-ball butter.',
    caption: 'Makhan Chor Setup',
  },
  {
    source: 'Vrindavan Garden Theme.jpg',
    slug: '03-vrindavan-garden',
    alt: 'DIY Vrindavan garden theme baby Krishna photoshoot at home with marigold garlands.',
    caption: 'Vrindavan Garden Theme',
  },
  {
    source: 'Jhula Swing Theme.jpg',
    slug: '04-jhula-swing',
    alt: 'DIY Jhula swing baby Krishna photoshoot at home with a decorated hanging swing.',
    caption: 'Jhula (Swing) Krishna',
  },
  {
    source: 'Moon Krishna Theme.jpg',
    slug: '05-moon-krishna',
    alt: 'DIY moon Chanda Mama baby Krishna photoshoot at home with a cardboard moon cutout.',
    caption: 'Moon (Chanda Mama) Krishna',
  },
  {
    source: 'Flat Lay Janmashtami Theme.jpg',
    slug: '06-floor-setup',
    alt: 'DIY Janmashtami floor setup baby Krishna photoshoot at home, top-down flat lay.',
    caption: 'Janmashtami Floor Setup',
  },
  {
    source: 'Peacock Feather Halo.jpg',
    slug: '07-peacock-feather-halo',
    alt: 'DIY peacock feather halo baby Krishna photoshoot at home on a white blanket.',
    caption: 'Peacock Feather Halo',
  },
  {
    source: 'Krishna Story Time.jpg',
    slug: '08-story-time',
    alt: 'DIY Krishna story time baby photoshoot at home with a Bhagavad Gita and tulsi mala.',
    caption: 'Krishna Story Time',
  },
  {
    source: 'Butter Pot Adventure.jpg',
    slug: '09-butter-pot',
    alt: 'DIY butter pot adventure baby Krishna photoshoot at home, baby peeking into a matki.',
    caption: 'Butter Pot Adventure',
  },
  {
    source: 'Footprints of Krishna.jpg',
    slug: '10-footprints',
    alt: 'DIY Krishna footprints baby photoshoot at home with baby-safe washable paint.',
    caption: 'Footprints of Krishna',
  },
  {
    source: 'Little Cow Friend.jpg',
    slug: '11-little-cow-friend',
    alt: 'DIY little cow friend baby Krishna photoshoot at home inspired by Vrindavan.',
    caption: 'Little Cow Friend',
  },
  {
    source: 'Floating Clouds Krishna.jpg',
    slug: '12-floating-clouds',
    alt: 'DIY floating clouds baby Krishna photoshoot at home with cotton clouds and stars.',
    caption: 'Floating Clouds Krishna',
  },
];

// --- Minimal Lexical serialized-node builders (matches @lexical/* schemas) ---
const text = (value: string, format = 0) => ({
  type: 'text',
  version: 1,
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text: value,
});
const bold = (value: string) => text(value, 1);
const paragraph = (children: any[]) => ({
  type: 'paragraph',
  version: 1,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
});
const p = (value: string) => paragraph([text(value)]);
const heading = (tag: 'h2' | 'h3', value: string) => ({
  type: 'heading',
  version: 1,
  tag,
  children: [text(value)],
  direction: 'ltr',
  format: '',
  indent: 0,
});
const bulletList = (items: string[]) => ({
  type: 'list',
  version: 1,
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  children: items.map((item, i) => ({
    type: 'listitem',
    version: 1,
    value: i + 1,
    checked: undefined,
    children: [text(item)],
    direction: 'ltr',
    format: '',
    indent: 0,
  })),
  direction: 'ltr',
  format: '',
  indent: 0,
});
const link = (label: string, url: string) => ({
  type: 'link',
  version: 1,
  fields: {
    linkType: 'custom',
    url,
    newTab: false,
  },
  children: [text(label)],
  direction: 'ltr',
  format: '',
  indent: 0,
});
const linkParagraph = (children: any[]) => paragraph(children);

async function main() {
  const { getPayload } = await import('payload');
  const config = (await import('../payload.config')).default;
  const payload = await getPayload({ config });

  // 1. Upload the 12 images with descriptive filenames.
  const mediaByIdea: any[] = [];
  for (const idea of IDEAS) {
    const existing = await payload.find({
      collection: 'media',
      where: { alt: { equals: idea.alt } },
      limit: 1,
    });
    if (existing.docs.length > 0) {
      console.log(`Reusing existing media for "${idea.caption}" (id: ${existing.docs[0].id})`);
      mediaByIdea.push(existing.docs[0]);
      continue;
    }

    const sourcePath = path.join(IMAGES_DIR, idea.source);
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Missing source file: ${sourcePath}`);
    }
    const descriptiveName = `diy-krishna-photoshoot-at-home-${idea.slug}.jpg`;
    const tmpPath = path.join(TMP_DIR, descriptiveName);
    fs.copyFileSync(sourcePath, tmpPath);

    console.log(`Uploading ${descriptiveName}...`);
    const media = await payload.create({
      collection: 'media',
      data: { alt: idea.alt },
      filePath: tmpPath,
    });
    console.log(`  -> ${media.filename} (id: ${media.id})`);
    mediaByIdea.push(media);
  }
  fs.rmSync(TMP_DIR, { recursive: true, force: true });

  // 2. Resolve the janmashtami category (for the "category" pill + Related Guides linking).
  const janRes = await payload.find({
    collection: 'categories',
    where: { slug: { equals: 'janmashtami' } },
    limit: 1,
  });
  if (janRes.docs.length === 0) {
    throw new Error('categories/janmashtami not found.');
  }
  const janId = janRes.docs[0].id;

  // 3. Build the article body.
  const content = {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: [
        p(
          "Your little one dressed as Baby Krishna is one of the sweetest memories you'll ever create. The good news is that you don't need an expensive studio setup to capture beautiful photos."
        ),
        p(
          'With a few simple props, natural window light, and a little creativity, you can recreate adorable Krishna-themed photos right from your living room. In this guide, we’ve collected 12 easy DIY Krishna photoshoot ideas that are budget-friendly, beginner-friendly, and perfect for babies of all ages.'
        ),

        heading('h2', 'Before You Start'),
        heading('h3', 'Best Age'),
        bulletList([
          'Newborn — sleeping poses',
          '3–6 months — lying poses',
          '6–9 months — sitting poses',
          '9–12 months — standing with support',
        ]),
        heading('h3', 'Best Time'),
        p('Shoot between 8–10 AM or 4–5:30 PM. Natural window light produces the softest baby photos.'),
        heading('h3', 'Safety Tips'),
        bulletList([
          'Never leave your baby unattended.',
          'Use only lightweight props.',
          'Avoid sharp crowns or metal accessories.',
          'Keep the room cool and comfortable.',
          'Let the baby take breaks if they become fussy.',
          'Have another adult nearby to help throughout the shoot.',
        ]),

        heading('h2', 'The 12 DIY Ideas'),

        heading('h3', '1. Basket Krishna (Most Popular)'),
        p('Difficulty: Easy · Budget: ₹300–₹800'),
        paragraph([bold("You'll need: "), text('Wicker basket, blue cloth, peacock feather, flute, artificial flowers, small butter pot (matki).')]),
        paragraph([bold('Tip: '), text('Place the basket near a window for soft natural light. Use a plain white bedsheet as the background.')]),

        heading('h3', '2. Makhan Chor Setup'),
        p('Difficulty: Easy · Budget: ₹200–₹500'),
        paragraph([bold("You'll need: "), text('Clay matki, white cotton balls (to imitate butter), wooden stool, yellow dhoti, flute.')]),
        paragraph([bold('Tip: '), text('Scatter a little "butter" around the pot to make the photo look playful.')]),

        heading('h3', '3. Vrindavan Garden Theme'),
        p('Difficulty: Medium · Budget: ₹500–₹1,000'),
        paragraph([bold("You'll need: "), text('Artificial grass mat, marigold garlands, small plants, peacock feathers, Krishna costume.')]),
        paragraph([bold('Tip: '), text('Photograph outdoors during the golden hour or near a balcony with plenty of natural light.')]),

        heading('h3', '4. Jhula (Swing) Krishna'),
        p('Difficulty: Medium · Budget: ₹500–₹1,500'),
        paragraph([bold("You'll need: "), text('Decorative baby swing (or sturdy hanging basket), artificial flowers, fairy lights (background only), blue dupatta.')]),
        paragraph([bold('Safety tip: '), text('Always have an adult supporting the baby. Never leave the baby unattended on a swing.')]),

        heading('h3', '5. Moon (Chanda Mama) Krishna Theme'),
        p('Difficulty: Medium · Budget: ₹300–₹800'),
        paragraph([bold("You'll need: "), text('Large cardboard moon cutout, dark blue bedsheet, star stickers, LED fairy lights, Krishna outfit.')]),
        paragraph([bold('Tip: '), text('Switch off room lights and use only soft window light or a diffused lamp to avoid harsh shadows.')]),

        heading('h3', '6. Janmashtami Floor Setup'),
        p('Difficulty: Easy · Budget: ₹300–₹700'),
        paragraph([bold("You'll need: "), text('Blue or white bedsheet, rangoli flowers, small flute, peacock feather, clay matki, baby Krishna dress.')]),
        paragraph([bold('Tip: '), text('Shoot directly from above (top-down) while the baby lies comfortably on the decorated setup.')]),

        heading('h3', '7. Peacock Feather Halo'),
        p('Difficulty: Easy-Medium'),
        paragraph([bold('Props: '), text('20–30 peacock feathers, white blanket, Krishna costume, small flower garland.')]),
        paragraph([bold('Tip: '), text("Arrange the feathers in a circular halo around the baby's head while they lie on a white bedsheet.")]),

        heading('h3', '8. Krishna Story Time'),
        p('Inspired by babies holding the Bhagavad Gita. Difficulty: Easy'),
        paragraph([bold('Props: '), text('Bhagavad Gita, flute, tulsi mala, yellow cloth.')]),

        heading('h3', '9. Butter Pot Adventure'),
        p('Instead of sitting beside it, baby is peeking inside. Difficulty: Easy-Medium'),
        paragraph([bold('Props: '), text('Large painted matki, cotton, flowers.')]),

        heading('h3', '10. Footprints of Krishna'),
        p('One of the cutest Janmashtami traditions. Difficulty: Easy'),
        paragraph([bold('Props: '), text('White cloth, baby-safe washable paint, tiny Krishna footprints, flowers.')]),

        heading('h3', '11. Little Cow Friend'),
        p('Inspired by Vrindavan. Difficulty: Easy-Medium'),
        paragraph([bold('Props: '), text('Plush white cow, grass mat, flute.')]),

        heading('h3', '12. Floating Clouds Krishna'),
        p('Very Pinterest-worthy. Difficulty: Easy-Medium'),
        paragraph([bold('Props: '), text('White cotton, blue bedsheet, stars, moon.')]),

        heading('h2', 'Budget Breakdown'),
        bulletList([
          'Krishna Dress — ₹500–₹1,500',
          'Flute — ₹50–₹150',
          'Peacock Feather — ₹20–₹100',
          'Clay Matki — ₹100–₹300',
          'Marigold Flowers — ₹100–₹300',
          'Basket — ₹300–₹700',
          'Artificial Grass — ₹300–₹600',
        ]),
        p('A full DIY setup can be created for approximately ₹1,500–₹3,000, and many of these items can be reused for birthdays or milestone photos.'),

        heading('h2', 'Camera Tips'),
        p("You don't need a DSLR. Modern smartphones take excellent baby photos."),
        bulletList([
          'Turn off flash.',
          "Tap to focus on your baby's eyes.",
          'Shoot near a window.',
          'Use Portrait Mode if available.',
          'Take lots of candid photos.',
          'Burst mode is great for smiles.',
        ]),

        heading('h2', 'Common Mistakes to Avoid'),
        bulletList([
          'Shooting at noon.',
          'Using flash.',
          'Too many props.',
          'Busy backgrounds.',
          'Forcing poses.',
          'Long sessions — keep it under 30–45 minutes.',
        ]),

        heading('h2', 'Want Professional Krishna Photos Like These?'),
        p(
          "DIY photoshoots are a wonderful way to celebrate Janmashtami, but if you're looking for handcrafted sets, premium costumes, professional lighting, and beautifully edited portraits, a studio session can create keepsakes you'll treasure for years."
        ),
        p(
          'At My Baby Pictures, we’ve photographed hundreds of babies in customized Krishna-themed setups with safe posing, festive props, and personalized styling.'
        ),
        linkParagraph([link('Book your Krishna Theme Baby Photoshoot in Delhi NCR', '/categories/festival/janmashtami')]),
        linkParagraph([
          text('Browse the full '),
          link('Krishna theme portfolio', '/portfolio/festival'),
          text(' or see '),
          link('pricing and packages', '/pricing/festival'),
          text('.'),
        ]),
      ],
    },
  };

  // 4. Create/update the resource doc.
  const slug = 'diy-krishna-theme-baby-photoshoot-at-home';
  const data: any = {
    slug,
    title: 'DIY Krishna Theme Baby Photoshoot at Home: 12 Easy & Beautiful Ideas for Janmashtami',
    category: janId,
    excerpt:
      'Create a beautiful Baby Krishna photoshoot at home with these 12 easy DIY ideas. Simple props, budget-friendly setups, safety tips, and inspiration for your little Kanha this Janmashtami.',
    image: mediaByIdea[0].id,
    contentPoints: [
      { item: '12 budget-friendly DIY Krishna photoshoot ideas, ₹1,500–₹3,000 total setup' },
      { item: 'Best age, timing, and safety tips for photographing your baby at home' },
      { item: 'Simple smartphone camera tips — no DSLR required' },
      { item: 'Common mistakes to avoid for the best results' },
    ],
    content,
    gallery: IDEAS.map((idea, i) => ({
      image: mediaByIdea[i].id,
      alt: idea.alt,
      caption: idea.caption,
    })),
    faqs: [
      {
        q: 'What is the best age for a Krishna photoshoot?',
        a: 'Babies between 6 and 9 months are usually the easiest to photograph because they can sit with support and naturally smile. Newborns can also create beautiful sleeping Krishna portraits.',
      },
      {
        q: 'Can I do this with a phone?',
        a: 'Absolutely. Natural light matters more than the camera.',
      },
      {
        q: 'Where can I buy Krishna costumes?',
        a: 'You can find Krishna costumes online, in local costume shops, or seasonal Janmashtami markets.',
      },
      {
        q: 'How long should the photoshoot last?',
        a: "Plan for around 20–45 minutes depending on your baby's mood.",
      },
      {
        q: 'Can girls do Krishna-themed photoshoots?',
        a: 'Yes! Many families choose a Krishna-inspired theme for baby girls, or combine Krishna and Radha elements for a beautiful festive look.',
      },
      {
        q: 'What if my baby cries?',
        a: 'Feed the baby beforehand, keep favorite toys nearby, and take breaks whenever needed. Happy babies always make the best photos.',
      },
    ],
  };

  const existing = await payload.find({
    collection: 'resources',
    where: { slug: { equals: slug } },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    await payload.update({ collection: 'resources', id: existing.docs[0].id, data });
    console.log(`\nUpdated existing resource: ${slug}`);
  } else {
    // Create with the required base fields first, then update with the
    // full payload (including the rich content field) — create-time
    // validation on a brand-new richText field has proven flaky in
    // practice, while updating an existing doc with the same content
    // works reliably.
    const { content: fullContent, gallery, faqs, contentPoints, ...baseData } = data;
    const created = await payload.create({ collection: 'resources', data: baseData });
    await payload.update({
      collection: 'resources',
      id: created.id,
      data: { content: fullContent, gallery, faqs, contentPoints },
    });
    console.log(`\nCreated new resource: ${slug}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch(async (err) => {
    const util = await import('util');
    console.error(util.inspect(err.data ?? err, { depth: 30 }));
    process.exit(1);
  });
