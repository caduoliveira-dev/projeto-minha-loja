import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Plus } from 'lucide-react'

export default function ProductsPage() {
  return (
    <div className="px-8">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-600 mt-2">
              Gerencie seu catálogo de produtos e controle de estoque
            </p>
          </div>
          <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
          </Button>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Lista de Produtos
            </CardTitle>
            <CardDescription>
              Visualize e gerencie todos os produtos cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum produto cadastrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece cadastrando seu primeiro produto para gerenciar o estoque
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 