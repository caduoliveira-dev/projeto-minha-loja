import { BaseService } from './base'
import { 
  DashboardStats, 
  SalesChartData, 
  TopProduct, 
  FinancialSummary 
} from '@/lib/types/business'

export class DashboardService extends BaseService {
  async getDashboardStats(): Promise<DashboardStats> {
    const supabase = await this.getClient()
    
    // Buscar estatísticas de vendas
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('total_amount, profit_estimate')
      .eq('status', 'completed')

    if (salesError) {
      return this.handleError(salesError)
    }

    const salesStats = salesData?.reduce((acc, sale) => {
      acc.totalSales += sale.total_amount
      acc.totalProfit += sale.profit_estimate
      acc.count += 1
      return acc
    }, {
      totalSales: 0,
      totalProfit: 0,
      count: 0
    }) || {
      totalSales: 0,
      totalProfit: 0,
      count: 0
    }

    // Buscar produtos com estoque baixo
    const { data: lowStockData, error: lowStockError } = await supabase
      .from('products')
      .select('id')
      .eq('moves_stock', true)
      .lt('stock_quantity', 10)

    if (lowStockError) {
      return this.handleError(lowStockError)
    }

    // Buscar contas vencidas
    const { data: overduePayables, error: payablesError } = await supabase
      .from('payables')
      .select('amount')
      .eq('status', 'overdue')

    if (payablesError) {
      return this.handleError(payablesError)
    }

    const { data: overdueReceivables, error: receivablesError } = await supabase
      .from('receivables')
      .select('amount')
      .eq('status', 'overdue')

    if (receivablesError) {
      return this.handleError(receivablesError)
    }

    // Calcular saldo atual (receitas - despesas)
    const { data: allReceivables, error: allReceivablesError } = await supabase
      .from('receivables')
      .select('amount')
      .eq('status', 'pending')

    if (allReceivablesError) {
      return this.handleError(allReceivablesError)
    }

    const { data: allPayables, error: allPayablesError } = await supabase
      .from('payables')
      .select('amount')
      .eq('status', 'pending')

    if (allPayablesError) {
      return this.handleError(allPayablesError)
    }

    const totalReceivables = allReceivables?.reduce((sum, item) => sum + item.amount, 0) || 0
    const totalPayables = allPayables?.reduce((sum, item) => sum + item.amount, 0) || 0
    const currentBalance = totalReceivables - totalPayables

    return {
      totalSales: salesStats.totalSales,
      totalProfit: salesStats.totalProfit,
      totalSalesCount: salesStats.count,
      currentBalance,
      overduePayables: overduePayables?.length || 0,
      overdueReceivables: overdueReceivables?.length || 0,
      lowStockProducts: lowStockData?.length || 0
    }
  }

  async getSalesChartData(months: number = 12): Promise<SalesChartData[]> {
    const supabase = await this.getClient()
    
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    
    const { data, error } = await supabase
      .from('sales')
      .select('total_amount, profit_estimate, sale_date')
      .gte('sale_date', startDate.toISOString())
      .eq('status', 'completed')
      .order('sale_date', { ascending: true })

    if (error) {
      return this.handleError(error)
    }

    // Agrupar por mês
    const grouped = data?.reduce((acc, sale) => {
      const date = new Date(sale.sale_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          period: monthKey,
          sales: 0,
          profit: 0,
          count: 0
        }
      }
      
      acc[monthKey].sales += sale.total_amount
      acc[monthKey].profit += sale.profit_estimate
      acc[monthKey].count += 1
      
      return acc
    }, {} as Record<string, SalesChartData>) || {}

