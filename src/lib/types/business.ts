// =====================================================
// TIPOS DO SISTEMA DE GESTÃO EMPRESARIAL
// =====================================================

// 1. CATEGORIAS
export interface Category {
  id: string
  name: string
  description?: string
  color?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface CreateCategoryData {
  name: string
  description?: string
  color?: string
  active: boolean
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string
}

// 2. PRODUTOS
export interface Product {
  id: string
  name: string
  description?: string
  cost_price: number
  sale_price: number
  stock_quantity: number
  moves_stock: boolean
  active: boolean
  category_id?: string
  category?: Category
  created_at: string
  updated_at: string
}

export interface CreateProductData {
  name: string
  description?: string
  cost_price: number
  sale_price: number
  stock_quantity: number
  moves_stock: boolean
  category_id?: string
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string
}

// 2. CLIENTES
export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface CreateCustomerData {
  name: string
  email?: string
  phone?: string
  address?: string
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: string
}

// 3. VENDAS
export type PaymentType = 'cash' | 'credit'
export type SaleStatus = 'completed' | 'pending' | 'cancelled'

export interface Sale {
  id: string
  customer_id?: string
  customer?: Customer
  total_amount: number
  profit_estimate: number
  payment_type: PaymentType
  sale_date: string
  due_date?: string
  status: SaleStatus
  notes?: string
  created_at: string
  updated_at: string
  items?: SaleItem[]
}

export interface CreateSaleData {
  customer_id?: string
  total_amount: number
  payment_type: PaymentType
  sale_date?: string
  due_date?: string
  notes?: string
  items: CreateSaleItemData[]
}

export interface UpdateSaleData extends Partial<CreateSaleData> {
  id: string
}

// 4. ITENS DE VENDA
export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  product?: Product
  quantity: number
  unit_price: number
  total_price: number
  cost_price: number
  created_at: string
}

export interface CreateSaleItemData {
  product_id: string
  quantity: number
  unit_price: number
}

// 5. CONTAS A PAGAR
export type PayableStatus = 'pending' | 'paid' | 'overdue'
export type RecurringInterval = 'monthly' | 'quarterly' | 'yearly'

export interface Payable {
  id: string
  name: string
  amount: number
  due_date: string
  description?: string
  is_recurring: boolean
  recurring_interval?: RecurringInterval
  status: PayableStatus
  paid_at?: string
  created_at: string
  updated_at: string
}

export interface CreatePayableData {
  name: string
  amount: number
  due_date: string
  description?: string
  is_recurring: boolean
  recurring_interval?: RecurringInterval
}

export interface UpdatePayableData extends Partial<CreatePayableData> {
  id: string
  status?: PayableStatus
  paid_at?: string
}

// 6. CONTAS A RECEBER
export type ReceivableStatus = 'pending' | 'paid' | 'overdue'

export interface Receivable {
  id: string
  customer_id?: string
  customer?: Customer
  sale_id?: string
  sale?: Sale
  name: string
  amount: number
  due_date: string
  description?: string
  status: ReceivableStatus
  paid_at?: string
  created_at: string
  updated_at: string
}

export interface CreateReceivableData {
  customer_id?: string
  sale_id?: string
  name: string
  amount: number
  due_date: string
  description?: string
}

export interface UpdateReceivableData extends Partial<CreateReceivableData> {
  id: string
  status?: ReceivableStatus
  paid_at?: string
}

// =====================================================
// TIPOS PARA DASHBOARD E RELATÓRIOS
// =====================================================

export interface DashboardStats {
  totalSales: number
  totalProfit: number
  totalSalesCount: number
  currentBalance: number
  overduePayables: number
  overdueReceivables: number
  lowStockProducts: number
}

export interface SalesChartData {
  period: string
  sales: number
  profit: number
  count: number
}

export interface TopProduct {
  product_id: string
  product_name: string
  total_quantity: number
  total_revenue: number
}

export interface FinancialSummary {
  totalPayables: number
  totalReceivables: number
  netBalance: number
  overdueAmount: number
}

// =====================================================
// TIPOS PARA FILTROS E PESQUISAS
// =====================================================

export interface ProductFilters {
  search?: string
  moves_stock?: boolean
  low_stock?: boolean
}

export interface SaleFilters {
  start_date?: string
  end_date?: string
  payment_type?: PaymentType
  status?: SaleStatus
  customer_id?: string
}

export interface PayableFilters {
  start_date?: string
  end_date?: string
  status?: PayableStatus
  is_recurring?: boolean
}

export interface ReceivableFilters {
  start_date?: string
  end_date?: string
  status?: ReceivableStatus
  customer_id?: string
}

// =====================================================
// TIPOS PARA PAGINAÇÃO
// =====================================================

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
} 