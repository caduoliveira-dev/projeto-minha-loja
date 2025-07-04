'use server'

import { createClient } from '@/utils/supabase/server'

// Tipos temporários - serão movidos para lib/types/business.ts
interface SaleItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Sale {
  id: string
  customer_id: string
  customer_name: string
  total_amount: number
  subtotal?: number
  discount?: number
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  created_at: string
  updated_at: string
  items?: SaleItem[]
}

interface CreateSaleData {
  customer_id: string
  items: Array<{
    product_id: string
    product_name: string
    quantity: number
    unit_price: number
  }>
}

// Buscar todas as vendas
export async function getSales(): Promise<{ success: boolean; data?: Sale[]; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Por enquanto, retornamos dados simulados para testar a interface
    const mockSales: Sale[] = [
      {
        id: "1",
        customer_id: "1",
        customer_name: "João Silva",
        total_amount: 150.00,
        subtotal: 160.00,
        discount: 10.00,
        status: "completed",
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        items: [
          {
            id: "1",
            product_id: "1",
            product_name: "Camiseta Básica",
            quantity: 2,
            unit_price: 45.00,
            total_price: 90.00
          },
          {
            id: "2",
            product_id: "2",
            product_name: "Calça Jeans",
            quantity: 1,
            unit_price: 70.00,
            total_price: 70.00
          }
        ]
      },
      {
        id: "2",
        customer_id: "2",
        customer_name: "Maria Santos",
        total_amount: 89.50,
        subtotal: 89.50,
        status: "pending",
        created_at: "2024-01-14T14:20:00Z",
        updated_at: "2024-01-14T14:20:00Z",
        items: [
          {
            id: "3",
            product_id: "3",
            product_name: "Tênis Esportivo",
            quantity: 1,
            unit_price: 89.50,
            total_price: 89.50
          }
        ]
      },
      {
        id: "3",
        customer_id: "3",
        customer_name: "Pedro Oliveira",
        total_amount: 250.00,
        subtotal: 250.00,
        status: "completed",
        created_at: "2024-01-13T09:15:00Z",
        updated_at: "2024-01-13T09:15:00Z",
        items: [
          {
            id: "4",
            product_id: "4",
            product_name: "Mochila Executiva",
            quantity: 1,
            unit_price: 120.00,
            total_price: 120.00
          },
          {
            id: "5",
            product_id: "5",
            product_name: "Relógio Digital",
            quantity: 1,
            unit_price: 130.00,
            total_price: 130.00
          }
        ]
      },
      {
        id: "4",
        customer_id: "4",
        customer_name: "Ana Costa",
        total_amount: 75.25,
        subtotal: 75.25,
        status: "cancelled",
        created_at: "2024-01-12T16:45:00Z",
        updated_at: "2024-01-12T16:45:00Z",
        items: [
          {
            id: "6",
            product_id: "6",
            product_name: "Perfume Feminino",
            quantity: 1,
            unit_price: 75.25,
            total_price: 75.25
          }
        ]
      },
      {
        id: "5",
        customer_id: "5",
        customer_name: "Carlos Ferreira",
        total_amount: 120.00,
        subtotal: 120.00,
        status: "refunded",
        created_at: "2024-01-11T11:30:00Z",
        updated_at: "2024-01-11T11:30:00Z",
        items: [
          {
            id: "7",
            product_id: "7",
            product_name: "Fone de Ouvido",
            quantity: 1,
            unit_price: 120.00,
            total_price: 120.00
          }
        ]
      }
    ]

    return { success: true, data: mockSales }
  } catch (error) {
    console.error('Erro inesperado ao buscar vendas:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Buscar venda por ID
export async function getSaleById(id: string): Promise<{ success: boolean; data?: Sale; error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: sale, error } = await supabase
      .from('sales')
      .select(`
        *,
        customers!inner(name)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar venda:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: sale }
  } catch (error) {
    console.error('Erro inesperado ao buscar venda:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Criar nova venda
export async function createSale(data: CreateSaleData): Promise<{ success: boolean; data?: Sale; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Por enquanto, simulamos a criação de uma venda
    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    const newSale: Sale = {
      id: Date.now().toString(),
      customer_id: data.customer_id,
      customer_name: "Cliente", // Será buscado do banco
      total_amount: totalAmount,
      subtotal: totalAmount,
      discount: 0,
      status: "completed",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: data.items.map((item, index) => ({
        id: (index + 1).toString(),
        product_id: item.product_id,
        product_name: item.product_name || "Produto",
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      }))
    }

    return { success: true, data: newSale }
  } catch (error) {
    console.error('Erro inesperado ao criar venda:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Atualizar venda
export async function updateSale(id: string, data: Partial<CreateSaleData>): Promise<{ success: boolean; data?: Sale; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Por enquanto, retornamos um erro indicando que a funcionalidade está em desenvolvimento
    return { success: false, error: 'Funcionalidade em desenvolvimento' }
  } catch (error) {
    console.error('Erro inesperado ao atualizar venda:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Estornar venda
export async function refundSale(id: string, reason: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Por enquanto, simulamos o estorno
    console.log('Estornando venda:', id, 'Motivo:', reason)
    
    return { success: true }
  } catch (error) {
    console.error('Erro inesperado ao estornar venda:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Excluir venda
export async function deleteSale(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Por enquanto, retornamos um erro indicando que a funcionalidade está em desenvolvimento
    return { success: false, error: 'Funcionalidade em desenvolvimento' }
  } catch (error) {
    console.error('Erro inesperado ao excluir venda:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Buscar clientes
export async function getCustomers(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Por enquanto, retornamos dados simulados
    const mockCustomers = [
      { id: "1", name: "João Silva", email: "joao@email.com" },
      { id: "2", name: "Maria Santos", email: "maria@email.com" },
      { id: "3", name: "Pedro Oliveira", email: "pedro@email.com" },
      { id: "4", name: "Ana Costa", email: "ana@email.com" },
      { id: "5", name: "Carlos Ferreira", email: "carlos@email.com" }
    ]

    return { success: true, data: mockCustomers }
  } catch (error) {
    console.error('Erro inesperado ao buscar clientes:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Buscar produtos ativos
export async function getActiveProducts(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Por enquanto, retornamos dados simulados
    const mockProducts = [
      { 
        id: "1", 
        name: "Camiseta Básica", 
        sale_price: 45.00, 
        stock_quantity: 50, 
        moves_stock: true 
      },
      { 
        id: "2", 
        name: "Calça Jeans", 
        sale_price: 70.00, 
        stock_quantity: 30, 
        moves_stock: true 
      },
      { 
        id: "3", 
        name: "Tênis Esportivo", 
        sale_price: 89.50, 
        stock_quantity: 25, 
        moves_stock: true 
      },
      { 
        id: "4", 
        name: "Mochila Executiva", 
        sale_price: 120.00, 
        stock_quantity: 15, 
        moves_stock: true 
      },
      { 
        id: "5", 
        name: "Relógio Digital", 
        sale_price: 130.00, 
        stock_quantity: 10, 
        moves_stock: true 
      },
      { 
        id: "6", 
        name: "Perfume Feminino", 
        sale_price: 75.25, 
        stock_quantity: 20, 
        moves_stock: true 
      },
      { 
        id: "7", 
        name: "Fone de Ouvido", 
        sale_price: 120.00, 
        stock_quantity: 0, 
        moves_stock: true 
      },
      { 
        id: "8", 
        name: "Serviço de Consultoria", 
        sale_price: 200.00, 
        stock_quantity: 0, 
        moves_stock: false 
      }
    ]

    return { success: true, data: mockProducts }
  } catch (error) {
    console.error('Erro inesperado ao buscar produtos:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Buscar formas de pagamento
export async function getPaymentMethods(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Por enquanto, retornamos dados simulados
    const mockPaymentMethods = [
      { 
        id: "1", 
        name: "Dinheiro", 
        type: "cash", 
        payment_type: "immediate", 
        active: true 
      },
      { 
        id: "2", 
        name: "Cartão de Crédito", 
        type: "credit", 
        payment_type: "installment", 
        active: true 
      },
      { 
        id: "3", 
        name: "Cartão de Débito", 
        type: "debit", 
        payment_type: "immediate", 
        active: true 
      },
      { 
        id: "4", 
        name: "PIX", 
        type: "pix", 
        payment_type: "immediate", 
        active: true 
      },
      { 
        id: "5", 
        name: "Transferência", 
        type: "transfer", 
        payment_type: "immediate", 
        active: true 
      },
      { 
        id: "6", 
        name: "Cheque", 
        type: "check", 
        payment_type: "installment", 
        active: false 
      }
    ]

    return { success: true, data: mockPaymentMethods }
  } catch (error) {
    console.error('Erro inesperado ao buscar formas de pagamento:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
} 