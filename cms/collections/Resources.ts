import { CollectionConfig } from 'payload';

export const Resources: CollectionConfig = {
  slug: 'resources',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'category'],
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      label: 'Linked Category',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'image',
      type: 'relationship',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'contentPoints',
      type: 'array',
      label: 'Guide Checklist / Points',
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
};
