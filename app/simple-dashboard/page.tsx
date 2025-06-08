"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Package, 
  FileText, 
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface DashboardStats {
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

// Simple data loading function
async function loadBusinessData() {
  try {
    const [customers, products, invoices, sales] = await Promise.all([
      fetch('/api/customers').then(res => res.json()),
      fetch('/api/products').then(res => res.json()),
      fetch('/api/invoices').then(res => res.json()),
      fetch('/api/sales').then(res => res.json())
    ])

    return { customers, products, invoices, sales }
  } catch (error) {
    console.error('データ読み込みエラー:', error)
    return { customers: [], products: [], invoices: [], sales: [] }
  }
}

export default function SimpleDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalProducts: 0,
    totalInvoices: 0,
    totalSales: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    monthlyRevenue: 0,
    monthlyProfit: 0,
    monthlyExpenseTotal: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { customers, products, invoices, sales } = await loadBusinessData()
        
        // Calculate basic statistics
        const totalSales = sales.reduce((sum: number, sale: any) => sum + sale.amount, 0)
        const totalExpenses = invoices.filter((inv: any) => inv.type === 'expense')
          .reduce((sum: number, inv: any) => sum + inv.amount, 0)
        const netProfit = totalSales - totalExpenses
        const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0

        setStats({
          totalCustomers: customers.length,
          totalProducts: products.length,
          totalInvoices: invoices.length,
          totalSales,
          totalExpenses,
          netProfit,
          profitMargin,
          monthlyRevenue: totalSales, // Simplified calculation
          monthlyProfit: netProfit,   // Simplified calculation
          monthlyExpenseTotal: totalExpenses
        })
      } catch (error) {
        console.error('統計計算エラー:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-600 mt-2">ビジネス概要と主要な指標（シンプル版）</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総顧客数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              アクティブな顧客
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">商品数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              登録商品
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">請求書数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              発行済み請求書
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総売上</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
            <p className="text-xs text-muted-foreground">
              累計売上
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>財務概要</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">総売上</span>
              <span className="font-semibold">{formatCurrency(stats.totalSales)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">総支出</span>
              <span className="font-semibold text-red-600">{formatCurrency(stats.totalExpenses)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">純利益</span>
                <div className="flex items-center space-x-2">
                  {stats.netProfit >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.netProfit)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">利益率</span>
                <Badge variant={stats.profitMargin >= 20 ? "default" : stats.profitMargin >= 10 ? "secondary" : "destructive"}>
                  {stats.profitMargin.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ビジネス機能</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              このシンプル版では以下の機能をご利用いただけます：
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span>顧客管理</span>
              </li>
              <li className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-green-600" />
                <span>商品管理</span>
              </li>
              <li className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span>請求書管理</span>
              </li>
              <li className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-yellow-600" />
                <span>財務管理</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                💡 このバージョンはAI機能を除いた基本的なビジネス管理機能のみを提供します。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}