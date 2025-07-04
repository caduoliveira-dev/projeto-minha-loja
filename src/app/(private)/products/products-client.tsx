"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Package, Plus } from 'lucide-react'
import { ProductTable, ProductDialog, DeleteProductDialog } from '@/components/products'
import { Product, CreateProductData, Category } from '@/lib/types/business'
import { toast } from 'sonner'
import { createProduct, updateProduct, deleteProduct, getProductById, getFilteredProducts } from './actions'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'

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
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Filtros
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedMovesStock, setSelectedMovesStock] = useState<boolean[]>([])
  const [showInactive, setShowInactive] = useState(false)

  // Função para buscar produtos filtrados
  const fetchFilteredProducts = async () => {
    setLoadingProducts(true)
    const filters = {
      category_ids: selectedCategories,
      moves_stock_list: selectedMovesStock,
      active: showInactive ? false : true,
    }
    const result = await getFilteredProducts(filters)
    setProducts(result.success ? result.data : [])
    setLoadingProducts(false)
  }

  // Buscar produtos ao alterar qualquer filtro
  useEffect(() => {
    fetchFilteredProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, selectedMovesStock, showInactive])

  // Salvar produto (criar ou atualizar)
  const handleSaveProduct = async (data: CreateProductData) => {
    try {
      if (editingProduct) {
        // Atualizar produto existente
        const result = await updateProduct(editingProduct.id, data)
        if (result.success) {
          // Buscar o produto atualizado do backend (com join da categoria)
          const refreshed = await getProductById(editingProduct.id)
          if (refreshed.success && refreshed.data) {
            setProducts(prev =>
              prev.map(p =>
                p.id === editingProduct.id && refreshed.data
                  ? refreshed.data // produto atualizado com categoria
                  : p
              ) as Product[]
            )
          }
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

  // Atualizar busca ao limpar filtros
  const handleClearFilters = () => {
    setSelectedCategories([])
    setSelectedMovesStock([])
    setShowInactive(false)
    // fetchFilteredProducts() será chamado automaticamente pelo useEffect
  }

  return (
    <>
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
        <div className="flex flex-wrap items-center gap-4">
          {/* Filtro de Categorias */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {selectedCategories.length > 0
                  ? `${selectedCategories.length} categoria(s) selecionada(s)`
                  : 'Filtrar por Categoria'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {categories.map((cat) => (
                <DropdownMenuCheckboxItem
                  key={cat.id}
                  checked={selectedCategories.includes(cat.id)}
                  onCheckedChange={(checked) => {
                    setSelectedCategories((prev) =>
                      checked
                        ? [...prev, cat.id]
                        : prev.filter((id) => id !== cat.id)
                    )
                  }}
                >
                  {cat.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro de Controle de Estoque */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {selectedMovesStock.length === 0
                  ? 'Filtrar por Estoque'
                  : selectedMovesStock.length === 2
                  ? 'Todos Estoques'
                  : selectedMovesStock[0] ? 'Controla Estoque' : 'Não Controla Estoque'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuCheckboxItem
                checked={selectedMovesStock.includes(true)}
                onCheckedChange={(checked) => {
                  setSelectedMovesStock((prev) =>
                    checked
                      ? [...prev, true]
                      : prev.filter((v) => v !== true)
                  )
                }}
              >
                Controla Estoque
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedMovesStock.includes(false)}
                onCheckedChange={(checked) => {
                  setSelectedMovesStock((prev) =>
                    checked
                      ? [...prev, false]
                      : prev.filter((v) => v !== false)
                  )
                }}
              >
                Não Controla Estoque
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Switch Mostrar Inativos */}
          <div className="flex items-center gap-2">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <label htmlFor="show-inactive" className="text-sm cursor-pointer select-none">
              Mostrar Inativos
            </label>
          </div>

          {/* Botão Limpar Filtros */}
          <Button variant="ghost" onClick={handleClearFilters}>
            Limpar Filtros
          </Button>
        </div>
        <ProductTable
          products={products}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      </div>

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