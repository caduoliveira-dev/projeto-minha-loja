// =====================================================
// EXPORTAÇÕES DOS SERVIÇOS DO SISTEMA
// =====================================================

export { BaseService } from './base'
export { ProductService } from './products'
export { CategoryService } from './categories'
export { CustomerService } from './customers'
export { SaleService } from './sales'
export { DashboardService } from './dashboard'
export { UserService } from './user'

// =====================================================
// INSTÂNCIAS PRÉ-CONFIGURADAS DOS SERVIÇOS
// =====================================================

import { ProductService } from './products'
import { CategoryService } from './categories'
import { CustomerService } from './customers'
import { SaleService } from './sales'
import { DashboardService } from './dashboard'
import { UserService } from './user'

// Instâncias singleton dos serviços
export const productService = new ProductService()
export const categoryService = new CategoryService()
export const customerService = new CustomerService()
export const saleService = new SaleService()
export const dashboardService = new DashboardService()
export const userService = new UserService() 