    return Object.values(grouped)
  }

  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    const supabase = await this.getClient()
    
    const { data, error } = await supabase
      .from('sale_items')
      .select(`
        product_id,
        products!inner(name),
        quantity,
        total_price
      `)
      .order('quantity', { ascending: false })
      .limit(limit * 2) // Buscar mais para agrupar depois

    if (error) {
      return this.handleError(error)
    }

    // Agrupar por produto
    const grouped = data?.reduce((acc, item: any) => {
      const existing = acc.find((p: any) => p.product_id === item.product_id)
      if (existing) {
        existing.total_quantity += item.quantity
        existing.total_revenue += item.total_price
      } else {
        acc.push({
          product_id: item.product_id,
          product_name: (item.products as any).name,
          total_quantity: item.quantity,
          total_revenue: item.total_price
        })
      }
      return acc
    }, [] as TopProduct[]) || []

    return grouped
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, limit)
  }

  async getFinancialSummary(): Promise<FinancialSummary> {
    const supabase = await this.getClient()
    
    // Buscar todas as contas a pagar pendentes
    const { data: payables, error: payablesError } = await supabase
      .from('payables')
      .select('amount, status')
      .in('status', ['pending', 'overdue'])

    if (payablesError) {
      return this.handleError(payablesError)
    }

    // Buscar todas as contas a receber pendentes
    const { data: receivables, error: receivablesError } = await supabase
      .from('receivables')
      .select('amount, status')
      .in('status', ['pending', 'overdue'])

    if (receivablesError) {
      return this.handleError(receivablesError)
    }

    const totalPayables = payables?.reduce((sum, item) => sum + item.amount, 0) || 0
    const totalReceivables = receivables?.reduce((sum, item) => sum + item.amount, 0) || 0
    const netBalance = totalReceivables - totalPayables

    const overdueAmount = [
      ...(payables?.filter(item => item.status === 'overdue') || []),
      ...(receivables?.filter(item => item.status === 'overdue') || [])
    ].reduce((sum, item) => sum + item.amount, 0)

    return {
      totalPayables,
      totalReceivables,
      netBalance,
      overdueAmount
    }
  }

  async getUpcomingDueDates(days: number = 30): Promise<any[]> {
    const supabase = await this.getClient()
    
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)
    
    // Buscar contas a pagar próximas do vencimento
    const { data: payables, error: payablesError } = await supabase
      .from('payables')
      .select('name, amount, due_date, status')
      .eq('status', 'pending')
      .lte('due_date', endDate.toISOString().split('T')[0])
      .order('due_date', { ascending: true })

    if (payablesError) {
      return this.handleError(payablesError)
    }

    // Buscar contas a receber próximas do vencimento
    const { data: receivables, error: receivablesError } = await supabase
      .from('receivables')
      .select(`
        name, 
        amount, 
        due_date, 
        status,
        customers(name)
      `)
      .eq('status', 'pending')
      .lte('due_date', endDate.toISOString().split('T')[0])
      .order('due_date', { ascending: true })

    if (receivablesError) {
      return this.handleError(receivablesError)
    }

    const upcoming = [
      ...(payables?.map(item => ({
        ...item,
        type: 'payable',
        customer_name: null
      })) || []),
      ...(receivables?.map(item => ({
        ...item,
        type: 'receivable',
        customer_name: (item.customers as any)?.name
      })) || [])
    ]

    return upcoming.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
  }

  async getLowStockAlerts(): Promise<any[]> {
    const supabase = await this.getClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('id, name, stock_quantity, cost_price')
      .eq('moves_stock', true)
      .lt('stock_quantity', 10)
      .order('stock_quantity', { ascending: true })

    if (error) {
      return this.handleError(error)
    }

    return data?.map(product => ({
      ...product,
      stock_value: product.stock_quantity * product.cost_price
    })) || []
  }

  async getRecentActivity(limit: number = 10): Promise<any[]> {
    const supabase = await this.getClient()
    
    // Buscar vendas recentes
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select(`
        id,
        total_amount,
        sale_date,
        payment_type,
        customers(name)
      `)
      .order('sale_date', { ascending: false })
      .limit(limit)

    if (salesError) {
      return this.handleError(salesError)
    }

    return sales?.map(sale => ({
      id: sale.id,
      type: 'sale',
      amount: sale.total_amount,
      date: sale.sale_date,
      description: `Venda ${sale.payment_type === 'cash' ? 'à vista' : 'a prazo'} - ${(sale.customers as any)?.name || 'Cliente não identificado'}`
    })) || []
  }
} 