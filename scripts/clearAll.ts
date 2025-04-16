import dotenv from 'dotenv'
import {createClient} from '@sanity/client'

dotenv.config({path: './.env'})

// Sanity Client Setup
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET!,
  apiVersion: '2023-01-01',
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false
})


async function clear() {
  console.log('Deleting all products...')
  await client.delete({query: '*[_type == "product"]'})

  console.log('Deleting all categories...')
  await client.delete({query: '*[_type == "category"]'})

  console.log('Deleting all colors...')
  await client.delete({query: '*[_type == "color"]'})

  console.log('Deleting all sizes...')
  await client.delete({query: '*[_type == "size"]'})

  console.log('All documents deleted successfully!')
}

clear().catch(err => {
  console.error('Error deleting documents:', err)
})

export default clear