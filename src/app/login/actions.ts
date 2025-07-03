'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Extrair dados do formulário
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Validar dados com Zod
  const validationResult = loginSchema.safeParse(rawData)
  
  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors
    const errorMessage = Object.values(errors)
      .flat()
      .join(', ')
    throw new Error(errorMessage)
  }

  const data: LoginFormData = validationResult.data

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}