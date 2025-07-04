"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { PaymentMethodTable, PaymentMethodDialog } from '@/components/payment-methods'
import { PaymentMethod, CreatePaymentMethodData } from '@/lib/types/business'
import { toast } from 'sonner'
import { createPaymentMethod, updatePaymentMethod, deletePaymentMethod, togglePaymentMethodActive } from './actions'

interface PaymentMethodsClientProps {
  initialPaymentMethods: PaymentMethod[]
}

export function PaymentMethodsClient({ initialPaymentMethods }: PaymentMethodsClientProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods)
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null)

  // Salvar forma de pagamento (criar ou atualizar)
  const handleSavePaymentMethod = async (data: CreatePaymentMethodData) => {
    try {
      if (editingPaymentMethod) {
        // Atualizar forma de pagamento existente
        const result = await updatePaymentMethod(editingPaymentMethod.id, data)
        if (result.success) {
          setPaymentMethods(prev =>
            prev.map(p =>
              p.id === editingPaymentMethod.id && result.data
                ? result.data
                : p
            )
          )
          toast.success('Forma de pagamento atualizada com sucesso!')
        } else {
          throw new Error(result.error)
        }
      } else {
        // Criar nova forma de pagamento
        const result = await createPaymentMethod(data)
        if (result.success) {
          setPaymentMethods(prev => [...prev, result.data!])
          toast.success('Forma de pagamento criada com sucesso!')
        } else {
          throw new Error(result.error)
        }
      }
    } catch (error) {
      console.error('Erro ao salvar forma de pagamento:', error)
      toast.error('Erro ao salvar forma de pagamento')
      throw error
    }
  }

  // Editar forma de pagamento
  const handleEditPaymentMethod = (paymentMethod: PaymentMethod) => {
    setEditingPaymentMethod(paymentMethod)
    setDialogOpen(true)
  }

  // Excluir forma de pagamento
  const handleDeletePaymentMethod = async (paymentMethod: PaymentMethod) => {
    try {
      setIsLoading(true)
      const result = await deletePaymentMethod(paymentMethod.id)
      
      if (result.success) {
        setPaymentMethods(prev => prev.filter(p => p.id !== paymentMethod.id))
        toast.success('Forma de pagamento excluída com sucesso!')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Erro ao excluir forma de pagamento:', error)
      toast.error('Erro ao excluir forma de pagamento')
    } finally {
      setIsLoading(false)
    }
  }

  // Ativar/desativar forma de pagamento
  const handleToggleActive = async (paymentMethod: PaymentMethod) => {
    try {
      const result = await togglePaymentMethodActive(paymentMethod.id, !paymentMethod.active)
      
      if (result.success) {
        setPaymentMethods(prev =>
          prev.map(p =>
            p.id === paymentMethod.id
              ? { ...p, active: !p.active }
              : p
          )
        )
        toast.success(`Forma de pagamento ${paymentMethod.active ? 'desativada' : 'ativada'} com sucesso!`)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Erro ao alterar status da forma de pagamento:', error)
      toast.error('Erro ao alterar status da forma de pagamento')
    }
  }

  // Abrir dialog para nova forma de pagamento
  const handleNewPaymentMethod = () => {
    setEditingPaymentMethod(null)
    setDialogOpen(true)
  }

  return (
    <>
      <div>            
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Formas de Pagamento</h1>
            <p className="text-gray-600 mt-2">
              Gerencie as formas de pagamento disponíveis para suas vendas.
            </p>
          </div>
          <Button onClick={handleNewPaymentMethod}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Forma de Pagamento
          </Button>
        </div>

        <PaymentMethodTable 
          paymentMethods={paymentMethods} 
          onEdit={handleEditPaymentMethod}
          onDelete={handleDeletePaymentMethod}
          onToggleActive={handleToggleActive}
        />
      </div>

      {/* Dialog */}
      <PaymentMethodDialog
        paymentMethod={editingPaymentMethod}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSavePaymentMethod}
        isLoading={isLoading}
      />
    </>
  )
} 