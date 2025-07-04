-- Criar tabela de formas de pagamento
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('cash', 'credit', 'debit', 'pix', 'transfer', 'check', 'other')),
  payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('immediate', 'installment')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type);
CREATE INDEX IF NOT EXISTS idx_payment_methods_payment_type ON payment_methods(payment_type);

-- Habilitar RLS (Row Level Security)
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso apenas aos usuários autenticados
CREATE POLICY "Users can view payment methods" ON payment_methods
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert payment methods" ON payment_methods
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update payment methods" ON payment_methods
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete payment methods" ON payment_methods
  FOR DELETE USING (auth.role() = 'authenticated');

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_methods_updated_at();

-- Inserir dados iniciais
INSERT INTO payment_methods (name, type, payment_type, active) VALUES
  ('Dinheiro', 'cash', 'immediate', true),
  ('Cartão de Crédito', 'credit', 'installment', true),
  ('Cartão de Débito', 'debit', 'immediate', true),
  ('PIX', 'pix', 'immediate', true),
  ('Transferência', 'transfer', 'immediate', true),
  ('Cheque', 'check', 'installment', false)
ON CONFLICT DO NOTHING; 