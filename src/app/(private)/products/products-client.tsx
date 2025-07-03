"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Package, Plus } from 'lucide-react'
import { ProductTable, ProductDialog, DeleteProductDialog } from '@/components/products'
import { Product, CreateProductData, Category } from '@/lib/types/business'
import { toast } from 'sonner'
import { createProduct, updateProduct, deleteProduct } from './actions'

interface ProductsClientProps {
  initialProducts: Product[]
  initialCategories: Category[]
}

export function ProductsClient({ initialProducts, initialCategories }: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  // Salvar produto (criar ou atualizar)
  const handleSaveProduct = async (data: CreateProductData) => {
    try {
      if (editingProduct) {
        // Atualizar produto existente
        const result = await updateProduct(editingProduct.id, data)
        if (result.success) {
          // Atualizar lista local
          setProducts(prev => 
            prev.map(p => 
              p.id === editingProduct.id 
                ? { ...p, ...data }
                : p
            )
          )
        } else {
          throw new Error(result.error)
        }
      } else {
        // Criar novo produto
        const result = await createProduct(data)
        if (result.success) {
          // Recarregar lista completa (mais simples)
          window.location.reload()
        } else {
          throw new Error(result.error)
        }
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      throw error // Re-throw para o dialog tratar
    }
  }

  // Editar produto
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  // Abrir dialog de confirmação de exclusão
  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product)
    setDeleteDialogOpen(true)
  }

  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return

    try {
      setIsLoading(true)
      const result = await deleteProduct(deletingProduct.id)
      
      if (result.success) {
        // Remover da lista local
        setProducts(prev => prev.filter(p => p.id !== deletingProduct.id))
        toast.success('Produto excluído com sucesso!')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      toast.error('Erro ao excluir produto')
    } finally {
      setIsLoading(false)
    }
  }

  // Abrir dialog para novo produto
  const handleNewProduct = () => {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  return (
    <>
      {products.length > 0 ? (
        <div>            
          <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
                <p className="text-gray-600 mt-2">
                    Gerencie seu catálogo de produtos e controle de estoque.
                </p>
            </div>
            <Button onClick={handleNewProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>
          <ProductTable
            products={products}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum produto cadastrado
          </h3>
          <p className="text-gray-600 mb-4">
            Comece cadastrando seu primeiro produto para gerenciar o estoque.
          </p>

        </div>
      )}

      {/* Dialog para criar/editar produto */}
      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        categories={categories}
        onSave={handleSaveProduct}
      />

      {/* Dialog de confirmação de exclusão */}
      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        product={deletingProduct}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </>
  )
} 