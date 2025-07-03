import { createClient } from '@/utils/supabase/server'
import { PaginationParams, PaginatedResponse } from '@/lib/types/business'

export class BaseService {
  protected async getClient() {
    return await createClient()
  }

  protected async handleError(error: any): Promise<never> {
    console.error('Database error:', error)
    throw new Error(error.message || 'Erro interno do servidor')
  }

  protected async paginate<T>(
    query: any,
    { page, limit }: PaginationParams
  ): Promise<PaginatedResponse<T>> {
    const from = (page - 1) * limit
    const to = from + limit - 1

    // 1. Fazer o count antes de qualquer select de join
    const countResult = await query.select('*', { count: 'exact', head: true })
    if (countResult.error) throw new Error(countResult.error.message)
    const total = countResult.count || 0
    const totalPages = Math.ceil(total / limit)

    // 2. Buscar os dados paginados (sem join)
    const dataResult = await query.range(from, to)
    if (dataResult.error) throw new Error(dataResult.error.message)

    return {
      data: dataResult.data || [],
      total,
      page,
      limit,
      totalPages
    }
  }

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  protected formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
  }

  protected formatDateTime(date: string | Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }
} 