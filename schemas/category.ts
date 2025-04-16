// Schema for Category document
export default {
  name: 'category', // Unique identifier for Sanity
  type: 'document', // Declares a document type
  title: 'Category', // Display title in Sanity Studio
  fields: [
    {
      name: 'name', // Field name for internal usage
      type: 'string', // Data type - string input
      title: 'Category Name', // Label in the UI
      validation: (Rule: any) => Rule.required(), // Validation to make field required
    },
    {
      name: 'image', // Field name for image
      type: 'image', // Data type - image
      title: 'Category Image', // Label in the UI
      options: { hotspot: true }, // Enables cropping tool
      validation: (Rule: any) => Rule.required(), // Validation to make field required
    },
  ],
};
