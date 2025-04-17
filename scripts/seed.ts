// Import necessary libraries
import {createClient} from '@sanity/client'
import {faker} from '@faker-js/faker'
import dotenv from 'dotenv/config'
import fetch from 'node-fetch'
import {fileURLToPath} from 'url'
import {dirname} from 'path'

// Control the number of products to seed
const numberOfProducts = 50

// Get current file path for potential local usage
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load and validate required environment variables
const requiredEnvVars = ['SANITY_PROJECT_ID', 'SANITY_DATASET', 'SANITY_API_TOKEN']
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

// Initialize the Sanity client
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  apiVersion: '2023-05-03',
  useCdn: false,
})

// Predefined seed data
const categories = [
  {_id: 'cat-hoodies', name: 'Hoodies'},
  {_id: 'cat-tshirts', name: 'T-Shirts'},
  {_id: 'cat-jeans', name: 'Jeans'},
  {_id: 'cat-shoes', name: 'Shoes'},
]

const colors = [
  {_id: 'color-black', name: 'Black', hex: ['#000000']},
  {_id: 'color-white', name: 'White', hex: ['#FFFFFF']},
  {_id: 'color-red', name: 'Red', hex: ['#FF0000', '#DC143C']},
  {_id: 'color-blue', name: 'Blue', hex: ['#0000FF']},
  {_id: 'color-green', name: 'Green', hex: ['#008000']},
  {_id: 'color-golden-fire', name: 'Golden Fire', hex: ['#FF4500', '#FFD700', '#FF8C00']},
  {_id: 'color-arctic', name: 'Arctic', hex: ['#FFFFFF', '#B3D9FF']},
]

const sizes = [
  {_id: 'size-s', name: 'S'},
  {_id: 'size-m', name: 'M'},
  {_id: 'size-l', name: 'L'},
  {_id: 'size-xl', name: 'XL'},
]

// Helper to upload image and return ref
async function uploadImage(imageUrl: string) {
  try {
    const response = await fetch(imageUrl)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const asset = await client.assets.upload('image', buffer, {
      filename: `product-${faker.string.uuid()}.jpg`,
    })

    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}

// Main seed function
async function seed() {
  try {
    // Step 1: Base data
    console.log('🌱 Seeding Categories...')
    for (const cat of categories) {
      await client.createIfNotExists({_type: 'category', ...cat})
    }

    console.log('🌱 Seeding Colors...')
    for (const col of colors) {
      await client.createIfNotExists({_type: 'color', ...col})
    }

    console.log('🌱 Seeding Sizes...')
    for (const sz of sizes) {
      await client.createIfNotExists({_type: 'size', ...sz})
    }

    // Step 2: Products and Variants
    console.log('🌱 Seeding Products & Variants...')

    for (let i = 0; i < numberOfProducts; i++) {
      const productName = faker.commerce.productName()
      const slugBase = faker.helpers.slugify(productName).toLowerCase()
      const uniqueSlug = `${slugBase}-${faker.string.alphanumeric(4).toLowerCase()}`

      const mainImage = await uploadImage(`https://picsum.photos/800/1000?random=${i}`)

      // Create product (no variants yet)
      const product = await client.create({
        _type: 'product',
        name: productName,
        slug: {_type: 'slug', current: uniqueSlug},
        description: faker.commerce.productDescription(),
        category: {_type: 'reference', _ref: faker.helpers.arrayElement(categories)._id},
        isFeatured: faker.datatype.boolean(),
        rating: faker.number.float({min: 3, max: 5, fractionDigits: 2}),
        mainImage,
        variants: [],
      })

      // Create variants
      const variantCount = faker.number.int({min: 2, max: 4})
      const variantRefs: any[] = []

      for (let v = 0; v < variantCount; v++) {
        const images = await Promise.all(
          Array.from({length: faker.number.int({min: 1, max: 3})}).map(async (_, idx) => {
            const img = await uploadImage(`https://picsum.photos/400/500?random=${i}${v}${idx}`)
            return img ? {...img, _key: faker.string.uuid()} : null
          }),
        )

        const variantDoc = {
          _type: 'variant',
          product: {_type: 'reference', _ref: product._id},
          sku: faker.string.uuid(),
          color: {_type: 'reference', _ref: faker.helpers.arrayElement(colors)._id},
          size: {_type: 'reference', _ref: faker.helpers.arrayElement(sizes)._id},
          price: parseFloat(faker.commerce.price({min: 20, max: 100})),
          stock: faker.number.int({min: 0, max: 100}),
          images: images
            .filter((img): img is {_type: 'image'; asset: {_ref: string}} => !!img)
            .map((img) => ({
              ...img,
              _key: faker.string.uuid(),
            })),
        }

        const createdVariant = await client.create(variantDoc)
        variantRefs.push({_type: 'reference', _ref: createdVariant._id})
      }

      await client
        .patch(product._id)
        .set({
          variants: variantRefs.map((ref) => ({
            ...ref,
            _key: faker.string.uuid(),
          })),
        })
        .commit()

      console.log(`✅ Created Product ${i + 1} with ${variantRefs.length} variants`)
    }

    console.log('🎉 Seeding complete!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Wrap seed in main() for ESM
async function main() {
  try {
    await seed()
  } catch (err) {
    console.error('❌ Uncaught Error while seeding:', err)
    process.exit(1)
  } finally {
    console.log('🧹 Done with seeding script.')
  }
}

main()
