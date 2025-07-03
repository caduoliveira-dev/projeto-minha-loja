import { ProductsClient } from './products-client'
import { getProducts } from './actions'

export default async function ProductsPage() {
  const productsResult = await getProducts()
  const products = productsResult.success ? productsResult.data : []

  return (
    <div className="px-8">
      <ProductsClient initialProducts={products} />
    </div>
  )
} 