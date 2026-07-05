import { CollectionConfig } from 'payload';

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'rating', 'quote'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Client Name',
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      defaultValue: 5,
      label: 'Rating (1-5)',
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      label: 'Quote',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      label: 'Linked Category',
    },
  ],
};
