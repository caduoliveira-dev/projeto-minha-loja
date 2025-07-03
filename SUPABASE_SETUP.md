# Configuração do Supabase

## 1. Criar a Tabela de Perfis com Trigger Automático

Execute o seguinte SQL no SQL Editor do seu projeto Supabase:

```sql
-- Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Usuários podem inserir apenas seu próprio perfil
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Permitir que o sistema insira perfis
CREATE POLICY "System can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- Criar função para inserir perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, phone, email)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Usuário'),
        NEW.raw_user_meta_data->>'phone',
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para inserir perfil automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar função para atualizar perfil quando dados do usuário mudarem
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles 
    SET 
        name = COALESCE(NEW.raw_user_meta_data->>'display_name', OLD.raw_user_meta_data->>'display_name'),
        phone = NEW.raw_user_meta_data->>'phone',
        email = NEW.email,
        updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para atualizar perfil automaticamente
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();
```

## 2. Como Funciona

### Fluxo de Cadastro:
1. Usuário preenche o formulário (nome, telefone, email, senha)
2. Action salva os dados na tabela `auth.users` com `display_name` e `phone` no metadata
3. **Trigger automático** copia os dados para a tabela `profiles`
4. Dashboard busca os dados da tabela `profiles`

### Vantagens:
- ✅ **Automático**: Não precisa de código adicional para salvar na tabela profiles
- ✅ **Sincronizado**: Dados sempre atualizados entre auth.users e profiles
- ✅ **Simples**: Action apenas salva na auth.users
- ✅ **Robusto**: Funciona mesmo se a tabela profiles não existir

## 3. Configurar Variáveis de Ambiente

Certifique-se de que seu arquivo `.env.local` contenha as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

## 4. Funcionalidades Implementadas

### Autenticação
- ✅ Login com email e senha
- ✅ Cadastro com nome, telefone, email e senha
- ✅ Validação de formulários
- ✅ Confirmação de email
- ✅ Logout

### Perfil do Usuário
- ✅ Armazenamento automático na tabela profiles via trigger
- ✅ Dashboard com informações do perfil
- ✅ Interface moderna e responsiva
- ✅ Fallback para dados do metadata se necessário

### Segurança
- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de acesso por usuário
- ✅ Validação de entrada
- ✅ Sanitização de dados

## 5. Solução de Problemas

### Trigger não está funcionando

1. **Verifique se o trigger foi criado:**
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

2. **Teste manualmente:**
   ```sql
   INSERT INTO auth.users (id, email, raw_user_meta_data)
   VALUES ('test-id', 'test@example.com', '{"display_name": "Test", "phone": "123456"}');
   ```

3. **Verifique se o perfil foi criado:**
   ```sql
   SELECT * FROM public.profiles WHERE id = 'test-id';
   ```

### Dados não aparecem no dashboard

1. **Verifique se o trigger está funcionando**
2. **Verifique as políticas RLS**
3. **Os dados podem estar no metadata como fallback**

## 6. Próximos Passos

Após configurar a tabela, você pode:

1. Testar o cadastro de novos usuários
2. Verificar se os dados estão sendo salvos automaticamente
3. Implementar funcionalidades adicionais como:
   - Edição de perfil
   - Upload de avatar
   - Recuperação de senha
   - Autenticação social (Google, Facebook, etc.)

## 7. Estrutura da Tabela

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID do usuário (referência para auth.users) |
| name | TEXT | Nome completo do usuário (do display_name) |
| phone | TEXT | Número de telefone |
| email | TEXT | Email do usuário |
| avatar_url | TEXT | URL do avatar (opcional) |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data da última atualização | 