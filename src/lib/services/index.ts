// =====================================================
// EXPORTAÇÕES DOS SERVIÇOS DO SISTEMA
// =====================================================

export { BaseService } from './base'
export { ProductService } from './products'
export { CustomerService } from './customers'
export { SaleService } from './sales'
export { DashboardService } from './dashboard'

// =====================================================
// INSTÂNCIAS PRÉ-CONFIGURADAS DOS SERVIÇOS
// =====================================================

import { ProductService } from './products'
import { CustomerService } from './customers'
import { SaleService } from './sales'
import { DashboardService } from './dashboard'

// Instâncias singleton dos serviços
export const productService = new ProductService()
export const customerService = new CustomerService()
export const saleService = new SaleService()
export const dashboardService = new DashboardService() 