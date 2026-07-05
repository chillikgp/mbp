import { CollectionConfig } from 'payload';
import crypto from 'crypto';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'public/uploads',
    mimeTypes: ['image/*'],
    focalPoint: true,
  },
  hooks: {
    beforeOperation: [
      ({ args, operation }) => {
        if (operation === 'create' && args.req.files?.file) {
          const file = args.req.files.file;
          if (file && !Array.isArray(file)) {
            const uniqueSuffix = crypto.randomBytes(8).toString('hex');
            const extIdx = file.name.lastIndexOf('.');
            const ext = extIdx !== -1 ? file.name.substring(extIdx) : '';
            const baseName = extIdx !== -1 ? file.name.substring(0, extIdx) : file.name;
            // Ensure name is clean, lowercase, alphanumeric, dashes, or underscores only
            const cleanBase = baseName.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
            file.name = `${cleanBase}-${uniqueSuffix}${ext}`;
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
