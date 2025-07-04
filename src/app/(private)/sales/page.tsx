import { SalesClient } from './sales-client'
import { getSales } from './actions'

export default async function SalesPage() {
  const salesResult = await getSales()
  const sales = salesResult.success && salesResult.data ? salesResult.data : []

  return (
    <div className="px-8">
      <SalesClient initialSales={sales} />
    </div>
  )
} 