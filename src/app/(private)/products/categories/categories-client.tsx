'use client'

import { useState } from 'react'
import { Category } from '@/lib/types/business'
import { CategoryDialog, CategoryTable, DeleteCategoryDialog } from '@/components/categories'
import { createCategory, deleteCategory, updateCategory } from './actions'
import { toast } from 'sonner'
import { CreateCategoryData } from '@/lib/types/business'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface CategoriesClientProps {
  initialCategories: Category[]
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const handleSaveCategory = async (data: CreateCategoryData) => {
    try {
      if (editingCategory) {
        const result = await updateCategory(editingCategory.id, data)
        if (result.success) {
          setCategories(prev => 
            prev.map(c => 
              c.id === editingCategory.id 
              ? { ...c, ...data } 
              : c
            )
          )
        } else {
          throw new Error(result.error)
        }
      } else {
        // Criar nova categoria
        const result = await createCategory(data)
        if (result.success) {
          // Recarregar lista completa (mais simples)
          window.location.reload()
        } else {
          throw new Error(result.error)
        }
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      throw error
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  const handleDeleteCategory = (category: Category) => {
    setDeletingCategory(category)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return
    try {
      setIsLoading(true)
      const result = await deleteCategory(deletingCategory.id)

      if (result.success) {
        setCategories(prev => prev.filter(c => c.id !== deletingCategory.id))
        toast.success('Categoria excluída com sucesso!')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      toast.error('Erro ao excluir categoria')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewCategory = () => {
    setEditingCategory(null)
    setDialogOpen(true)
  }

  return (
    <div>            
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
            <p className="text-gray-600 mt-2">
                Gerencie as categorias para organizar seus produtos.
            </p>
        </div>
        <Button onClick={handleNewCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>
    <CategoryTable
      categories={categories}
      onEdit={handleEditCategory}
      onDelete={handleDeleteCategory}
    />

    <CategoryDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      category={editingCategory}
      onSave={handleSaveCategory}
    />

    <DeleteCategoryDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      category={deletingCategory}
      onConfirm={handleConfirmDelete}
      isLoading={isLoading}
    />
    </div>
  )
} 