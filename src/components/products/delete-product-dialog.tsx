"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Product } from "@/lib/types/business"

interface DeleteProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onConfirm: () => Promise<void>
  isLoading?: boolean
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  product,
  onConfirm,
  isLoading = false
}: DeleteProductDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      // Erro será tratado pelo componente pai
      console.error('Erro ao excluir produto:', error)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o produto{" "}
            <strong>"{product?.name}"</strong>?
            <br />
            <br />
            Esta ação irá desativar o produto e ele não aparecerá mais na lista.
            A exclusão pode ser revertida posteriormente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading ? "Excluindo..." : "Excluir Produto"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 