import { GlobalConfig } from 'payload';
import { revalidateShopSettings } from '../hooks/revalidation';

export const ShopSettings: GlobalConfig = {
  slug: 'shop-settings',
  admin: {
    group: 'Globals',
  },
  fields: [
    {
      name: 'seo',
      type: 'group',
      label: 'Shop SEO Metadata',
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
      label: 'Shop Hero Banner',
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
      ],
    },
    {
      name: 'why',
      type: 'array',
      label: 'Why Buy From Us Details',
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        await revalidateShopSettings(req.payload);
        return doc;
      },
    ],
  },
};
