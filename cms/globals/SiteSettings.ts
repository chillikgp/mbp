import { GlobalConfig } from 'payload';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  fields: [
    {
      name: 'name',
      label: 'Studio Name',
      type: 'text',
      required: true,
    },
    {
      name: 'domain',
      label: 'Domain URL',
      type: 'text',
      required: true,
    },
    {
      name: 'tagline',
      label: 'Tagline',
      type: 'text',
    },
    {
      name: 'description',
      label: 'Studio Description',
      type: 'textarea',
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      required: true,
    },
    {
      name: 'phoneHref',
      label: 'Phone Link (tel:)',
      type: 'text',
      required: true,
    },
    {
      name: 'whatsapp',
      label: 'WhatsApp Link',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      label: 'Studio Address',
      type: 'textarea',
      required: true,
    },
    {
      name: 'googleMapsUrl',
      label: 'Google Maps URL',
      type: 'text',
    },
    {
      name: 'rating',
      label: 'Rating Value',
      type: 'text',
    },
    {
      name: 'reviewCount',
      label: 'Review Count',
      type: 'text',
    },
    {
      name: 'analyticsId',
      label: 'Google Analytics ID',
      type: 'text',
    },
    {
      name: 'instagram',
      label: 'Instagram URL',
      type: 'text',
    },
    {
      name: 'youtube',
      label: 'YouTube Channel URL',
      type: 'text',
    },
    {
      name: 'heroCtaLabels',
      label: 'Hero CTA Labels',
      type: 'group',
      fields: [
        {
          name: 'primary',
          type: 'text',
        },
        {
          name: 'secondary',
          type: 'text',
        },
      ],
    },
    {
      name: 'footerText',
      label: 'Footer Text',
      type: 'group',
      fields: [
        {
          name: 'copyright',
          type: 'text',
        },
        {
          name: 'description',
          type: 'text',
        },
      ],
    },
    {
      name: 'defaultSeo',
      label: 'Default SEO',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'logo',
      label: 'Logo Image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'favicon',
      label: 'Favicon Image',
      type: 'upload',
      relationTo: 'media',
    },
  ],
};

