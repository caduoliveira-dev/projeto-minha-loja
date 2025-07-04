import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { NewSaleClient } from './new-sale-client'

export default async function NewSalePage() {
  return (
    <div className="px-8">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nova Venda</h1>
              <p className="text-gray-600 mt-2">
                Registre uma nova venda para seu cliente
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <NewSaleClient />
      </div>
    </div>
  )
} 