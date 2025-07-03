import { BaseService } from './base'

export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export class UserService extends BaseService {
  async getCurrentUser(): Promise<UserProfile | null> {
    const supabase = await this.getClient()
    
    // Primeiro, obter o usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return null
    }

    // Buscar o perfil na tabela profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return profile
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const supabase = await this.getClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Usuário não autenticado')
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ 
        ...data, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return this.handleError(error)
    }

    return profile
  }
} 