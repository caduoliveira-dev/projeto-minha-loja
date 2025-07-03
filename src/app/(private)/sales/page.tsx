import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Plus } from 'lucide-react'

export default function SalesPage() {
  return (
    <div className="px-8">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
            <p className="text-gray-600 mt-2">
              Gerencie suas vendas e controle financeiro
            </p>
          </div>
          <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Venda
          </Button>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Lista de Vendas
            </CardTitle>
            <CardDescription>
              Visualize e gerencie todas as vendas realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma venda registrada
              </h3>
              <p className="text-gray-600 mb-4">
                Comece registrando sua primeira venda
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 