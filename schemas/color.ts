// Schema for Color document
export default {
  name: 'color',
  type: 'document',
  title: 'Color',
  fields: [
    {
      name: 'name',
      type: 'string',
      title: 'Color Name',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'hex',
      type: 'string', // Hex code for color display
      title: 'Color Hex',
      validation: (Rule: any) => Rule.required(),
    },
  ],
};
