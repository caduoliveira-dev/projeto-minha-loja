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
import { Category } from "@/lib/types/business"

interface DeleteCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
  onConfirm: () => void
  isLoading: boolean
}

export function DeleteCategoryDialog({
    open,
    onOpenChange,
    category,
    onConfirm,
    isLoading = false
}: DeleteCategoryDialogProps) {
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
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a categoria "{category?.name}"?
            <br />
            <br />
            Esta ação irá desativar a categoria e ela não aparecerá mais na lista.
            A exclusão pode ser revertida posteriormente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 