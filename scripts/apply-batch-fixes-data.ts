/**
 * One-off data migration accompanying the July 2026 UX/CTA batch fixes:
 *
 *  1. Navigation global: "Categories" nav item now points at the new
 *     /categories index page instead of /categories/maternity.
 *  2. Maternity category: trimmed hero/intro copy (the template now renders
 *     summary in the hero and description in the intro fold), and
 *     heroVideoPoster set to the maternity_hero.jpg media asset so the
 *     category-page video poster matches the /portfolio/maternity hero.
 *  3. Homepage global: hero primary CTA standardized to "Check Availability".
 *
 * Idempotent — safe to re-run. Mirrors of these values live in
 * content/site.json (seed source) and scripts/seed-payload.ts.
 *
 * Run: npx tsx --env-file=.env scripts/apply-batch-fixes-data.ts
 *
 * NOTE: revalidatePath() cannot run outside a Next.js request lifecycle, so
 * after running this against the production DB the cached pages must be
 * refreshed by a redeploy (or by re-saving the touched docs in /admin).
 */
import path from 'path';
import fs from 'fs';

const MATERNITY_SUMMARY =
  'Elegant, comfortable maternity photoshoots celebrating this beautiful chapter — gowns and themed setups included.';

const MATERNITY_DESCRIPTION =
  'Choose elegant studio, outdoor or couple maternity portraits with designer gowns and professionally styled themes included. Every maternity photoshoot is planned around your comfort, serving families across Delhi, Noida, Gurgaon and Faridabad.';

async function main() {
  const { getPayload } = await import('payload');
  const config = (await import('../payload.config')).default;
  const payload = await getPayload({ config });

  // 1. Navigation global: Categories -> /categories
  const navigation = await payload.findGlobal({ slug: 'navigation' });
  const primaryNavigation = (navigation.primaryNavigation || []).map((item: any) =>
    item.label === 'Categories' ? { ...item, href: '/categories' } : item
  );
  await payload.updateGlobal({
    slug: 'navigation',
    data: { ...navigation, primaryNavigation },
  });
  console.log('Navigation global updated: Categories -> /categories');

  // 2. Maternity category: trimmed copy + hero video poster
  const maternityRes = await payload.find({
    collection: 'categories',
    where: { slug: { equals: 'maternity' } },
    limit: 1,
  });
  if (maternityRes.docs.length === 0) {
    throw new Error('categories/maternity not found');
  }
  const maternity = maternityRes.docs[0] as any;

  let posterMediaId: number | undefined;
  const posterSearch = await payload.find({
    collection: 'media',
    where: { filename: { contains: 'maternity_hero' } },
    limit: 1,
  });
  if (posterSearch.docs.length > 0) {
    posterMediaId = Number(posterSearch.docs[0].id);
    console.log(`Reusing existing maternity_hero media (ID: ${posterMediaId})`);
  } else {
    const localPath = path.resolve(process.cwd(), 'public/images/maternity_hero.jpg');
    if (fs.existsSync(localPath)) {
      const media = await payload.create({
        collection: 'media',
        data: { alt: 'Elegant maternity photoshoot portrait by My Baby Pictures' },
        filePath: localPath,
      });
      posterMediaId = Number(media.id);
      console.log(`Uploaded maternity_hero.jpg as media ID ${posterMediaId}`);
    } else {
      console.warn('public/images/maternity_hero.jpg not found — skipping poster update');
    }
  }

  await payload.update({
    collection: 'categories',
    id: maternity.id,
    data: {
      summary: MATERNITY_SUMMARY,
      description: MATERNITY_DESCRIPTION,
      ...(posterMediaId ? { heroVideoPoster: posterMediaId } : {}),
    },
  });
  console.log('Maternity category updated: trimmed summary/description' + (posterMediaId ? ' + heroVideoPoster' : ''));

  // 3. Homepage global: hero primary CTA
  const homepage = await payload.findGlobal({ slug: 'homepage' });
  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      ...homepage,
      hero: { ...(homepage as any).hero, primaryCta: 'Check Availability' },
    },
  });
  console.log('Homepage global updated: hero primaryCta -> "Check Availability"');

  console.log('\nDone. Remember: redeploy (or re-save these docs in /admin) so static pages pick up the new data.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
