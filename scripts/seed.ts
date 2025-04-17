// Import necessary libraries
import { createClient } from '@sanity/client'
import { faker } from '@faker-js/faker'
import dotenv from 'dotenv/config'
import fetch from 'node-fetch'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

//Control the number of products to seed
let numberOfProducts = 50

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
  useCdn: false
})

// Predefined seed data for categories, colors, and sizes
const categories = [
  { _id: 'cat-hoodies', name: 'Hoodies' },
  { _id: 'cat-tshirts', name: 'T-Shirts' },
  { _id: 'cat-jeans', name: 'Jeans' },
  { _id: 'cat-shoes', name: 'Shoes' },
]

const colors = [
  { _id: 'color-black', name: 'Black', hex: ['#000000'] },
  { _id: 'color-white', name: 'White', hex: ['#FFFFFF'] },
  { _id: 'color-red', name: 'Red', hex: ['#FF0000', '#DC143C'] },
  { _id: 'color-blue', name: 'Blue', hex: ['#0000FF'] },
  { _id: 'color-green', name: 'Green', hex: ['#008000'] },
  { _id: 'color-golden-fire', name: 'Golden Fire', hex: ['#FF4500', '#FFD700', '#FF8C00'] },
  { _id: 'color-arctic', name: 'Arctic', hex: ['#FFFFFF', '#B3D9FF'] },
]

const sizes = [
  { _id: 'size-s', name: 'S' },
  { _id: 'size-m', name: 'M' },
  { _id: 'size-l', name: 'L' },
  { _id: 'size-xl', name: 'XL' },
]

// Helper function to upload an image and return Sanity image reference object
async function uploadImage(imageUrl: string) {
  try {
    const response = await fetch(imageUrl)
    const buffer = await response.buffer()

    const asset = await client.assets.upload('image', buffer, {
      filename: `product-${faker.string.uuid()}.jpg`,
    })

    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id
      }
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}

// Main seeding function
async function seed() {
  try {
    // Seed base categories if not already created
    console.log('Seeding Categories...')
    for (const cat of categories) {
      await client.createIfNotExists({ _type: 'category', ...cat })
    }

    // Seed base colors
    console.log('Seeding Colors...')
    for (const col of colors) {
      await client.createIfNotExists({ _type: 'color', ...col })
    }

    // Seed base sizes
    console.log('Seeding Sizes...')
    for (const sz of sizes) {
      await client.createIfNotExists({ _type: 'size', ...sz })
    }

    // Create 40 random products
    console.log('Seeding Products...')

    for (let i = 0; i < numberOfProducts; i++) {
      const productName = faker.commerce.productName()

      // Upload main image for the product
      const mainImage = await uploadImage(`https://picsum.photos/800/1000?random=${i}`)

      // Generate random number of variants per product
      const variants = await Promise.all(
        Array.from({ length: faker.number.int({ min: 2, max: 4 }) }).map(async (_, index) => {
          // Random number of images per variant (1–3)
          const images = await Promise.all(
            Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(async (imgIndex) => {
              const img = await uploadImage(`https://picsum.photos/400/500?random=${i}${index}${imgIndex}`)
              return img ? { ...img, _key: faker.string.uuid() } : null
            })
          )

          return {
            _key: faker.string.uuid(), // required by Sanity
            _type: 'object',
            sku: faker.string.uuid(), // unique product SKU
            color: { _type: 'reference', _ref: faker.helpers.arrayElement(colors)._id },
            size: { _type: 'reference', _ref: faker.helpers.arrayElement(sizes)._id },
            price: parseFloat(faker.commerce.price({ min: 20, max: 100 })),
            stock: faker.number.int({ min: 0, max: 100 }),
            images: images.filter(Boolean) // remove any null values from failed uploads
          }
        })
      )

      // Generate unique slug from name + short ID
      const slugBase = faker.helpers.slugify(productName).toLowerCase()
      const uniqueSlug = `${slugBase}-${faker.string.alphanumeric(4).toLowerCase()}`

      // Final product object matching your Sanity schema
      const product = {
        _type: 'product',
        name: productName,
        slug: {
          _type: 'slug',
          current: uniqueSlug
        },
        description: faker.commerce.productDescription(),
        category: { _type: 'reference', _ref: faker.helpers.arrayElement(categories)._id },
        isFeatured: faker.datatype.boolean(),
        rating: faker.number.float({ min: 3, max: 5, fractionDigits: 2 }),
        mainImage: mainImage,
        variants: variants
      }

      await client.create(product)
      console.log(`✅ Created Product ${i + 1}`)
    }

    console.log('🎉 All seed data inserted successfully')
  } catch (error) {
    console.error('❌ Error seeding data:', error)
  }
}

// Run the seed function
seed()
