import { defineConfig } from 'sanity'
import { visionTool } from '@sanity/vision'
import { structureTool } from 'sanity/structure' // ✅ New

import { schemaTypes } from './schemas'
import { deskStructure } from './deskStructure'

// import Logo from './components/Logo' // If using custom logo

export default defineConfig({
  name: 'default',
  title: 'Pransh Studio',

  projectId: 'tyr2rel9',
  dataset: 'production',

  schema: {
    types: schemaTypes,
  },

  plugins: [
    structureTool({ structure: deskStructure }),
    visionTool()
  ],

  // studio: {
  //   components: {
  //     logo: Logo, // optional
  //   }
  // }
})
