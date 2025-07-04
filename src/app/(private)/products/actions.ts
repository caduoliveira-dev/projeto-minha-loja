'use server'

import { revalidatePath } from 'next/cache'
import { productService, categoryService } from '@/lib/services'
import { CreateProductData, ProductFilters } from '@/lib/types/business'

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

export async function getActiveCategories() {
  try {
    const categories = await categoryService.findActive()
    return { success: true, data: categories }
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
    return { success: false, error: 'Erro ao carregar categorias', data: [] }
  }
}

export async function getProductById(id: string) {
  try {
    const product = await productService.findByIdWithCategory(id)
    return { success: true, data: product }
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return { success: false, error: 'Erro ao buscar produto', data: null }
  }
}

export async function getFilteredProducts(filters: ProductFilters) {
  try {
    const response = await productService.findAll(filters)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Erro ao filtrar produtos:', error)
    return { success: false, error: 'Erro ao filtrar produtos', data: [] }
  }
} 