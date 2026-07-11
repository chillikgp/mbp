/**
 * SEO/GEO follow-up: creates a Janmashtami/Krishna-theme-specific FAQ bank
 * (~20 Q&As), linked directly to the janmashtami child category so they
 * render on /categories/festival/janmashtami instead of the generic
 * festival-level fallback (see lib/repositories/faqRepository.ts's
 * child-first lookup fix).
 *
 * Targets the top Search Console queries verbatim (krishna theme baby
 * photoshoot, one month baby boy photoshoot ideas at home, etc.) plus the
 * example questions requested (age, girls in Krishna theme, real flute,
 * costume sourcing, cost, duration, parents/siblings, twins, newborns).
 *
 * Run: npx tsx --env-file=.env scripts/populate-janmashtami-faqs.ts
 */
export {};

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is the best age for a Krishna theme baby photoshoot?',
    a: 'Between 4 and 9 months, when babies can sit with support and smile naturally. Newborns can also do sleeping Krishna poses safely with professional support, and babies up to 12 months can stand with support for standing Krishna/Kanha poses.',
  },
  {
    q: 'Can girls do a Krishna theme photoshoot?',
    a: 'Yes. Many families dress baby girls as Radha, or blend Radha-Krishna elements into one shoot — it is not limited to baby boys.',
  },
  {
    q: 'Is the flute a real prop in the photos?',
    a: 'Yes, we use a real, child-safe, lightweight flute as a prop, along with a peacock feather crown, a matki (butter pot), and other traditional Krishna accessories, all sanitized between sessions.',
  },
  {
    q: 'Do I need to buy a Krishna costume myself?',
    a: 'No. The Krishna or Radha dress is complimentary and included in every package. You are welcome to bring your own accessories if you would like a specific look.',
  },
  {
    q: 'How much does a Krishna theme baby photoshoot cost in Delhi?',
    a: 'Packages start at ₹1,599 for a 20-minute solo session with 5 edited photos, going up to ₹4,599 for an at-home session across Delhi NCR.',
  },
  {
    q: 'How long does a Krishna or Janmashtami photoshoot take?',
    a: 'Most sessions run 20 to 60 minutes depending on the package, with breaks built in if your baby needs them.',
  },
  {
    q: 'Can parents join the photoshoot?',
    a: 'Yes. Our Vrindavan Grand and at-home packages include family and parent portraits alongside the baby’s solo Krishna theme shots.',
  },
  {
    q: 'Can siblings join the Krishna theme shoot?',
    a: 'Yes. A second child (sibling) can be added to the package at 25% off, and family-inclusive packages are available.',
  },
  {
    q: 'Can twins do a Krishna theme photoshoot together?',
    a: 'Yes, we regularly photograph twins in matching or complementary Krishna and Radha-Krishna themes. Let us know at booking so we can plan props and setups for two babies.',
  },
  {
    q: 'Can a newborn baby do a Krishna theme photoshoot?',
    a: 'Yes. For newborns we use safe sleeping poses with soft props, such as a mini crown, a flute nearby, or a matki, instead of sitting or standing poses, always with a spotter present.',
  },
  {
    q: 'What Krishna photoshoot themes or sets are available?',
    a: 'Six signature sets: Darbar (royal throne), Aangan (courtyard with Yashoda), Gokul (pastoral peacock and cow setting), Jhula (swing), Kutiya (rustic hut), and Vrindavan (garden).',
  },
  {
    q: 'Where is the Krishna theme baby photoshoot studio located?',
    a: 'Our studio is in Saini Enclave, Karkardooma, East Delhi. We also offer at-home sessions across Delhi NCR.',
  },
  {
    q: 'How many edited photos do I get?',
    a: 'Between 5 and 20+ edited digital photos depending on the package, delivered digitally within 10-12 working days.',
  },
  {
    q: 'Do you offer an Instagram reel of the shoot?',
    a: 'Yes, a short Instagram reel is included free with the Vrindavan Grand package, or available as a ₹1,000 add-on with other packages.',
  },
  {
    q: 'Can I get printed photos or a photo frame?',
    a: 'Yes. 5 hard copy prints (₹500) and a 12x18 photo frame (₹800) are available as add-ons.',
  },
  {
    q: 'Do you photograph baby girls as Radha instead of Krishna?',
    a: 'Yes, Radha costumes and props matching Krishna’s are available for baby girls, or a combined Radha-Krishna theme for siblings and twins.',
  },
  {
    q: 'What should I bring to the photoshoot?',
    a: 'Just your baby — the Krishna or Radha dress, props, and set are all provided. Feel free to bring a comfort toy, a change of clothes, and feeding supplies for breaks.',
  },
  {
    q: 'How far in advance should I book a Janmashtami photoshoot?',
    a: 'Since Janmashtami is a seasonal, high-demand slot, we recommend booking 2-3 weeks ahead. A 50% non-refundable advance secures your slot.',
  },
  {
    q: 'Is an at-home Krishna theme photoshoot available outside the studio?',
    a: 'Yes, the Vrindavan @ Your Home package (₹4,599) brings the full Krishna theme setup, complimentary dress, and full family photography to your home anywhere in Delhi NCR.',
  },
  {
    q: 'What if my baby gets fussy during the shoot?',
    a: 'Our photographers are experienced with babies. We build in breaks, use toys and sounds to keep them engaged, and keep sessions short enough, 20-60 minutes, to work around nap and feed schedules.',
  },
];

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
    throw new Error('categories/janmashtami not found.');
  }
  const janId = janRes.docs[0].id;

  let created = 0;
  let updated = 0;

  for (const faq of FAQS) {
    const existing = await payload.find({
      collection: 'faqs',
      where: { q: { equals: faq.q } },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      const doc = existing.docs[0];
      const linkedIds = (doc.categories || []).map((c: any) => (typeof c === 'object' ? c.id : c));
      if (!linkedIds.includes(janId)) {
        await payload.update({
          collection: 'faqs',
          id: doc.id,
          data: { categories: [...linkedIds, janId] },
        });
        updated += 1;
      }
      continue;
    }

    await payload.create({
      collection: 'faqs',
      data: { q: faq.q, a: faq.a, categories: [janId] },
    });
    created += 1;
  }

  console.log(`Done. Created ${created} new FAQs, updated ${updated} existing FAQs to link to janmashtami.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
