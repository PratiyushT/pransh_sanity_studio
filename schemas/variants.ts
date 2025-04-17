import {defineType} from 'sanity'

export default defineType({
  name: 'variant',
  type: 'document',
  title: 'Product Variant',
  fields: [
    {
      name: 'product',
      type: 'reference',
      title: 'Parent Product',
      to: [{type: 'product'}],
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'sku',
      type: 'string',
      title: 'SKU',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'color',
      type: 'reference',
      to: [{type: 'color'}],
      title: 'Color',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'size',
      type: 'reference',
      to: [{type: 'size'}],
      title: 'Size',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'price',
      type: 'number',
      title: 'Price',
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: 'stock',
      type: 'number',
      title: 'Stock',
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: 'images',
      type: 'array',
      title: 'Images',
      of: [{type: 'image', options: {hotspot: true}}],
    },
  ],
  preview: {
    select: {
      product: 'product.name',
      size: 'size.name',
      color: 'color.name',
      stock: 'stock',
      media: 'images.0.asset',
    },
    prepare({product, size, color, stock, media}) {
      const titleParts = [product, size, color].filter(Boolean)
      return {
        title: titleParts.join(' '),
        subtitle: `Stock: ${stock ?? 0}`,
        media,
      }
    },
  },
})
