import { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'public/uploads',
    mimeTypes: ['image/*', 'video/*'],
    focalPoint: true,
    formatOptions: { format: 'webp', options: { quality: 82 } },
  },
  hooks: {
    beforeOperation: [
      async ({ args, operation }) => {
        if (operation === 'create' && args.req.files?.file) {
          const file = args.req.files.file;
          if (file && !Array.isArray(file)) {
            const extIdx = file.name.lastIndexOf('.');
            const ext = extIdx !== -1 ? file.name.substring(extIdx) : '';
            const baseName = extIdx !== -1 ? file.name.substring(0, extIdx) : file.name;

            // Slugify into a clean, descriptive, SEO-friendly filename
            // instead of discarding it behind a random suffix — keep
            // uploads searchable/citable (e.g. "Basket Krishna Theme.jpg"
            // -> "basket-krishna-theme.jpg").
            const slug =
              baseName
                .toLowerCase()
                .replace(/[_\s]+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '') || 'image';

            // Only disambiguate with a numeric suffix if the slug actually
            // collides with an existing upload.
            let candidate = `${slug}${ext}`;
            let suffix = 1;
            while (
              (
                await args.req.payload.find({
                  collection: 'media',
                  where: { filename: { equals: candidate } },
                  limit: 1,
                })
              ).docs.length > 0
            ) {
              suffix += 1;
              candidate = `${slug}-${suffix}${ext}`;
            }
            file.name = candidate;
          }
        }
        return args;
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
};
