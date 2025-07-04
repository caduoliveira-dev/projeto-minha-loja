"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/utils/globals/money"
import { formatDate } from "@/utils/globals/date"
import { ShoppingCart, User, Calendar, DollarSign } from "lucide-react"

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

interface SaleDetailDialogProps {
  sale: Sale | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaleDetailDialog({ sale, open, onOpenChange }: SaleDetailDialogProps) {
  if (!sale) return null

  const statusConfig = {
    pending: { label: "Pendente", variant: "secondary" as const },
    completed: { label: "Concluída", variant: "default" as const },
    cancelled: { label: "Cancelada", variant: "destructive" as const },
    refunded: { label: "Devolvida", variant: "destructive" as const },
  }

  const config = statusConfig[sale.status] || statusConfig.pending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Detalhes da Venda #{sale.id}
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre esta venda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                Cliente
              </div>
              <div className="font-medium">{sale.customer_name}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Data da Venda
              </div>
              <div className="font-medium">{formatDate(sale.created_at)}</div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Status</div>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>

          {/* Itens da Venda */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Produtos</div>
            <div className="border rounded-lg">
              {sale.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <div className="flex-1">
                    <div className="font-medium">{item.product_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.quantity}x {formatCurrency(item.unit_price)}
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(item.total_price)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Resumo Financeiro</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(sale.subtotal || sale.total_amount)}</span>
              </div>
              {sale.discount && sale.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto:</span>
                  <span>-{formatCurrency(sale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(sale.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 