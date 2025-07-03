'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'

import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
    const supabase = await createClient()
  
    // Extrair dados do formulário
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }
  
    // Validar dados com Zod
    const validationResult = registerSchema.safeParse(rawData)
    
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors
      const errorMessage = Object.values(errors)
        .flat()
        .join(', ')
      throw new Error(errorMessage)
    }
  
    const data: RegisterFormData = validationResult.data
  
    // Criar o usuário com display_name e phone
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.name.trim(),
          phone: data.phone,
        }
      }
    })
  
    if (authError) {
      console.error('Erro na criação do usuário:', authError)
      throw new Error(authError.message)
    }
  
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}