import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Customer, Product, Invoice, FinancialRecord, DashboardStats } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Data loading utilities
export async function loadData<T>(filename: string): Promise<T[]> {
  try {
    const response = await fetch(`/data/${filename}`)
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error loading ${filename}:`, error)
    return []
  }
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(amount)
}

// Format date
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

// Calculate dashboard statistics
export function calculateDashboardStats(
  customers: Customer[],
  products: Product[],
  invoices: Invoice[],
  finances: FinancialRecord[]
): DashboardStats {
  const paidInvoices = invoices.filter(inv => inv.status === 'paid')
  const totalSales = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalExpenses = finances
    .filter(f => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0)
  
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const monthlyInvoices = paidInvoices.filter(inv => {
    const invDate = new Date(inv.createdAt)
    return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear
  })
  
  const monthlyExpenses = finances.filter(f => {
    const fDate = new Date(f.date)
    return f.type === 'expense' && 
           fDate.getMonth() === currentMonth && 
           fDate.getFullYear() === currentYear
  })
  
  const monthlyRevenue = monthlyInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const monthlyExpenseTotal = monthlyExpenses.reduce((sum, f) => sum + f.amount, 0)
  const monthlyProfit = monthlyRevenue - monthlyExpenseTotal
  const netProfit = totalSales - totalExpenses
  const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0

  return {
    totalCustomers: customers.length,
    totalProducts: products.length,
    totalInvoices: invoices.length,
    totalSales,
    totalExpenses,
    netProfit,
    profitMargin,
    monthlyRevenue,
    monthlyProfit,
    monthlyExpenseTotal
  }
}