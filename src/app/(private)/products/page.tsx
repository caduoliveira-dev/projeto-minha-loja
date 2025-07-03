import { ProductsClient } from './products-client'
import { getProducts, getActiveCategories } from './actions'

export default async function ProductsPage() {
  const [productsResult, categoriesResult] = await Promise.all([
    getProducts(),
    getActiveCategories()
  ])
  
  const products = productsResult.success ? productsResult.data : []
  const categories = categoriesResult.success ? categoriesResult.data : []

  return (
    <div className="px-8">
      <ProductsClient initialProducts={products} initialCategories={categories} />
    </div>
  )
} 