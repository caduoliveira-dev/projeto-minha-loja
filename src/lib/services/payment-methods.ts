import { createClient } from '@/utils/supabase/server'
import { CreatePaymentMethodData, PaymentMethod } from '@/lib/types/business'

class PaymentMethodService {
  async findAll(): Promise<{ data: PaymentMethod[]; error?: string }> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('name')

      if (error) {
        console.error('Erro ao buscar formas de pagamento:', error)
        return { data: [], error: error.message }
      }

      return { data: data || [] }
    } catch (error) {
      console.error('Erro inesperado ao buscar formas de pagamento:', error)
      return { data: [], error: 'Erro interno do servidor' }
    }
  }

  async findById(id: string): Promise<{ data: PaymentMethod | null; error?: string }> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erro ao buscar forma de pagamento:', error)
        return { data: null, error: error.message }
      }

      return { data }
    } catch (error) {
      console.error('Erro inesperado ao buscar forma de pagamento:', error)
      return { data: null, error: 'Erro interno do servidor' }
    }
  }

  async create(data: CreatePaymentMethodData): Promise<{ data: PaymentMethod | null; error?: string }> {
    try {
      const supabase = await createClient()
      
      const { data: newPaymentMethod, error } = await supabase
        .from('payment_methods')
        .insert({
          name: data.name,
          type: data.type,
          payment_type: data.payment_type,
          active: true
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar forma de pagamento:', error)
        return { data: null, error: error.message }
      }

      return { data: newPaymentMethod }
    } catch (error) {
      console.error('Erro inesperado ao criar forma de pagamento:', error)
      return { data: null, error: 'Erro interno do servidor' }
    }
  }

  async update(id: string, data: CreatePaymentMethodData): Promise<{ data: PaymentMethod | null; error?: string }> {
    try {
      const supabase = await createClient()
      
      const { data: updatedPaymentMethod, error } = await supabase
        .from('payment_methods')
        .update({
          name: data.name,
          type: data.type,
          payment_type: data.payment_type
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar forma de pagamento:', error)
        return { data: null, error: error.message }
      }

      return { data: updatedPaymentMethod }
    } catch (error) {
      console.error('Erro inesperado ao atualizar forma de pagamento:', error)
      return { data: null, error: 'Erro interno do servidor' }
    }
  }

  async delete(id: string): Promise<{ error?: string }> {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao excluir forma de pagamento:', error)
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('Erro inesperado ao excluir forma de pagamento:', error)
      return { error: 'Erro interno do servidor' }
    }
  }

  async toggleActive(id: string, active: boolean): Promise<{ data: PaymentMethod | null; error?: string }> {
    try {
      const supabase = await createClient()
      
      const { data: updatedPaymentMethod, error } = await supabase
        .from('payment_methods')
        .update({ active })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao alterar status da forma de pagamento:', error)
        return { data: null, error: error.message }
      }

      return { data: updatedPaymentMethod }
    } catch (error) {
      console.error('Erro inesperado ao alterar status da forma de pagamento:', error)
      return { data: null, error: 'Erro interno do servidor' }
    }
  }

  async findActive(): Promise<{ data: PaymentMethod[]; error?: string }> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('active', true)
        .order('name')

      if (error) {
        console.error('Erro ao buscar formas de pagamento ativas:', error)
        return { data: [], error: error.message }
      }

      return { data: data || [] }
    } catch (error) {
      console.error('Erro inesperado ao buscar formas de pagamento ativas:', error)
      return { data: [], error: 'Erro interno do servidor' }
    }
  }
}

export const paymentMethodService = new PaymentMethodService() 