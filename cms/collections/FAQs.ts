import { CollectionConfig } from 'payload';
import { revalidateFaqDoc } from '../hooks/revalidation';

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'q',
    defaultColumns: ['q', 'a'],
  },
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
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Linked Categories',
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: 'Linked Products',
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        await revalidateFaqDoc(req.payload, doc);
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await revalidateFaqDoc(req.payload, doc);
        return doc;
      },
    ],
  },
};
