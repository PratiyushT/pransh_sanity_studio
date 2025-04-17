import dotenv from 'dotenv/config'
import { createClient } from '@sanity/client'

// Run with: pnpx tsx scripts/clearAll.ts

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET!,
  apiVersion: '2023-01-01',
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false
})

async function breakReferences() {
  console.log('🔗 Removing references between products and variants...')

  // Remove all product -> variants reference arrays
  const products = await client.fetch(`*[_type == "product" && defined(variants)]{_id}`)
  for (const p of products) {
    await client.patch(p._id).unset(['variants']).commit()
  }

  // Remove all variant -> product references
  const variants = await client.fetch(`*[_type == "variant" && defined(product)]{_id}`)
  for (const v of variants) {
    await client.patch(v._id).unset(['product']).commit()
  }

  console.log('✅ References removed.')
}

async function clearAll() {
  try {
    await breakReferences()

    console.log('🗑 Deleting all variants...')
    await client.delete({ query: '*[_type == "variant"]' })

    console.log('🗑 Deleting all products...')
    await client.delete({ query: '*[_type == "product"]' })

    console.log('🗑 Deleting all categories...')
    await client.delete({ query: '*[_type == "category"]' })

    console.log('🗑 Deleting all colors...')
    await client.delete({ query: '*[_type == "color"]' })

    console.log('🗑 Deleting all sizes...')
    await client.delete({ query: '*[_type == "size"]' })

    console.log('✅ All documents deleted successfully!')
  } catch (err) {
    console.error('❌ Error during deletion:', err)
    process.exit(1)
  }
}

clearAll()
