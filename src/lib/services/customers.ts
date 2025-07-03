import { BaseService } from './base'
import { 
  Customer, 
  CreateCustomerData, 
  UpdateCustomerData,
  PaginationParams,
  PaginatedResponse
} from '@/lib/types/business'

export class CustomerService extends BaseService {
  async create(data: CreateCustomerData): Promise<Customer> {
    const supabase = await this.getClient()
    
    const { data: customer, error } = await supabase
      .from('customers')
      .insert(data)
      .select()
      .single()

    if (error) {
      return this.handleError(error)
    }

    return customer
  }

  async update(id: string, data: UpdateCustomerData): Promise<Customer> {
    const supabase = await this.getClient()
    
    const { data: customer, error } = await supabase
      .from('customers')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return this.handleError(error)
    }

    return customer
  }

  async delete(id: string): Promise<void> {
    const supabase = await this.getClient()
    
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (error) {
      return this.handleError(error)
    }
  }

  async findById(id: string): Promise<Customer | null> {
    const supabase = await this.getClient()
    
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Cliente não encontrado
      }
      return this.handleError(error)
    }

    return customer
  }

  async findAll(
    search?: string,
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<Customer>> {
    const supabase = await this.getClient()
    
    let query = supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true })

    // Aplicar filtro de busca
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    return this.paginate(query, pagination)
  }

  async findByName(name: string): Promise<Customer[]> {
    const supabase = await this.getClient()
    
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .ilike('name', `%${name}%`)
      .order('name', { ascending: true })

    if (error) {
      return this.handleError(error)
    }

    return customers || []
  }

  async getTopCustomers(limit: number = 10): Promise<any[]> {
    const supabase = await this.getClient()
    
    const { data, error } = await supabase
      .from('sales')
      .select(`
        customer_id,
        customers!inner(name),
        total_amount,
        sale_date
      `)
      .not('customer_id', 'is', null)
      .order('total_amount', { ascending: false })
      .limit(limit)

    if (error) {
      return this.handleError(error)
    }

    // Agrupar por cliente
    const grouped = data?.reduce((acc, item: any) => {
      const existing = acc.find((c: any) => c.customer_id === item.customer_id)
      if (existing) {
        existing.total_amount += item.total_amount
        existing.sales_count += 1
      } else {
        acc.push({
          customer_id: item.customer_id,
          customer_name: item.customers.name,
          total_amount: item.total_amount,
          sales_count: 1
        })
      }
      return acc
    }, [] as any[]) || []

    return grouped.sort((a, b) => b.total_amount - a.total_amount)
  }

  async getCustomersWithReceivables(): Promise<any[]> {
    const supabase = await this.getClient()
    
    const { data, error } = await supabase
      .from('receivables')
      .select(`
        customer_id,
        customers!inner(name),
        amount,
        due_date,
        status
      `)
      .not('customer_id', 'is', null)
      .eq('status', 'pending')

    if (error) {
      return this.handleError(error)
    }

    // Agrupar por cliente
    const grouped = data?.reduce((acc, item: any) => {
      const existing = acc.find((c: any) => c.customer_id === item.customer_id)
      if (existing) {
        existing.total_amount += item.amount
        existing.receivables_count += 1
      } else {
        acc.push({
          customer_id: item.customer_id,
          customer_name: item.customers.name,
          total_amount: item.amount,
          receivables_count: 1
        })
      }
      return acc
    }, [] as any[]) || []

    return grouped.sort((a, b) => b.total_amount - a.total_amount)
  }
} 