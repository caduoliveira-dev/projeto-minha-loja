import { BaseService } from './base'
import { 
  Product, 
  CreateProductData, 
  UpdateProductData, 
  ProductFilters,
  PaginationParams,
  PaginatedResponse
} from '@/lib/types/business'

export class ProductService extends BaseService {
  async create(data: CreateProductData): Promise<Product> {
    const supabase = await this.getClient()
    
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        ...data,
        active: true // Produtos criados são ativos por padrão
      })
      .select()
      .single()

    if (error) {
      return this.handleError(error)
    }

    return product
  }

  async update(id: string, data: UpdateProductData): Promise<Product> {
    const supabase = await this.getClient()
    
    const { data: product, error } = await supabase
      .from('products')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return this.handleError(error)
    }

    return product
  }

  async delete(id: string): Promise<void> {
    const supabase = await this.getClient()
    
    // Exclusão lógica: setar active como false
    const { error } = await supabase
      .from('products')
      .update({ 
        active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      return this.handleError(error)
    }
  }

  async findById(id: string): Promise<Product | null> {
    const supabase = await this.getClient()
    
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Produto não encontrado
      }
      return this.handleError(error)
    }

    return product
  }

  async findAll(
    filters: ProductFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<Product>> {
    const supabase = await this.getClient()
    
    let query = supabase
      .from('products')
      .select('*')
      .eq('active', true) // Apenas produtos ativos
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    if (filters.moves_stock !== undefined) {
      query = query.eq('moves_stock', filters.moves_stock)
    }

    if (filters.low_stock) {
      query = query.lt('stock_quantity', 10) // Produtos com menos de 10 unidades
    }

    return this.paginate(query, pagination)
  }

  async findLowStock(limit: number = 10): Promise<Product[]> {
    const supabase = await this.getClient()
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('moves_stock', true)
      .lt('stock_quantity', 10)
      .order('stock_quantity', { ascending: true })
      .limit(limit)

    if (error) {
      return this.handleError(error)
    }

    return products || []
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const supabase = await this.getClient()
    
    const { data: product, error } = await supabase
      .from('products')
      .update({ 
        stock_quantity: quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return this.handleError(error)
    }

    return product
  }

  async getTopSelling(limit: number = 10): Promise<any[]> {
    const supabase = await this.getClient()
    
    const { data, error } = await supabase
      .from('sale_items')
      .select(`
        product_id,
        products!inner(name),
        total_quantity:quantity,
        total_revenue:total_price
      `)
      .order('total_quantity', { ascending: false })
      .limit(limit)

    if (error) {
      return this.handleError(error)
    }

    // Agrupar por produto
    const grouped = data?.reduce((acc, item: any) => {
      const existing = acc.find((p: any) => p.product_id === item.product_id)
      if (existing) {
        existing.total_quantity += item.total_quantity
        existing.total_revenue += item.total_revenue
      } else {
        acc.push({
          product_id: item.product_id,
          product_name: item.products.name,
          total_quantity: item.total_quantity,
          total_revenue: item.total_revenue
        })
      }
      return acc
    }, [] as any[]) || []

    return grouped.sort((a, b) => b.total_quantity - a.total_quantity)
  }

  async getStockValue(): Promise<number> {
    const supabase = await this.getClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('stock_quantity, cost_price')

    if (error) {
      return this.handleError(error)
    }

    return data?.reduce((total, product) => {
      return total + (product.stock_quantity * product.cost_price)
    }, 0) || 0
  }
} 