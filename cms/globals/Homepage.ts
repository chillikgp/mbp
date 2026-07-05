import { GlobalConfig } from 'payload';
import { revalidatePaths } from '../hooks/revalidation';

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  admin: {
    group: 'Globals',
  },
  fields: [
    {
      name: 'seo',
      type: 'group',
      label: 'Homepage SEO Metadata',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'hero',
      type: 'group',
      label: 'Hero Section',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          required: true,
        },
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
        {
          name: 'primaryCta',
          type: 'text',
          defaultValue: 'Book a Session',
        },
        {
          name: 'secondaryCta',
          type: 'text',
          defaultValue: 'Explore Categories',
        },
        {
          name: 'stats',
          type: 'array',
          label: 'Statistics',
          fields: [
            {
              name: 'value',
              type: 'text',
              required: true,
            },
            {
              name: 'label',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'trust',
          type: 'array',
          label: 'Trust Badges / Checklist',
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
      name: 'story',
      type: 'group',
      label: 'About Studio Story',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          required: true,
        },
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
        {
          name: 'points',
          type: 'array',
          label: 'Key Studio Points',
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
      name: 'resources',
      type: 'relationship',
      relationTo: 'resources',
      hasMany: true,
      label: 'Featured Planning Guides / Resources',
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc }) => {
        revalidatePaths(['/']);
        return doc;
      },
    ],
  },
};
