"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart } from 'lucide-react'
import { SaleTable, SaleDetailDialog, RefundSaleDialog } from '@/components/sales'
import { refundSale } from './actions'

interface SaleItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Sale {
  id: string
  customer_id: string
  customer_name: string
  total_amount: number
  subtotal?: number
  discount?: number
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  created_at: string
  updated_at: string
  items?: SaleItem[]
}

interface SalesClientProps {
  initialSales: Sale[]
}

export function SalesClient({ initialSales }: SalesClientProps) {
  const [sales, setSales] = useState<Sale[]>(initialSales)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)

  // Função para visualizar detalhes da venda
  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale)
    setDetailDialogOpen(true)
  }

  // Função para estornar venda
  const handleRefundSale = (sale: Sale) => {
    setSelectedSale(sale)
    setRefundDialogOpen(true)
  }

  // Função para confirmar estorno
  const handleConfirmRefund = async (saleId: string, reason: string) => {
    try {
      setIsLoading(true)
      
      const result = await refundSale(saleId, reason)
      
      if (result.success) {
        // Atualizar status local
        setSales(prev => 
          prev.map(sale => 
            sale.id === saleId 
              ? { ...sale, status: 'refunded' as const }
              : sale
          )
        )
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Erro ao estornar venda:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div>            
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
            <p className="text-gray-600 mt-2">
              Gerencie suas vendas e controle financeiro
            </p>
          </div>
          <Link href="/sales/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Venda
            </Button>
          </Link>
        </div>

        {/* Content */}
        <SaleTable 
          sales={sales} 
          onView={handleViewSale}
          onRefund={handleRefundSale}
        />
      </div>

      {/* Diálogos */}
      <SaleDetailDialog
        sale={selectedSale}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
      
      <RefundSaleDialog
        sale={selectedSale}
        open={refundDialogOpen}
        onOpenChange={setRefundDialogOpen}
        onConfirm={handleConfirmRefund}
      />
    </>
  )
} 