"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SaleForm } from '@/components/sales'
import { getCustomers, getActiveProducts, getPaymentMethods, createSale } from '../actions'
import { toast } from 'sonner'

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

interface SaleFormData {
  customer_id: string
  items: Array<{
    product_id: string
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
  }>
  payments: Array<{
    payment_method_id: string
    payment_method_name: string
    amount: number
    installments?: number
    due_date?: string
  }>
  subtotal: number
  discount: number
  total_amount: number
}

export function NewSaleClient() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true)
        const [customersResult, productsResult, paymentMethodsResult] = await Promise.all([
          getCustomers(),
          getActiveProducts(),
          getPaymentMethods()
        ])

        if (customersResult.success) {
          setCustomers(customersResult.data || [])
        } else {
          toast.error('Erro ao carregar clientes')
        }

        if (productsResult.success) {
          setProducts(productsResult.data || [])
        } else {
          toast.error('Erro ao carregar produtos')
        }

        if (paymentMethodsResult.success) {
          setPaymentMethods(paymentMethodsResult.data || [])
        } else {
          toast.error('Erro ao carregar formas de pagamento')
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast.error('Erro ao carregar dados')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [])

  // Submeter formulário
  const handleSubmit = async (data: SaleFormData) => {
    try {
      setIsLoading(true)
      
      const result = await createSale(data)
      
      if (result.success) {
        toast.success('Venda criada com sucesso!')
        router.push('/sales')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Erro ao criar venda:', error)
      toast.error('Erro ao criar venda')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Cancelar
  const handleCancel = () => {
    router.push('/sales')
  }

      return (
      <SaleForm
        customers={customers}
        products={products}
        paymentMethods={paymentMethods}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    )
} 