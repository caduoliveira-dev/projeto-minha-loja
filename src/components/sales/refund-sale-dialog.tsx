"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/utils/globals/money"
import { ShoppingCart, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface Sale {
  id: string
  customer_id: string
  customer_name: string
  total_amount: number
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  created_at: string
  updated_at: string
}

interface RefundSaleDialogProps {
  sale: Sale | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (saleId: string, reason: string) => Promise<void>
}

export function RefundSaleDialog({ sale, open, onOpenChange, onConfirm }: RefundSaleDialogProps) {
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    if (!sale || !reason.trim()) {
      toast.error("Por favor, informe o motivo da devolução")
      return
    }

    try {
      setIsLoading(true)
      await onConfirm(sale.id, reason.trim())
      toast.success("Venda estornada com sucesso!")
      setReason("")
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao estornar venda:', error)
      toast.error("Erro ao estornar venda")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setReason("")
    onOpenChange(false)
  }

  if (!sale) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Estornar Venda #{sale.id}
          </DialogTitle>
          <DialogDescription>
            Confirme o estorno desta venda. O estoque será retornado aos produtos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações da Venda */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cliente:</span>
                <span className="font-medium">{sale.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Valor:</span>
                <span className="font-medium">{formatCurrency(sale.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Aviso */}
          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-medium">Atenção!</p>
              <p>Esta ação irá:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Alterar o status da venda para "Devolvida"</li>
                <li>Retornar o estoque aos produtos</li>
                <li>Registrar o motivo da devolução</li>
              </ul>
            </div>
          </div>

          {/* Motivo da Devolução */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo da Devolução *</Label>
            <Textarea
              id="reason"
              placeholder="Descreva o motivo da devolução..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={isLoading || !reason.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? "Estornando..." : "Confirmar Estorno"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 