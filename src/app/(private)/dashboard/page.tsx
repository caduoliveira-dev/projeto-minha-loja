import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { LogOut, User, Phone, Mail } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  // Buscar dados do perfil da tabela profiles (criado pelo trigger)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <form action={handleSignOut}>
                <Button
                  type="submit"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Perfil do Usuário</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Nome</p>
                  <p className="text-lg text-gray-900">
                    {profile?.name || user.user_metadata?.display_name || 'Não informado'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefone</p>
                  <p className="text-lg text-gray-900">
                    {profile?.phone || user.user_metadata?.phone || 'Não informado'}
                  </p>
                </div>
              </div>

              {profile?.created_at && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Membro desde: {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Bem-vindo, {profile?.name || user.user_metadata?.display_name || user.email}!
          </h3>
          <p className="text-gray-600">
            Esta é sua área pessoal. Aqui você poderá gerenciar suas informações e acessar os recursos da plataforma.
          </p>
        </div>
      </div>
    </div>
  )
}
