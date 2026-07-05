import { CollectionConfig } from 'payload';

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'startingPrice'],
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'startingPrice',
      type: 'number',
      required: true,
    },
    {
      name: 'priceLabel',
      type: 'text',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
    },
    {
      name: 'heroImage',
      type: 'relationship',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Gallery Images',
      fields: [
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
        },
      ],
    },
    {
      name: 'rating',
      type: 'text',
      defaultValue: '4.9',
    },
    {
      name: 'reviewCount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'variants',
      type: 'array',
      label: 'Product Variants',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'key',
          type: 'text',
          required: true,
        },
        {
          name: 'options',
          type: 'array',
          label: 'Variant Options',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'price',
              type: 'number',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'personalizationFields',
      type: 'array',
      label: 'Personalization Input Fields',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'key',
          type: 'text',
          required: true,
        },
        {
          name: 'placeholder',
          type: 'text',
        },
      ],
    },
    {
      name: 'upload',
      type: 'group',
      label: 'Photo Upload Requirements',
      fields: [
        {
          name: 'min',
          type: 'number',
          required: true,
          defaultValue: 1,
        },
        {
          name: 'max',
          type: 'number',
          required: true,
          defaultValue: 12,
        },
        {
          name: 'multiple',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'guidance',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'details',
      type: 'array',
      label: 'Product Details',
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'howItWorks',
      type: 'array',
      label: 'How It Works Guidelines',
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'included',
      type: 'array',
      label: 'What is Included',
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'reviews',
      type: 'array',
      label: 'Product Testimonials / Reviews',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'quote',
          type: 'textarea',
          required: true,
        },
      ],
    },
  ],
};
