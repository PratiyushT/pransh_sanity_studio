import { defineType } from 'sanity'

export default defineType({
  name: 'product',
  type: 'document',
  title: 'Product',
  fields: [
    {
      name: 'name',
      type: 'string',
      title: 'Product Name',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'name',
        maxLength: 96,
        isUnique: (inputSlug: string, context) => {
          const { document, getClient } = context
          const client = getClient({ apiVersion: '2023-05-03' })
          return client.fetch(
            `!defined(*[_type == "product" && slug.current == $slug && _id != $docId][0])`,
            { slug: inputSlug, docId: document._id }
          )
        },
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      type: 'text',
      title: 'Description',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'category',
      type: 'reference',
      to: [{ type: 'category' }],
      title: 'Category',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'isFeatured',
      type: 'boolean',
      title: 'Featured Product?',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'rating',
      type: 'number',
      title: 'Rating (readonly)',
      readOnly: true,
      validation: (Rule) => Rule.min(0),
    },
    {
      name: 'mainImage',
      type: 'image',
      title: 'Main Image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'variants',
      type: 'array',
      title: 'Variants',
      of: [{ type: 'reference', to: [{ type: 'variant' }] }],
      options: {
        layout: 'grid'
      }
    }
    
  ],

  preview: {
    select: {
      title: 'name',
      media: 'mainImage',
      stock: 'variants.0.stock',
    },
    prepare({ title, stock, media }) {
      return {
        title,
        subtitle: `Stock: ${stock ?? 0}`,
        media,
      }
    },
  },
})
