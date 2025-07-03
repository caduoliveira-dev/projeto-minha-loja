-- =====================================================
-- TABELAS DO SISTEMA DE GESTÃO EMPRESARIAL
-- =====================================================

-- 1. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    sale_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    moves_stock BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE VENDAS
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    profit_estimate DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('cash', 'credit')),
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE, -- Para vendas a prazo
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE ITENS DE VENDA
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL, -- Preço de custo no momento da venda
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE CONTAS A PAGAR
CREATE TABLE IF NOT EXISTS public.payables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    description TEXT,
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    recurring_interval TEXT CHECK (recurring_interval IN ('monthly', 'quarterly', 'yearly')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE CONTAS A RECEBER
CREATE TABLE IF NOT EXISTS public.receivables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL, -- Para vendas a prazo
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para produtos
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_moves_stock ON public.products(moves_stock);

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- Índices para vendas
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON public.sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON public.sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_payment_type ON public.sales(payment_type);
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales(status);

-- Índices para itens de venda
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON public.sale_items(product_id);

-- Índices para contas a pagar
CREATE INDEX IF NOT EXISTS idx_payables_due_date ON public.payables(due_date);
CREATE INDEX IF NOT EXISTS idx_payables_status ON public.payables(status);
CREATE INDEX IF NOT EXISTS idx_payables_is_recurring ON public.payables(is_recurring);

-- Índices para contas a receber
CREATE INDEX IF NOT EXISTS idx_receivables_customer_id ON public.receivables(customer_id);
CREATE INDEX IF NOT EXISTS idx_receivables_due_date ON public.receivables(due_date);
CREATE INDEX IF NOT EXISTS idx_receivables_status ON public.receivables(status);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar estoque após venda
CREATE OR REPLACE FUNCTION public.update_stock_after_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estoque apenas se o produto movimenta estoque
    UPDATE public.products 
    SET 
        stock_quantity = stock_quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id AND moves_stock = true;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar estoque após inserção de item de venda
CREATE TRIGGER trigger_update_stock_after_sale
    AFTER INSERT ON public.sale_items
    FOR EACH ROW EXECUTE FUNCTION public.update_stock_after_sale();

-- Função para calcular lucro estimado da venda
CREATE OR REPLACE FUNCTION public.calculate_sale_profit()
RETURNS TRIGGER AS $$
DECLARE
    total_profit DECIMAL(10,2) := 0;
BEGIN
    -- Calcular lucro total dos itens da venda
    SELECT COALESCE(SUM((si.unit_price - si.cost_price) * si.quantity), 0)
    INTO total_profit
    FROM public.sale_items si
    WHERE si.sale_id = NEW.id;
    
    -- Atualizar o lucro estimado da venda
    UPDATE public.sales 
    SET profit_estimate = total_profit
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para calcular lucro após inserção de item de venda
CREATE TRIGGER trigger_calculate_sale_profit
    AFTER INSERT ON public.sale_items
    FOR EACH ROW EXECUTE FUNCTION public.calculate_sale_profit();

-- Função para atualizar status de contas vencidas
CREATE OR REPLACE FUNCTION public.update_overdue_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar status para vencido se a data de vencimento passou
    IF NEW.due_date < CURRENT_DATE AND NEW.status = 'pending' THEN
        NEW.status := 'overdue';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para contas a pagar
CREATE TRIGGER trigger_update_payable_status
    BEFORE INSERT OR UPDATE ON public.payables
    FOR EACH ROW EXECUTE FUNCTION public.update_overdue_status();

-- Trigger para contas a receber
CREATE TRIGGER trigger_update_receivable_status
    BEFORE INSERT OR UPDATE ON public.receivables
    FOR EACH ROW EXECUTE FUNCTION public.update_overdue_status();

-- =====================================================
-- HABILITAR RLS (ROW LEVEL SECURITY)
-- =====================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE SEGURANÇA
-- =====================================================

-- Políticas para produtos (todos os usuários autenticados podem acessar)
CREATE POLICY "Users can view products" ON public.products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert products" ON public.products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update products" ON public.products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete products" ON public.products FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para clientes
CREATE POLICY "Users can view customers" ON public.customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert customers" ON public.customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update customers" ON public.customers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete customers" ON public.customers FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para vendas
CREATE POLICY "Users can view sales" ON public.sales FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert sales" ON public.sales FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update sales" ON public.sales FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete sales" ON public.sales FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para itens de venda
CREATE POLICY "Users can view sale items" ON public.sale_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert sale items" ON public.sale_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update sale items" ON public.sale_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete sale items" ON public.sale_items FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para contas a pagar
CREATE POLICY "Users can view payables" ON public.payables FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert payables" ON public.payables FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update payables" ON public.payables FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete payables" ON public.payables FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para contas a receber
CREATE POLICY "Users can view receivables" ON public.receivables FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert receivables" ON public.receivables FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update receivables" ON public.receivables FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete receivables" ON public.receivables FOR DELETE USING (auth.role() = 'authenticated'); 