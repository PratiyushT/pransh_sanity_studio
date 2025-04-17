/**
 * Color Schema Definition
 * 
 * This schema defines the structure for color documents in the Sanity Studio.
 * Each color document represents a product color option with multiple hex code variations.
 */

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
      // Ensures that every color must have a name
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'hex',
      type: 'array', // Array of hex codes
      title: 'Color Hex Codes',
      // Defines that each array item should be a string (hex code)
      of: [{ type: 'string' }],
      // Validation rules:
      // - required(): At least one hex code must be provided
      // - max(3): Maximum of 3 hex codes allowed per color
      validation: (Rule: any) => Rule.required().max(3),
    },
  ],
};
