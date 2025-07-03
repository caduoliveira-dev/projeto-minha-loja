import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'

export default function CustomersPage() {
  return (
    <div className="px-8">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600 mt-2">
              Gerencie sua base de clientes
            </p>
          </div>
          <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
          </Button>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Clientes
            </CardTitle>
            <CardDescription>
              Visualize e gerencie todos os clientes cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum cliente cadastrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece cadastrando seu primeiro cliente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 