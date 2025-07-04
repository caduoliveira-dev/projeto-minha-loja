import { PaymentMethodsClient } from './payment-methods-client'
import { getPaymentMethods } from './actions'

export default async function PaymentMethodsPage() {
  const paymentMethodsResult = await getPaymentMethods()
  
  const paymentMethods = paymentMethodsResult.success ? paymentMethodsResult.data || [] : []

  return (
    <div className="px-8">
      <PaymentMethodsClient initialPaymentMethods={paymentMethods} />
    </div>
  )
} 