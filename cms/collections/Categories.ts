import { CollectionConfig } from 'payload';
import { revalidateCategoryDoc } from '../hooks/revalidation';

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'parent'],
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
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'eyebrow',
      type: 'text',
    },
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      label: 'Parent Category (Hierarchy)',
    },
    {
      name: 'heroImage',
      type: 'relationship',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'heroVideo',
      type: 'relationship',
      relationTo: 'media',
      label: 'Hero Background Video (optional)',
    },
    {
      name: 'heroVideoPoster',
      type: 'relationship',
      relationTo: 'media',
      label: 'Hero Video Poster/Cover (optional, falls back to Hero Image)',
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
        {
          name: 'caption',
          type: 'text',
        },
        {
          name: 'theme',
          type: 'text',
          label: 'Theme (optional, enables gallery tabs)',
        },
      ],
    },
    {
      name: 'pricing',
      type: 'array',
      label: 'Pricing Packages',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'price',
          type: 'text',
          required: true,
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'includes',
          type: 'array',
          label: 'Included Items',
          fields: [
            {
              name: 'item',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'addons',
      type: 'relationship',
      relationTo: 'addons',
      hasMany: true,
      label: 'Linked Addons',
    },
    {
      name: 'addonDetails',
      type: 'array',
      label: 'Optional Add-Ons (name + price, for comparison table)',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'price',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'related',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Related Categories',
    },
    {
      name: 'testimonials',
      type: 'relationship',
      relationTo: 'testimonials',
      hasMany: true,
      label: 'Featured Testimonials',
    },
    {
      name: 'videos',
      type: 'array',
      label: 'Video Slots',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'embed',
          type: 'text',
          label: 'Embed URL (YouTube/Vimeo, etc.)',
        },
        {
          name: 'file',
          type: 'relationship',
          relationTo: 'media',
          label: 'Self-hosted Video File (optional, takes priority over Embed URL)',
        },
      ],
    },
    {
      name: 'bts',
      type: 'array',
      label: 'Behind The Scenes (BTS) Content',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'copy',
          type: 'textarea',
          required: true,
        },
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'ctaBadgeImage',
      type: 'relationship',
      relationTo: 'media',
      label: 'Small Decorative CTA Badge Image (optional, e.g. a gif)',
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        await revalidateCategoryDoc(req.payload, doc);
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await revalidateCategoryDoc(req.payload, doc);
        return doc;
      },
    ],
  },
};
