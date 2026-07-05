import { GlobalConfig } from 'payload';
import { revalidateRootLayout } from '../hooks/revalidation';

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  fields: [
    {
      name: 'primaryNavigation',
      label: 'Primary Navigation Links',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'footerNavigation',
      label: 'Footer Navigation Groups',
      type: 'group',
      fields: [
        {
          name: 'studioLinks',
          label: 'Studio Links',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'href',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'ctaButtons',
      label: 'CTA Buttons',
      type: 'group',
      fields: [
        {
          name: 'headerBookNow',
          type: 'group',
          fields: [
            {
              name: 'label',
              type: 'text',
            },
            {
              name: 'href',
              type: 'text',
            },
          ],
        },
        {
          name: 'footerWhatsApp',
          type: 'group',
          fields: [
            {
              name: 'label',
              type: 'text',
            },
            {
              name: 'href',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc }) => {
        revalidateRootLayout();
        return doc;
      },
    ],
  },
};

