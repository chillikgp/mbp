import { CollectionConfig } from 'payload';
import { revalidateAddonDoc } from '../hooks/revalidation';

export const Addons: CollectionConfig = {
  slug: 'addons',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        await revalidateAddonDoc(req.payload, doc);
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await revalidateAddonDoc(req.payload, doc);
        return doc;
      },
    ],
  },
};
