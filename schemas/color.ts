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
      type: 'array', // Array of hex codes
      title: 'Color Hex Codes',
      of: [{ type: 'string' }],
      validation: (Rule: any) => Rule.required().max(3), // Maximum 3 hex codes
    },
  ],
};
