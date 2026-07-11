/**
 * One-off follow-up: adds the existing hero-video poster image
 * (story-3-6-months-5.jpeg, already uploaded to Media) into the Vrindavan
 * tab of the janmashtami category's portfolio gallery.
 *
 * Run: npx tsx --env-file=.env scripts/add-vrindavan-poster-to-gallery.ts
 */
export {};

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
  const janDoc = janRes.docs[0];

  const posterRes = await payload.find({
    collection: 'media',
    where: { filename: { contains: 'story-3-6-months-5' } },
    limit: 1,
  });
  if (posterRes.docs.length === 0) {
    throw new Error('Media doc for story-3-6-months-5.jpeg not found.');
  }
  const posterMedia = posterRes.docs[0];

  const existingGallery = (janDoc.gallery || []).map((item: any) => ({
    image: typeof item.image === 'object' ? item.image.id : item.image,
    alt: item.alt,
    caption: item.caption,
    theme: item.theme,
  }));

  const alreadyPresent = existingGallery.some((item: any) => item.image === posterMedia.id);
  if (alreadyPresent) {
    console.log('story-3-6-months-5.jpeg is already in the gallery. Nothing to do.');
    process.exit(0);
  }

  const updatedGallery = [
    ...existingGallery,
    {
      image: posterMedia.id,
      alt: 'Baby dressed as Krishna in a dreamy Vrindavan-inspired setting.',
      caption: 'Vrindavan Theme',
      theme: 'Vrindavan',
    },
  ];

  await payload.update({
    collection: 'categories',
    id: janDoc.id,
    data: { gallery: updatedGallery },
  });

  console.log(`Done. Gallery now has ${updatedGallery.length} images (was ${existingGallery.length}).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
