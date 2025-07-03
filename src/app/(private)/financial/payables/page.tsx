import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Plus, ArrowLeft } from 'lucide-react'

export default function PayablesPage() {
  return (
    <div className="px-8">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contas a Pagar</h1>
              <p className="text-gray-600 mt-2">
                Gerencie suas despesas e contas a pagar
              </p>
            </div>
          </div>
          <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
          </Button>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Lista de Contas a Pagar
            </CardTitle>
            <CardDescription>
              Visualize e gerencie todas as contas a pagar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Módulo em desenvolvimento
              </h3>
              <p className="text-gray-600 mb-4">
                O controle de contas a pagar será implementado em breve
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 