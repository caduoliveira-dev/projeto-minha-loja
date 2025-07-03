import { z } from 'zod'

// =====================================================
// VALIDAÇÕES DO SISTEMA DE GESTÃO EMPRESARIAL
// =====================================================

// 1. PRODUTOS
export const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  cost_price: z.number().min(0, 'Preço de custo deve ser maior ou igual a zero'),
  sale_price: z.number().min(0, 'Preço de venda deve ser maior ou igual a zero'),
  stock_quantity: z.number().int().min(0, 'Quantidade deve ser maior ou igual a zero'),
  moves_stock: z.boolean().default(true)
})

export const updateProductSchema = productSchema.partial().extend({
  id: z.string().uuid('ID inválido')
})

export type ProductFormData = z.infer<typeof productSchema>
export type UpdateProductFormData = z.infer<typeof updateProductSchema>

// 2. CLIENTES
export const customerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().max(20, 'Telefone muito longo').optional().or(z.literal('')),
  address: z.string().max(200, 'Endereço muito longo').optional().or(z.literal(''))
})

export const updateCustomerSchema = customerSchema.partial().extend({
  id: z.string().uuid('ID inválido')
})

export type CustomerFormData = z.infer<typeof customerSchema>
export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>

// 3. VENDAS
export const saleItemSchema = z.object({
  product_id: z.string().uuid('Produto inválido'),
  quantity: z.number().int().min(1, 'Quantidade deve ser pelo menos 1'),
  unit_price: z.number().min(0, 'Preço unitário deve ser maior ou igual a zero')
})

export const saleSchema = z.object({
  customer_id: z.string().uuid('Cliente inválido').optional(),
  total_amount: z.number().min(0, 'Valor total deve ser maior ou igual a zero'),
  payment_type: z.enum(['cash', 'credit'], {
    errorMap: () => ({ message: 'Tipo de pagamento inválido' })
  }),
  sale_date: z.string().datetime('Data de venda inválida').optional(),
  due_date: z.string().datetime('Data de vencimento inválida').optional(),
  notes: z.string().max(500, 'Observações muito longas').optional(),
  items: z.array(saleItemSchema).min(1, 'Pelo menos um item é obrigatório')
})

export const updateSaleSchema = saleSchema.partial().extend({
  id: z.string().uuid('ID inválido')
})

export type SaleFormData = z.infer<typeof saleSchema>
export type UpdateSaleFormData = z.infer<typeof updateSaleSchema>
export type SaleItemFormData = z.infer<typeof saleItemSchema>

// 4. CONTAS A PAGAR
const basePayableSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  due_date: z.string().min(1, 'Data de vencimento é obrigatória'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  is_recurring: z.boolean().default(false),
  recurring_interval: z.enum(['monthly', 'quarterly', 'yearly'], {
    errorMap: () => ({ message: 'Intervalo de recorrência inválido' })
  }).optional()
})

export const payableSchema = basePayableSchema.refine((data) => {
  // Se é recorrente, o intervalo é obrigatório
  if (data.is_recurring && !data.recurring_interval) {
    return false
  }
  return true
}, {
  message: 'Intervalo de recorrência é obrigatório para contas recorrentes',
  path: ['recurring_interval']
})

export const updatePayableSchema = basePayableSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
  status: z.enum(['pending', 'paid', 'overdue']).optional(),
  paid_at: z.string().datetime().optional()
})

export type PayableFormData = z.infer<typeof payableSchema>
export type UpdatePayableFormData = z.infer<typeof updatePayableSchema>

// 5. CONTAS A RECEBER
export const receivableSchema = z.object({
  customer_id: z.string().uuid('Cliente inválido').optional(),
  sale_id: z.string().uuid('Venda inválida').optional(),
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  due_date: z.string().min(1, 'Data de vencimento é obrigatória'),
  description: z.string().max(500, 'Descrição muito longa').optional()
})

export const updateReceivableSchema = receivableSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
  status: z.enum(['pending', 'paid', 'overdue']).optional(),
  paid_at: z.string().datetime().optional()
})

export type ReceivableFormData = z.infer<typeof receivableSchema>
export type UpdateReceivableFormData = z.infer<typeof updateReceivableSchema>

// =====================================================
// VALIDAÇÕES PARA FILTROS
// =====================================================

export const productFiltersSchema = z.object({
  search: z.string().optional(),
  moves_stock: z.boolean().optional(),
  low_stock: z.boolean().optional()
})

export const saleFiltersSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  payment_type: z.enum(['cash', 'credit']).optional(),
  status: z.enum(['completed', 'pending', 'cancelled']).optional(),
  customer_id: z.string().uuid().optional()
})

export const payableFiltersSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(['pending', 'paid', 'overdue']).optional(),
  is_recurring: z.boolean().optional()
})

export const receivableFiltersSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(['pending', 'paid', 'overdue']).optional(),
  customer_id: z.string().uuid().optional()
})

// =====================================================
// VALIDAÇÕES PARA PAGINAÇÃO
// =====================================================

export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Página deve ser maior que zero').default(1),
  limit: z.number().int().min(1, 'Limite deve ser maior que zero').max(100, 'Limite máximo é 100').default(20)
})

export type PaginationFormData = z.infer<typeof paginationSchema> 