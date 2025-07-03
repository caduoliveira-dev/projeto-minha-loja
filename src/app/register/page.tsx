'use client'

import { useState } from 'react'
import { signup } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { PasswordStrength } from '@/components/ui/password-strength'
import { PhoneInput } from '@/components/ui/phone-input'
import { isNextRedirectError } from '@/lib/utils'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phoneValue, setPhoneValue] = useState('')

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    
    try {
      await signup(formData)
      // Se chegou aqui, o cadastro foi bem-sucedido
      toast.success('Conta criada com sucesso!')
    } catch (error) {
      // NEXT_REDIRECT é um erro especial do Next.js para redirecionamentos
      // Não deve ser tratado como erro real
      if (isNextRedirectError(error)) {
        return // Sai silenciosamente, o redirecionamento acontecerá automaticamente
      }
      
      console.error('Erro no cadastro:', error)
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para criar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="João Silva"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="joao@exemplo.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <PhoneInput
                  id="phone"
                  name="phone"
                  placeholder="(11) 99999-9999"
                  onChange={setPhoneValue}
                />
                <input type="hidden" name="phone" value={phoneValue} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <PasswordStrength password={password} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type="password" 
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600">
                    As senhas não coincidem
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </div>
            
            <div className="mt-4 text-center text-sm">
              Já tem uma conta?{" "}
              <a href="/login" className="underline underline-offset-4">
                Faça login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}