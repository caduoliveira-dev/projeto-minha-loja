'use server'

import { revalidatePath } from 'next/cache'
import { productService } from '@/lib/services'
import { CreateProductData } from '@/lib/types/business'

export async function createProduct(data: CreateProductData) {
  try {
    await productService.create(data)
    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return { success: false, error: 'Erro ao criar produto' }
  }
}

export async function updateProduct(id: string, data: CreateProductData) {
  try {
    const updateData = { ...data, id }
    await productService.update(id, updateData)
    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return { success: false, error: 'Erro ao atualizar produto' }
  }
}

export async function deleteProduct(id: string) {
  try {
    await productService.delete(id)
    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    return { success: false, error: 'Erro ao excluir produto' }
  }
}

export async function getProducts() {
  try {
    const response = await productService.findAll()
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Erro ao carregar produtos:', error)
    return { success: false, error: 'Erro ao carregar produtos', data: [] }
  }
} 