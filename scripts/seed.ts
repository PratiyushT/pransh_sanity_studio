import dotenv from  'dotenv'
import { createClient } from '@sanity/client'
import { faker } from '@faker-js/faker'

dotenv.config({path: './.env'})

// Sanity Client Configuration
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET!,
  apiVersion: '2023-01-01',
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false
})

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

async function seed() {
  console.log('Seeding Categories...')
  for (const cat of categories) {
    await client.createIfNotExists({ _type: 'category', ...cat })
  }

  console.log('Seeding Colors...')
  for (const col of colors) {
    await client.createIfNotExists({ _type: 'color', ...col })
  }

  console.log('Seeding Sizes...')
  for (const sz of sizes) {
    await client.createIfNotExists({ _type: 'size', ...sz })
  }

  console.log('Seeding Products...')

  for (let i = 0; i < 100; i++) {
  const variants = Array.from({ length: faker.number.int({ min: 2, max: 5 }) }).map((_, index) => ({
    _key: String(index + 1),  // Generates '1', '2', '3', ...
    _type: 'object',
    sku: faker.string.uuid(),
    color: { _type: 'reference', _ref: faker.helpers.arrayElement(colors)._id },
    size: { _type: 'reference', _ref: faker.helpers.arrayElement(sizes)._id },
    price: parseFloat(faker.commerce.price({ min: 20, max: 100 })),
    stock: faker.number.int({ min: 0, max: 100 }),
    images: []
  }))

    await client.create({
      _type: 'product',
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      category: { _type: 'reference', _ref: faker.helpers.arrayElement(categories)._id },
      isFeatured: faker.datatype.boolean(),
      rating: faker.number.float({ min: 3, max: 5, fractionDigits: 2 }),
      variants,
    })

    console.log(`Created Product ${i + 1}`)
  }

  console.log('Seeding Completed Successfully!')
}

seed().catch(err => {
  console.error('Error Seeding Data:', err)
})
