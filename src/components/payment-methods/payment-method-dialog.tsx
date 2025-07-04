"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard } from "lucide-react"
import { toast } from "sonner"
import { PaymentMethod, CreatePaymentMethodData } from "@/lib/types/business"

interface PaymentMethodDialogProps {
  paymentMethod: PaymentMethod | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreatePaymentMethodData) => Promise<void>
  isLoading?: boolean
}

const PAYMENT_TYPES = [
  { value: 'cash', label: 'Dinheiro' },
  { value: 'credit', label: 'Cartão de Crédito' },
  { value: 'debit', label: 'Cartão de Débito' },
  { value: 'pix', label: 'PIX' },
  { value: 'other', label: 'Outro' },
]

const PAYMENT_CATEGORIES = [
  { value: 'immediate', label: 'À Vista' },
  { value: 'installment', label: 'A Prazo' },
]

export function PaymentMethodDialog({ 
  paymentMethod, 
  open, 
  onOpenChange, 
  onSubmit, 
  isLoading 
}: PaymentMethodDialogProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<string>("")
  const [paymentType, setPaymentType] = useState<string>("")

  // Reset form when dialog opens/closes or payment method changes
  useEffect(() => {
    if (open) {
      if (paymentMethod) {
        setName(paymentMethod.name)
        setType(paymentMethod.type)
        setPaymentType(paymentMethod.payment_type)
      } else {
        setName("")
        setType("")
        setPaymentType("")
      }
    }
  }, [open, paymentMethod])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Nome é obrigatório")
      return
    }

    if (!type) {
      toast.error("Tipo de pagamento é obrigatório")
      return
    }

    if (!paymentType) {
      toast.error("Categoria de pagamento é obrigatória")
      return
    }

    const data: CreatePaymentMethodData = {
      name: name.trim(),
      type: type as any,
      payment_type: paymentType as any,
    }

    try {
      await onSubmit(data)
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao salvar forma de pagamento:', error)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {paymentMethod ? 'Editar' : 'Nova'} Forma de Pagamento
          </DialogTitle>
          <DialogDescription>
            Configure uma forma de pagamento para suas vendas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Cartão de Crédito"
            />
          </div>

          <div className="flex justify-between">
            {/* Tipo de Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Pagamento *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TYPES.map((paymentType) => (
                    <SelectItem key={paymentType.value} value={paymentType.value}>
                      {paymentType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoria (À Vista/A Prazo) */}
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <RadioGroup value={paymentType} onValueChange={setPaymentType} className="grid grid-cols-2 gap-4">
                {PAYMENT_CATEGORIES.map((category) => (
                  <div key={category.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={category.value} id={category.value} />
                    <Label htmlFor={category.value} className="text-sm font-normal cursor-pointer">
                      {category.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>



          {/* Botões */}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !name.trim() || !type || !paymentType}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 