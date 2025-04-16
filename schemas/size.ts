// Schema for Size document
export default {
  name: 'size',
  type: 'document',
  title: 'Size',
  fields: [
    {
      name: 'name',
      type: 'string', // Size name like S, M, L
      title: 'Size Name',
      validation: (Rule: any) => Rule.required(),
    },
  ],
};