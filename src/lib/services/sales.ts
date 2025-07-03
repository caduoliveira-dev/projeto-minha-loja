import { BaseService } from './base'
import { 
  Sale, 
  CreateSaleData, 
  UpdateSaleData, 
  SaleFilters,
  SaleItem,
  CreateSaleItemData,
  PaginationParams,
  PaginatedResponse
} from '@/lib/types/business'

export class SaleService extends BaseService {
  async create(data: CreateSaleData): Promise<Sale> {
    const supabase = await this.getClient()
    
    // Inserir a venda
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        customer_id: data.customer_id,
        total_amount: data.total_amount,
        payment_type: data.payment_type,
        sale_date: data.sale_date || new Date().toISOString(),
        due_date: data.due_date,
        notes: data.notes
      })
      .select()
      .single()

    if (saleError) {
      return this.handleError(saleError)
    }

    // Inserir os itens da venda
    const saleItems = data.items.map(item => ({
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
      cost_price: 0 // Será atualizado pelo trigger
    }))

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems)

    if (itemsError) {
      // Se der erro nos itens, deletar a venda
      await supabase.from('sales').delete().eq('id', sale.id)
      return this.handleError(itemsError)
    }

    // Buscar a venda completa com itens
    return this.findById(sale.id) as Promise<Sale>
  }

  async update(id: string, data: UpdateSaleData): Promise<Sale> {
    const supabase = await this.getClient()
    
    const { data: sale, error } = await supabase
      .from('sales')
      .update({ 
        ...data, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return this.handleError(error)
    }

    return sale
  }

  async delete(id: string): Promise<void> {
    const supabase = await this.getClient()
    
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id)

    if (error) {
      return this.handleError(error)
    }
  }

  async findById(id: string): Promise<Sale | null> {
    const supabase = await this.getClient()
    
    const { data: sale, error } = await supabase
      .from('sales')
      .select(`
        *,
        customer:customers(*),
        items:sale_items(
          *,
          product:products(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Venda não encontrada
      }
      return this.handleError(error)
    }

    return sale
  }

  async findAll(
    filters: SaleFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<Sale>> {
    const supabase = await this.getClient()
    
    let query = supabase
      .from('sales')
      .select(`
        *,
        customer:customers(*)
      `)
      .order('sale_date', { ascending: false })

    // Aplicar filtros
    if (filters.start_date) {
      query = query.gte('sale_date', filters.start_date)
    }

    if (filters.end_date) {
      query = query.lte('sale_date', filters.end_date)
    }

    if (filters.payment_type) {
      query = query.eq('payment_type', filters.payment_type)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.customer_id) {
      query = query.eq('customer_id', filters.customer_id)
    }

    return this.paginate(query, pagination)
  }

  async getSalesStats(startDate?: string, endDate?: string): Promise<any> {
    const supabase = await this.getClient()
    
    let query = supabase
      .from('sales')
      .select('total_amount, profit_estimate, sale_date')

    if (startDate) {
      query = query.gte('sale_date', startDate)
    }

    if (endDate) {
      query = query.lte('sale_date', endDate)
    }

    const { data, error } = await query

    if (error) {
      return this.handleError(error)
    }

    const stats = data?.reduce((acc, sale) => {
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

    return stats
  }

  async getSalesByPeriod(period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<any[]> {
    const supabase = await this.getClient()
    
    let dateFormat: string
    let groupBy: string

    switch (period) {
      case 'daily':
        dateFormat = 'YYYY-MM-DD'
        groupBy = 'date_trunc(\'day\', sale_date)'
        break
      case 'weekly':
        dateFormat = 'YYYY-"W"WW'
        groupBy = 'date_trunc(\'week\', sale_date)'
        break
      case 'monthly':
        dateFormat = 'YYYY-MM'
        groupBy = 'date_trunc(\'month\', sale_date)'
        break
    }

    const { data, error } = await supabase
      .rpc('get_sales_by_period', {
        period_type: period,
        date_format: dateFormat,
        group_by: groupBy
      })

    if (error) {
      return this.handleError(error)
    }

    return data || []
  }

  async getSalesChartData(months: number = 12): Promise<any[]> {
    const supabase = await this.getClient()
    
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    
    const { data, error } = await supabase
      .from('sales')
      .select('total_amount, profit_estimate, sale_date')
      .gte('sale_date', startDate.toISOString())
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
    }, {} as Record<string, any>) || {}

    return Object.values(grouped)
  }

  async addSaleItem(saleId: string, item: CreateSaleItemData): Promise<SaleItem> {
    const supabase = await this.getClient()
    
    // Buscar o produto para obter o preço de custo
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('cost_price')
      .eq('id', item.product_id)
      .single()

    if (productError) {
      return this.handleError(productError)
    }

    const { data: saleItem, error } = await supabase
      .from('sale_items')
      .insert({
        sale_id: saleId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        cost_price: product.cost_price
      })
      .select()
      .single()

    if (error) {
      return this.handleError(error)
    }

    return saleItem
  }

  async removeSaleItem(itemId: string): Promise<void> {
    const supabase = await this.getClient()
    
    const { error } = await supabase
      .from('sale_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      return this.handleError(error)
    }
  }
} 