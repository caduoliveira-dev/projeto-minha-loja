import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, Package, CreditCard } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="px-8">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600 mt-2">
              Visualize relatórios e análises do seu negócio
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Relatório de Vendas
              </CardTitle>
              <CardDescription>
                Análise de vendas e performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Em desenvolvimento
                </h3>
                <p className="text-gray-600 mb-4">
                  Relatórios de vendas serão implementados em breve
                </p>
                <Button variant="outline" asChild>
                  <a href="/reports/sales">
                    Ver Relatório
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Relatório de Produtos
              </CardTitle>
              <CardDescription>
                Análise de produtos e estoque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Em desenvolvimento
                </h3>
                <p className="text-gray-600 mb-4">
                  Relatórios de produtos serão implementados em breve
                </p>
                <Button variant="outline" asChild>
                  <a href="/reports/products">
                    Ver Relatório
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Relatório Financeiro
              </CardTitle>
              <CardDescription>
                Análise financeira e fluxo de caixa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Em desenvolvimento
                </h3>
                <p className="text-gray-600 mb-4">
                  Relatórios financeiros serão implementados em breve
                </p>
                <Button variant="outline" asChild>
                  <a href="/reports/financial">
                    Ver Relatório
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 