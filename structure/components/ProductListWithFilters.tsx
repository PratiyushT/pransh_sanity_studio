import React, { useState, useEffect } from 'react'
import { Box, Card, Flex, Select, Stack, Text } from '@sanity/ui'
import { useClient, useDocumentStore } from 'sanity'
import { DocumentListPaneItem, PaneItemPreview } from 'sanity/structure'

type Product = {
  _id: string
  name: string
  _type: string
  slug?: { current: string }
}

export default function ProductListWithFilters() {
  const client = useClient({ apiVersion: '2023-05-03' })
  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchData = async () => {
      let query = `*[_type == "product"]`

      if (filter === 'low') {
        query = `*[_type == "product" && count(*[_type == "variant" && references(^._id) && stock < 10]) > 0]`
      } else if (filter === 'out') {
        query = `*[_type == "product" && count(*[_type == "variant" && references(^._id) && stock == 0]) > 0]`
      } else if (filter === 'high') {
        query = `*[_type == "product" && count(*[_type == "variant" && references(^._id) && stock > 50]) > 0]`
      }

      const result = await client.fetch(query)
      setProducts(result)
    }

    fetchData()
  }, [filter])

  return (
    <Box padding={4}>
      <Flex justify="flex-end" marginBottom={3}>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.currentTarget.value)}
        >
          <option value="all">All Products</option>
          <option value="low">⚠️ Low Stock</option>
          <option value="out">🚫 Out of Stock</option>
          <option value="high">📦 High Stock</option>
        </Select>
      </Flex>

      <Stack space={3}>
        {products.map((product) => (
          <Card
            key={product._id}
            padding={3}
            radius={2}
            shadow={1}
            tone="default"
          >
            <Text weight="semibold">{product.name}</Text>
            <Text size={1} muted>
              {product.slug?.current}
            </Text>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}
