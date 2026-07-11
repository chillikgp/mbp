import { buildConfig } from 'payload';
import sharp from 'sharp';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import { Users } from '@/cms/collections/Users';
import { Media } from '@/cms/collections/Media';
import { Addons } from '@/cms/collections/Addons';
import { FAQs } from '@/cms/collections/FAQs';
import { Testimonials } from '@/cms/collections/Testimonials';
import { Categories } from '@/cms/collections/Categories';
import { Resources } from '@/cms/collections/Resources';
import { Products } from '@/cms/collections/Products';
import { SiteSettings } from '@/cms/globals/SiteSettings';
import { Navigation } from '@/cms/globals/Navigation';
import { Homepage } from '@/cms/globals/Homepage';
import { ShopSettings } from '@/cms/globals/ShopSettings';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Addons, FAQs, Testimonials, Categories, Resources, Products],
  globals: [SiteSettings, Navigation, Homepage, ShopSettings],
  sharp,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'a-very-secure-secret-default-key-for-dev',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  plugins: [
    s3Storage({
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => {
            const bucket = process.env.S3_BUCKET;
            const region = process.env.S3_REGION || 'ap-south-1';
            return `https://${bucket}.s3.${region}.amazonaws.com/${prefix ? `${prefix}/` : ''}${filename}`;
          },
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'ap-south-1',
      },
      enabled: Boolean(process.env.S3_BUCKET),
    }),
  ],
});
