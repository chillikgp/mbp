/**
 * SEO follow-up: re-uploads the 40 core themed janmashtami gallery images
 * under descriptive, keyword-rich filenames (auto-converted to WebP by the
 * updated Media upload pipeline) with richer alt text, updates the
 * janmashtami category's gallery array to point at the new Media docs, and
 * deletes the old (generically-named) Media docs afterward.
 *
 * The 41st gallery entry (story-3-6-months-5.jpeg, the shared hero-video
 * poster / Homepage story image) is deliberately left untouched — it's a
 * cross-page shared asset, not janmashtami-exclusive content.
 *
 * Run: npx tsx --env-file=.env scripts/reupload-janmashtami-images-seo.ts
 */
import fs from 'fs';
import os from 'os';
import path from 'path';

const CONTENT_DIR = path.resolve(process.cwd(), 'janmashtami');
const IMAGES_DIR = path.join(CONTENT_DIR, 'images');
const TMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'mbp-seo-reupload-'));

const THEMES: { key: string; label: string; prefix: string; count: number }[] = [
  { key: 'darbar', label: 'Darbar', prefix: 'darbar', count: 5 },
  { key: 'aangan', label: 'Aangan', prefix: 'aangan', count: 5 },
  { key: 'gokul', label: 'Gokul', prefix: 'gokul', count: 13 },
  { key: 'jhula', label: 'Jhula', prefix: 'jhulla', count: 7 },
  { key: 'kutiya', label: 'Kutiya', prefix: 'kutiya', count: 4 },
  { key: 'vrindavan', label: 'Vrindavan', prefix: 'vridanvan', count: 6 },
];

const ALT_SUFFIX = 'Janmashtami Krishna theme baby photoshoot in Delhi NCR.';

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
  const currentGallery: any[] = janDoc.gallery || [];

  if (currentGallery.length < 40) {
    throw new Error(`Expected at least 40 gallery entries, found ${currentGallery.length}. Aborting.`);
  }

  const oldMediaIds: (string | number)[] = [];
  const newGallery: any[] = [...currentGallery];

  let galleryIndex = 0;
  for (const theme of THEMES) {
    for (let i = 1; i <= theme.count; i++) {
      const sourceFilename = `${theme.prefix}${i}.jpeg`;
      const sourcePath = path.join(IMAGES_DIR, sourceFilename);
      if (!fs.existsSync(sourcePath)) {
        throw new Error(`Missing source file: ${sourcePath}`);
      }

      const paddedIndex = String(i).padStart(2, '0');
      const descriptiveName = `baby-krishna-theme-photoshoot-delhi-${theme.key}-${paddedIndex}.jpg`;
      const tmpPath = path.join(TMP_DIR, descriptiveName);
      fs.copyFileSync(sourcePath, tmpPath);

      const existingEntry = currentGallery[galleryIndex];
      const enhancedAlt = `${(existingEntry.alt || '').replace(/\.$/, '')}, ${ALT_SUFFIX}`;

      console.log(`Uploading ${descriptiveName} (replacing gallery[${galleryIndex}])...`);
      const media = await payload.create({
        collection: 'media',
        data: { alt: enhancedAlt },
        filePath: tmpPath,
      });
      console.log(`  -> ${media.filename} (id: ${media.id}, ${media.mimeType}, ${media.filesize} bytes)`);

      const oldImageId = typeof existingEntry.image === 'object' ? existingEntry.image.id : existingEntry.image;
      oldMediaIds.push(oldImageId);

      newGallery[galleryIndex] = {
        image: media.id,
        alt: enhancedAlt,
        caption: existingEntry.caption,
        theme: existingEntry.theme,
      };

      galleryIndex += 1;
    }
  }

  // Normalize any remaining (41st+) entries to plain relationship IDs.
  for (let i = galleryIndex; i < newGallery.length; i++) {
    const entry = newGallery[i];
    newGallery[i] = {
      image: typeof entry.image === 'object' ? entry.image.id : entry.image,
      alt: entry.alt,
      caption: entry.caption,
      theme: entry.theme,
    };
  }

  console.log(`\nUpdating janmashtami category gallery (${newGallery.length} entries)...`);
  await payload.update({
    collection: 'categories',
    id: janDoc.id,
    data: { gallery: newGallery },
  });

  console.log(`Deleting ${oldMediaIds.length} orphaned old media docs...`);
  for (const id of oldMediaIds) {
    try {
      await payload.delete({ collection: 'media', id });
    } catch (err) {
      console.warn(`  Warning: failed to delete old media doc ${id}:`, err);
    }
  }

  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  console.log(`\nDone. Re-uploaded ${galleryIndex} images with descriptive filenames + richer alt text.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
