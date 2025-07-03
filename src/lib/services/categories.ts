import { BaseService } from './base'
import { 
  Category, 
  CreateCategoryData, 
  UpdateCategoryData,
  PaginationParams,
  PaginatedResponse
} from '@/lib/types/business'

export class CategoryService extends BaseService {
  async create(data: CreateCategoryData): Promise<Category> {
    const supabase = await this.getClient()
    
    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        ...data,
        active: true // Categorias criadas são ativas por padrão
      })
      .select()
      .single()

    if (error) {
      return this.handleError(error)
    }

    return category
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    const supabase = await this.getClient()
    
    const { data: category, error } = await supabase
      .from('categories')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return this.handleError(error)
    }

    return category
  }

  async delete(id: string): Promise<void> {
    const supabase = await this.getClient()
    
    // Exclusão lógica: setar active como false
    const { error } = await supabase
      .from('categories')
      .update({ 
        active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      return this.handleError(error)
    }
  }

  async findById(id: string): Promise<Category | null> {
    const supabase = await this.getClient()
    
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Categoria não encontrada
      }
      return this.handleError(error)
    }

    return category
  }

  async findAll(
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<Category>> {
    const supabase = await this.getClient()
    
    let query = supabase
      .from('categories')
      .select('*')
      .eq('active', true) // Apenas categorias ativas
      .order('name', { ascending: true })

    return this.paginate(query, pagination)
  }

  async findActive(): Promise<Category[]> {
    const supabase = await this.getClient()
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true })

    if (error) {
      return this.handleError(error)
    }

    return categories || []
  }
} 