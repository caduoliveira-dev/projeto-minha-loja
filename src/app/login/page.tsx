'use client'

import { useState } from 'react'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { isNextRedirectError } from '@/lib/utils'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    
    try {
      await login(formData)
    } catch (error) {
      if (isNextRedirectError(error)) {
        return
      }
      
      console.error('Erro na autenticação:', error)
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-[800px]">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" action={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Bem-vindo de volta!</h1>
                <p className="text-muted-foreground text-balance">
                  Faça login em sua conta
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <Input id="password" type="password" name="password" />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Carregando...' : 'Entrar'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Não tem uma conta?{" "}
              <a href="/register" className="underline underline-offset-4">
                Cadastre-se
              </a>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}