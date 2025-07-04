'use server'

import { revalidatePath } from 'next/cache'
import { paymentMethodService } from '@/lib/services'
import { CreatePaymentMethodData, PaymentMethod } from '@/lib/types/business'

// Buscar todas as formas de pagamento
export async function getPaymentMethods(): Promise<{ success: boolean; data?: PaymentMethod[]; error?: string }> {
  try {
    const result = await paymentMethodService.findAll()
    
    if (result.error) {
      return { success: false, error: result.error }
    }

    return { success: true, data: result.data }
  } catch (error) {
    console.error('Erro inesperado ao buscar formas de pagamento:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Criar forma de pagamento
export async function createPaymentMethod(data: CreatePaymentMethodData): Promise<{ success: boolean; data?: PaymentMethod; error?: string }> {
  try {
    const result = await paymentMethodService.create(data)
    
    if (result.error) {
      return { success: false, error: result.error }
    }

    revalidatePath('/payment-methods')
    return { success: true, data: result.data || undefined }
  } catch (error) {
    console.error('Erro inesperado ao criar forma de pagamento:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Atualizar forma de pagamento
export async function updatePaymentMethod(id: string, data: CreatePaymentMethodData): Promise<{ success: boolean; data?: PaymentMethod; error?: string }> {
  try {
    const result = await paymentMethodService.update(id, data)
    
    if (result.error) {
      return { success: false, error: result.error }
    }

    revalidatePath('/payment-methods')
    return { success: true, data: result.data || undefined }
  } catch (error) {
    console.error('Erro inesperado ao atualizar forma de pagamento:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Excluir forma de pagamento
export async function deletePaymentMethod(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await paymentMethodService.delete(id)
    
    if (result.error) {
      return { success: false, error: result.error }
    }

    revalidatePath('/payment-methods')
    return { success: true }
  } catch (error) {
    console.error('Erro inesperado ao excluir forma de pagamento:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// Ativar/desativar forma de pagamento
export async function togglePaymentMethodActive(id: string, active: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await paymentMethodService.toggleActive(id, active)
    
    if (result.error) {
      return { success: false, error: result.error }
    }

    revalidatePath('/payment-methods')
    return { success: true }
  } catch (error) {
    console.error('Erro inesperado ao alterar status da forma de pagamento:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}