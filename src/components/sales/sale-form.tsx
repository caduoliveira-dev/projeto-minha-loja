"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/utils/globals/money'
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { Separator } from "@/components/ui/separator"

interface Customer {
  id: string
  name: string
  email: string
}

interface Product {
  id: string
  name: string
  sale_price: number
  stock_quantity: number
  moves_stock: boolean
}

interface PaymentMethod {
  id: string
  name: string
  type: 'cash' | 'credit' | 'debit' | 'pix' | 'transfer' | 'check' | 'other'
  payment_type: 'immediate' | 'installment'
  active: boolean
}

interface SaleItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface SalePayment {
  payment_method_id: string
  payment_method_name: string
  amount: number
  installments?: number
  due_date?: string
}

interface SaleFormData {
  customer_id: string
  items: SaleItem[]
  payments: SalePayment[]
  subtotal: number
  discount: number
  total_amount: number
}

interface SaleFormProps {
  customers: Customer[]
  products: Product[]
  paymentMethods: PaymentMethod[]
  onSubmit: (data: SaleFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function SaleForm({ customers, products, paymentMethods, onSubmit, onCancel, isLoading }: SaleFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [discount, setDiscount] = useState<number>(0)
  const [items, setItems] = useState<SaleItem[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [installments, setInstallments] = useState<number>(1)
  const [dueDate, setDueDate] = useState<string>("")
  const [payments, setPayments] = useState<SalePayment[]>([])

  // Calcular totais
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
  const totalAmount = subtotal - discount

  // Adicionar produto à lista
  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) {
      toast.error("Selecione um produto e quantidade válida")
      return
    }

    const product = products.find(p => p.id === selectedProduct)
    if (!product) {
      toast.error("Produto não encontrado")
      return
    }

    // Verificar se produto já está na lista
    const existingItem = items.find(item => item.product_id === selectedProduct)
    if (existingItem) {
      toast.error("Este produto já foi adicionado")
      return
    }

    // Verificar estoque se o produto controla estoque
    if (product.moves_stock && product.stock_quantity < quantity) {
      toast.error(`Estoque insuficiente. Disponível: ${product.stock_quantity}`)
      return
    }

    const newItem: SaleItem = {
      product_id: selectedProduct,
      product_name: product.name,
      quantity,
      unit_price: product.sale_price,
      total_price: product.sale_price * quantity
    }

    setItems([...items, newItem])
    setSelectedProduct("")
    setQuantity(1)
  }

  // Remover item da lista
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  // Atualizar quantidade de um item
  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(index)
      return
    }

    const product = products.find(p => p.id === items[index].product_id)
    if (product?.moves_stock && product.stock_quantity < newQuantity) {
      toast.error(`Estoque insuficiente. Disponível: ${product.stock_quantity}`)
      return
    }

    setItems(items.map((item, i) => 
      i === index 
        ? { ...item, quantity: newQuantity, total_price: item.unit_price * newQuantity }
        : item
    ))
  }

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCustomer) {
      toast.error("Selecione um cliente")
      return
    }

    if (items.length === 0) {
      toast.error("Adicione pelo menos um produto")
      return
    }

    const formData: SaleFormData = {
      customer_id: selectedCustomer,
      items,
      payments,
      subtotal,
      discount,
      total_amount: totalAmount
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Erro ao criar venda:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Coluna Esquerda - Cliente e Produtos */}
        <div className="space-y-6 col-span-2">
          {/* Seleção de Cliente */}
          <div className="space-y-2">
            <Label htmlFor="customer">Cliente</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator orientation="horizontal" />

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">

              <div className="flex gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Produto</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="w-96">
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products
                        .filter(product => product.moves_stock ? product.stock_quantity > 0 : true)
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {formatCurrency(product.sale_price)}
                            {product.moves_stock && ` (Estoque: ${product.stock_quantity})`}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    className="w-24"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>
              </div>  
            
              <div className="flex mt-5">
                <Button 
                  type="button" 
                  onClick={handleAddItem}
                  disabled={!selectedProduct || quantity <= 0}
                  className="w-32"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

            </div>

            {/* Lista de Produtos */}
            {items.length > 0 && (
              <div className="space-y-2">
                <Label>Produtos Selecionados</Label>
                <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3">
                      <div className="flex-1">
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(item.unit_price)} cada
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="w-12 text-center">{item.quantity}</span>
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        
                        <span className="font-medium w-20 text-right">
                          {formatCurrency(item.total_price)}
                        </span>
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        

        {/* Coluna Direita - Pagamento e Resumo */}
        <div className="space-y-6">
          {/* Formas de Pagamento */}
          <div>
            <div className="flex items-start gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Selecione uma forma" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods
                      .filter(method => method.active)
                      .map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name} ({method.payment_type === 'immediate' ? 'À Vista' : 'A Prazo'})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Valor (R$)</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installments">Parcelas</Label>
                <Input
                  id="installments"
                  type="number"
                  min="1"
                  className="w-16"
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  disabled={!!(selectedPaymentMethod && paymentMethods.find(p => p.id === selectedPaymentMethod)?.payment_type === 'immediate')}
                />
              </div>
            </div>

            <div className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={() => {
                    if (!selectedPaymentMethod || paymentAmount <= 0) {
                      toast.error("Selecione uma forma de pagamento e informe o valor")
                      return
                    }
                    
                    const method = paymentMethods.find(p => p.id === selectedPaymentMethod)
                    if (!method) return
                    
                    const newPayment: SalePayment = {
                      payment_method_id: selectedPaymentMethod,
                      payment_method_name: method.name,
                      amount: paymentAmount,
                      installments: method.payment_type === 'installment' ? installments : undefined,
                      due_date: method.payment_type === 'installment' ? dueDate : undefined
                    }
                    
                    setPayments([...payments, newPayment])
                    setSelectedPaymentMethod("")
                    setPaymentAmount(0)
                    setInstallments(1)
                    setDueDate("")
                  }}
                  disabled={!selectedPaymentMethod || paymentAmount <= 0}
                  className="w-32"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
            </div>

            {/* Lista de Formas de Pagamento */}
            {payments.length > 0 && (
              <div className="space-y-2 mb-4">
                <Label>Formas de Pagamento Selecionadas</Label>
                <div className="border rounded-lg divide-y max-h-32 overflow-y-auto">
                  {payments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-3">
                      <div className="flex-1">
                        <div className="font-medium">{payment.payment_method_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.installments ? `${payment.installments}x` : 'À vista'}
                          {payment.due_date && ` - Vencimento: ${payment.due_date}`}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatCurrency(payment.amount)}
                        </span>
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPayments(payments.filter((_, i) => i !== index))
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

              <div className="space-y-2">
                <Label htmlFor="discount">Desconto (R$)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0,00"
                />
              </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="space-y-4">
            <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Desconto:</span>
                <span className="text-green-600">-{formatCurrency(discount)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg border-t pt-2">
                <span>Total:</span>
                <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Total Pago:</span>
                <span>{formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Resta:</span>
                <span className={totalAmount - payments.reduce((sum, payment) => sum + payment.amount, 0) > 0 ? "text-red-600" : "text-green-600"}>
                  {formatCurrency(totalAmount - payments.reduce((sum, payment) => sum + payment.amount, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-2 justify-end pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !selectedCustomer || items.length === 0}
        >
          {isLoading ? "Finalizando..." : "Realizar Venda"}
        </Button>
      </div>
    </form>
  )
} 