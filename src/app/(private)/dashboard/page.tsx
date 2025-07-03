import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  AlertTriangle,
  Calendar,
  BarChart3,
  ShoppingCart,
  Users,
  FileText,
  CreditCard
} from 'lucide-react'
import { DashboardService } from '@/lib/services/dashboard'
import { formatDate } from '@/utils/globals/date'
import { formatCurrency } from '@/utils/globals/money'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  const dashboardService = new DashboardService()
  const stats = await dashboardService.getDashboardStats()
  const financialSummary = await dashboardService.getFinancialSummary()
  const lowStockAlerts = await dashboardService.getLowStockAlerts()
  const upcomingDueDates = await dashboardService.getUpcomingDueDates(7)

  return (
    <div className="px-8">
      <div className="">
        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalSalesCount} vendas realizadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Bruto</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalProfit)}</div>
              <p className="text-xs text-muted-foreground">
                Margem estimada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.currentBalance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Receitas - Despesas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos em Baixa</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.lowStockProducts}</div>
              <p className="text-xs text-muted-foreground">
                Estoque abaixo de 10 unidades
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Contas a Pagar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(financialSummary.totalPayables)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {financialSummary.overdueAmount > 0 && (
                  <span className="text-red-500">
                    {formatCurrency(financialSummary.overdueAmount)} vencidos
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contas a Receber
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(financialSummary.totalReceivables)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Valores pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Saldo Líquido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${financialSummary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(financialSummary.netBalance)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Receber - Pagar
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alertas e Próximos Vencimentos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Produtos com Estoque Baixo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produtos com Estoque Baixo
              </CardTitle>
              <CardDescription>
                Produtos que precisam de reposição
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockAlerts.length > 0 ? (
                <div className="space-y-3">
                  {lowStockAlerts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.stock_quantity} unidades restantes
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(product.stock_value)}</p>
                        <p className="text-xs text-muted-foreground">Valor em estoque</p>
                      </div>
                    </div>
                  ))}
                  {lowStockAlerts.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{lowStockAlerts.length - 5} produtos com estoque baixo
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum produto com estoque baixo
                </p>
              )}
            </CardContent>
          </Card>

          {/* Próximos Vencimentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Vencimentos
              </CardTitle>
              <CardDescription>
                Contas que vencem nos próximos 7 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingDueDates.length > 0 ? (
                <div className="space-y-3">
                  {upcomingDueDates.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.type === 'payable' ? 'Conta a pagar' : 'Conta a receber'}
                          {item.customer_name && ` - ${item.customer_name}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(item.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          Vence em {formatDate(item.due_date)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {upcomingDueDates.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{upcomingDueDates.length - 5} contas próximas do vencimento
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma conta próxima do vencimento
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Menu de Navegação Rápida */}
        <Card>
          <CardHeader>
            <CardTitle>Navegação Rápida</CardTitle>
            <CardDescription>
              Acesse rapidamente as principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                <a href="/sales/new">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-sm">Nova Venda</span>
                </a>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                <a href="/products">
                  <Package className="h-6 w-6" />
                  <span className="text-sm">Produtos</span>
                </a>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                <a href="/customers">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Clientes</span>
                </a>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
                <a href="/reports">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Relatórios</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
