import { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { revalidateResourceDoc } from '../hooks/revalidation';

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
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({}),
      label: 'Article Body (optional, for long-form blog posts)',
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Article Image Gallery (optional, e.g. one image per idea/step)',
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
      ],
    },
    {
      name: 'faqs',
      type: 'array',
      label: 'Article FAQs (optional, drives this article\'s FAQ schema)',
      fields: [
        {
          name: 'q',
          type: 'text',
          required: true,
          label: 'Question',
        },
        {
          name: 'a',
          type: 'textarea',
          required: true,
          label: 'Answer',
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        await revalidateResourceDoc(req.payload, doc);
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await revalidateResourceDoc(req.payload, doc);
        return doc;
      },
    ],
  },
};
