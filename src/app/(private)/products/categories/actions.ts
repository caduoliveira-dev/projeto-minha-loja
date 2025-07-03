'use server'

import { revalidatePath } from 'next/cache'
import { categoryService } from '@/lib/services'
import { CreateCategoryData } from '@/lib/types/business'

export async function createCategory(data: CreateCategoryData) {
  try {
    await categoryService.create(data)
    revalidatePath('/products/categories')
    return { success: true }
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return { success: false, error: 'Erro ao criar categoria' }
  }
}

export async function updateCategory(id: string, data: CreateCategoryData) {
  try {
    const updateData = { ...data, id }
    await categoryService.update(id, updateData)
    revalidatePath('/products/categories')
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
    return { success: false, error: 'Erro ao atualizar categoria' }
  }
}

export async function deleteCategory(id: string) {
  try {
    await categoryService.delete(id)
    revalidatePath('/products/categories')
    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    return { success: false, error: 'Erro ao excluir categoria' }
  }
}

export async function getCategories() {
  try {
    const response = await categoryService.findAll()
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
    return { success: false, error: 'Erro ao carregar categorias', data: [] }
  }
} 