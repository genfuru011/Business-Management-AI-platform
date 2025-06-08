// Simple Business Management Platform Types

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  company?: string
  createdAt: string
  totalSpent: number
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  cost: number
  sku: string
  category: string
  stock: number
  createdAt: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  dueDate: string
  createdAt: string
  items: InvoiceItem[]
}

export interface InvoiceItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
}

export interface FinancialRecord {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: string
  reference?: string
}

export interface DashboardStats {
  totalCustomers: number
  totalProducts: number
  totalInvoices: number
  totalSales: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  monthlyRevenue: number
  monthlyProfit: number
  monthlyExpenseTotal: number
}