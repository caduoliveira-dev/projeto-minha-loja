import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tag } from 'lucide-react'
import { CategoriesClient } from './categories-client'
import { getCategories } from './actions'

export default async function CategoriesPage() {
  const categoriesResult = await getCategories()
  const categories = categoriesResult.success ? categoriesResult.data : []

  return (
    <div className="px-8">
        <CategoriesClient initialCategories={categories} />
    </div>
  )
} 