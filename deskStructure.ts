import { StructureBuilder } from 'sanity/structure'

export const deskStructure = (S: StructureBuilder) =>
  S.list()
    .title('Dashboard')
    .items([
      // 🔹 Products
      S.listItem()
        .title('👜 Products')
        .child(S.documentTypeList('product').title('All Products')),

      // 🔹 Categories
      S.listItem()
        .title('📦 Categories')
        .child(S.documentTypeList('category').title('All Categories')),

      // 🔹 Colors
      S.listItem()
        .title('🎨 Colors')
        .child(S.documentTypeList('color').title('All Colors')),

      // 🔹 Sizes
      S.listItem()
        .title('📐 Sizes')
        .child(S.documentTypeList('size').title('All Sizes')),

      // Divider
      S.divider(),

      // 🔺 Low Stock Variants (stock < 10)
      S.listItem()
        .title('⚠️ Low Stock Variants')
        .child(
          S.documentTypeList('variant')
            .title('Low Stock Variants')
            .filter('stock < 10')
        ),

      // ➕ Create Product
      S.listItem()
        .title('➕ Create New Product')
        .child(
          S.editor()
            .schemaType('product')
            .documentId('new-product')
        ),

      // 🧩 Variants grouped by Product
      S.listItem()
        .title('🧩 Variants by Product')
        .child(
          S.documentTypeList('product')
            .title('All Products')
            .child(productId =>
              S.documentList()
                .title('Variants')
                .filter('_type == "variant" && product._ref == $productId')
                .params({ productId })
            )
        ),

      // 🔺 Low Stock Products (based on low stock variants)
      S.listItem()
        .title('⚠️ Low Stock Products')
        .child(
          S.documentList()
            .title('Low Stock Products')
            .filter(`
              _type == "product" &&
              count(*[_type == "variant" && references(^._id) && stock < 10]) > 0
            `)
        ),

      // Optional: All Variants flat list (uncomment if needed)
      // S.listItem()
      //   .title('🧩 All Variants (flat)')
      //   .child(S.documentTypeList('variant').title('All Variants')),
    ])
