import { CollectionConfig } from 'payload';

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
};
