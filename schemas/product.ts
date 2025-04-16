// Schema for Product document
export default {
  name: 'product',
  type: 'document',
  title: 'Product',
  fields: [
    {
      name: 'name',
      type: 'string',
      title: 'Product Name',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      type: 'text', // Multi-line text field
      title: 'Description',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      type: 'reference', // Reference to Category document
      to: [{ type: 'category' }],
      title: 'Category',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'isFeatured', // Boolean to mark featured product
      type: 'boolean',
      title: 'Featured Product?',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'rating',
      type: 'number',
      title: 'Rating (readonly)', // Average rating from backend
      readOnly: true, // Cannot be edited manually
      validation: (Rule: any) => Rule.min(0),

    },
    {
      name: 'variants',
      type: 'array', // Array of variant objects
      title: 'Variants',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'sku',
              type: 'string', // Unique SKU per variant
              title: 'SKU',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'color',
              type: 'reference',
              to: [{ type: 'color' }],
              title: 'Color',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'size',
              type: 'reference',
              to: [{ type: 'size' }],
              title: 'Size',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'price',
              type: 'number',
              title: 'Price',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'stock',
              type: 'number',
              title: 'Stock',
              validation: (Rule: any) => Rule.min(0), // Must be >= 0
            },
            {
              name: 'images',
              type: 'array', // Multiple images per variant
              of: [{ type: 'image', options: { hotspot: true } }],
              title: 'Images',
            },
          ],
        },
      ],
      validation: (Rule: any) => Rule.min(1),
    },
  ],
};
