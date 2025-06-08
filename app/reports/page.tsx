"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  FileText,
  DollarSign,
  Users,
  Package,
  PieChart
} from 'lucide-react'

interface ReportData {
  period: string
  sales: {
    total: number
    count: number
    averageOrderValue: number
    growth: number
  }
  expenses: {
    total: number
    count: number
    averageExpense: number
    growth: number
  }
  customers: {
    total: number
    new: number
    returning: number
  }
  products: {
    total: number
    lowStock: number
    topSelling: Array<{
      name: string
      quantity: number
      revenue: number
    }>
  }
  profitLoss: {
    revenue: number
    expenses: number
    netProfit: number
    profitMargin: number
    profitGrowth: number
  }
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [reportType, setReportType] = useState('overview')

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/analytics?period=${selectedPeriod}`)
      
      if (!response.ok) {
        throw new Error('レポートデータの取得に失敗しました')
      }
      
      const result = await response.json()
      
      if (result.success) {
        // APIレスポンスをReportData形式に変換
        const analytics = result.data
        
        // 期間に基づいた表示ラベルを生成
        const now = new Date()
        let periodLabel = ''
        switch (selectedPeriod) {
          case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3) + 1
            periodLabel = `${now.getFullYear()}年 Q${quarter}`
            break
          case 'year':
            periodLabel = `${now.getFullYear()}年`
            break
          case 'month':
          default:
            periodLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`
            break
        }
        
        const reportData: ReportData = {
          period: periodLabel,
          sales: {
            total: analytics.totalSales,
            count: analytics.totalInvoices || 0,
            averageOrderValue: analytics.totalInvoices > 0 ? analytics.totalSales / analytics.totalInvoices : 0,
            growth: analytics.salesGrowth || 0
          },
          expenses: {
            total: analytics.totalExpenses,
            count: analytics.totalExpenseItems || 0,
            averageExpense: analytics.totalExpenseItems > 0 ? analytics.totalExpenses / analytics.totalExpenseItems : 0,
            growth: analytics.expenseGrowth || 0
          },
          customers: {
            total: analytics.totalCustomers,
            new: Math.floor(analytics.totalCustomers * 0.2), // TODO: 新規顧客追跡機能を実装
            returning: Math.floor(analytics.totalCustomers * 0.8)
          },
          products: {
            total: analytics.totalProducts,
            lowStock: analytics.lowStockProducts,
            topSelling: analytics.topProducts?.map((product: any) => ({
              name: product.name,
              quantity: product.sold || 0,
              revenue: product.revenue || 0
            })) || []
          },
          profitLoss: {
            revenue: analytics.totalSales,
            expenses: analytics.totalExpenses,
            netProfit: analytics.netProfit,
            profitMargin: analytics.profitMargin,
            profitGrowth: analytics.profitGrowth || 0
          }
        }
        setReportData(reportData)
      } else {
        setError(result.message || 'レポートデータの取得に失敗しました')
        setReportData(null)
      }
    } catch (error) {
      console.error('レポートデータの取得エラー:', error)
      setError('レポートデータの取得中にエラーが発生しました')
      setReportData(null)
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod])

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <h1 className="text-3xl font-bold mb-8 bg-gray-200 h-8 w-48 rounded"></h1>
          <div className="grid gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">レポート・分析</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
          </div>
          <Button onClick={fetchReportData} className="bg-blue-600 hover:bg-blue-700">
            再試行
          </Button>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">レポート・分析</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-600">レポートデータがありません</p>
          </div>
          <Button onClick={fetchReportData} className="bg-blue-600 hover:bg-blue-700">
            データを読み込む
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            レポート・分析
          </h1>
          <p className="text-gray-600">
            ビジネスパフォーマンスの分析と週間・月間サマリー
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download size={16} />
            <span>PDFエクスポート</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <FileText size={16} />
            <span>Excelエクスポート</span>
          </Button>
        </div>
      </div>

      {/* 期間選択 */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setSelectedPeriod('month')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedPeriod === 'month' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          今月
        </button>
        <button
          onClick={() => setSelectedPeriod('quarter')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedPeriod === 'quarter' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          四半期
        </button>
        <button
          onClick={() => setSelectedPeriod('year')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedPeriod === 'year' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          年間
        </button>
      </div>

      {/* サマリー期間表示 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {reportData.period} サマリー
        </h2>
      </div>

      {/* KPI カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">売上高</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData.sales.total)}
                </p>
                <div className="flex items-center mt-1">
                  {reportData.sales.growth >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${reportData.sales.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercentage(reportData.sales.growth)}
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">支出</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(reportData.expenses.total)}
                </p>
                <div className="flex items-center mt-1">
                  {reportData.expenses.growth >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                  )}
                  <span className={`text-xs ${reportData.expenses.growth >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {formatPercentage(reportData.expenses.growth)}
                  </span>
                </div>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">純利益</p>
                <p className={`text-2xl font-bold ${reportData.profitLoss.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(reportData.profitLoss.netProfit)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  利益率: {reportData.profitLoss.profitMargin.toFixed(1)}%
                </p>
              </div>
              <BarChart3 className={`h-8 w-8 ${reportData.profitLoss.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均注文額</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(reportData.sales.averageOrderValue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  注文数: {reportData.sales.count}件
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 売上高推移 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              売上・支出推移
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-800">売上高</p>
                  <p className="text-xl font-bold text-green-900">
                    {formatCurrency(reportData.sales.total)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600">
                    前期比 {formatPercentage(reportData.sales.growth)}
                  </p>
                  <p className="text-xs text-green-500">
                    {reportData.sales.count}件の取引
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-red-800">支出</p>
                  <p className="text-xl font-bold text-red-900">
                    {formatCurrency(reportData.expenses.total)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-600">
                    前期比 {formatPercentage(reportData.expenses.growth)}
                  </p>
                  <p className="text-xs text-red-500">
                    {reportData.expenses.count}件の支出
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">純利益</span>
                  <span className={`text-lg font-bold ${reportData.profitLoss.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(reportData.profitLoss.netProfit)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 顧客・商品統計 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              顧客・商品統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">顧客統計</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{reportData.customers.total}</p>
                    <p className="text-xs text-gray-500">総顧客数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{reportData.customers.new}</p>
                    <p className="text-xs text-gray-500">新規顧客</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{reportData.customers.returning}</p>
                    <p className="text-xs text-gray-500">既存顧客</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">商品統計</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{reportData.products.total}</p>
                    <p className="text-xs text-gray-500">総商品数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{reportData.products.lowStock}</p>
                    <p className="text-xs text-gray-500">低在庫商品</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 売れ筋商品 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            売れ筋商品ランキング
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.products.topSelling.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">販売数: {product.quantity}個</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                  <p className="text-xs text-gray-500">売上</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* アクションアイテム */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            推奨アクション
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData.products.lowStock > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Package className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">在庫補充が必要</p>
                  <p className="text-sm text-yellow-700">
                    {reportData.products.lowStock}個の商品で在庫が少なくなっています。
                  </p>
                </div>
              </div>
            )}
            
            {reportData.profitLoss.profitMargin < 10 && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">利益率の改善</p>
                  <p className="text-sm text-red-700">
                    利益率が{reportData.profitLoss.profitMargin.toFixed(1)}%と低めです。コスト削減や価格見直しを検討してください。
                  </p>
                </div>
              </div>
            )}
            
            {reportData.customers.new < 5 && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">新規顧客獲得</p>
                  <p className="text-sm text-blue-700">
                    新規顧客数が{reportData.customers.new}人です。マーケティング活動の強化を検討してください。
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
