import React, {useEffect, useState, forwardRef} from 'react'
import {Card, Text, Heading, Grid, Box} from '@sanity/ui'
import {createClient} from '@sanity/client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

// =============================================================================
// 1. Sanity Client Setup
// =============================================================================
// Use hardcoded values here because Sanity Studio's browser bundle doesn't
// support process.env or dotenv (these values are public project metadata).
const client = createClient({
  projectId: 'tyr2rel9', // Replace with your Sanity project ID
  dataset: 'production', // Replace if using a different dataset
  apiVersion: '2023-05-03', // Make sure this matches your config
  useCdn: false,
})

// Colors array for charts
const chartColors = ['#D4AF37', '#FF5733', '#33FFCE', '#4287f5', '#8e44ad']

// =============================================================================
// 2. Dashboard Component (wrapped in forwardRef for compatibility)
// =============================================================================
const Dashboard = forwardRef(function Dashboard(_props, ref) {
  // State variables for fetched stats and chart data
  const [stats, setStats] = useState<any>(null)
  const [categoryPieData, setCategoryPieData] = useState<any[]>([])
  const [lowStockData, setLowStockData] = useState<any[]>([])

  // =============================================================================
  // 3. Data Fetching using a valid GROQ query (calculate stock in JS)
  // =============================================================================
  useEffect(() => {
    const fetchData = async () => {
      const statsQuery = `{
        "totalProducts": count(*[_type == 'product']),
        "totalVariants": count(*[_type == 'variant']),
        "lowStockVariants": count(*[_type == 'variant' && stock < 10]),
        "outOfStock": count(*[_type == 'variant' && stock == 0]),
        "categories": *[_type == 'category']{
          name,
          "count": count(*[_type == 'product' && references(^._id)])
        },
        "lowStockList": *[_type == 'product']{
          name,
          "variants": *[_type == 'variant' && references(^._id)]{stock}
        }
      }`

      try {
        const res = await client.fetch(statsQuery)

        // Process low stock list manually
        const processed = res.lowStockList
          .map((product: any) => ({
            name: product.name,
            stock: product.variants.reduce((acc: number, v: any) => acc + (v.stock ?? 0), 0),
          }))
          .sort((a: any, b: any) => a.stock - b.stock)
          .slice(0, 5)

        setStats(res)
        setCategoryPieData(res.categories || [])
        setLowStockData(processed)
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
      }
    }

    fetchData()
  }, [])

  if (!stats) return <Text>Loading...</Text>

  return (
    <Box padding={4} ref={ref}>
      <Heading size={1} marginBottom={4}>📊 Inventory Dashboard</Heading>

      <Grid columns={4} gap={4} marginBottom={5}>
        <Card padding={4} shadow={1} radius={2} tone="positive">
          <Text size={2}>👜 Products</Text>
          <Heading size={2}>{stats.totalProducts}</Heading>
        </Card>
        <Card padding={4} shadow={1} radius={2} tone="caution">
          <Text size={2}>🧩 Variants</Text>
          <Heading size={2}>{stats.totalVariants}</Heading>
        </Card>
        <Card padding={4} shadow={1} radius={2} tone="critical">
          <Text size={2}>⚠️ Low Stock</Text>
          <Heading size={2}>{stats.lowStockVariants}</Heading>
        </Card>
        <Card padding={4} shadow={1} radius={2} tone="critical">
          <Text size={2}>⛔ Out of Stock</Text>
          <Heading size={2}>{stats.outOfStock}</Heading>
        </Card>
      </Grid>

      <Grid columns={2} gap={5}>
        <Card padding={4} radius={2} shadow={1}>
          <Heading size={1} marginBottom={3}>📦 Product Categories</Heading>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryPieData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {categoryPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card padding={4} radius={2} shadow={1}>
          <Heading size={1} marginBottom={3}>📉 Lowest Stock Products</Heading>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lowStockData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="stock" fill="#FF6B6B" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Grid>
    </Box>
  )
})

export default Dashboard