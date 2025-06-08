"use client"

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BusinessAIAgent from '@/components/BusinessAIAgent'
import AIQuickActions from '@/components/AIQuickActions'
import RealTimeBusinessMonitor from '@/components/RealTimeBusinessMonitor'
import PerformanceMonitorDashboard from '@/components/PerformanceMonitorDashboard'
import ReportExportModal from '@/components/ReportExportModal'
import { ReportExporter } from '@/lib/report-exporter'
import { 
  Users, 
  Package, 
  FileText, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  FileSpreadsheet,
  FileImage,
  Activity
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
  salesGrowth: number
  expenseGrowth: number
  profitGrowth: number
}

export default function Dashboard() {
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
    monthlyExpenseTotal: 0,
    salesGrowth: 0,
    expenseGrowth: 0,
    profitGrowth: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [periodLoading, setPeriodLoading] = useState(false)
  const [currentQuery, setCurrentQuery] = useState<string>('')
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // AIエージェント用のクエリ処理
  const handleQuickAction = (query: string) => {
    console.log('Quick Action Query:', query)
    setCurrentQuery(query)
  }

  const handleQueryProcessed = () => {
    setCurrentQuery('')
  }

  // レポート出力機能（一時的にコメントアウト）
  const handleExportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const reportResponse = await fetch('/api/business-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: 'comprehensive',
          period: selectedPeriod
        })
      })

      const reportData = await reportResponse.json()
      
      if (reportData.success) {
        if (format === 'pdf') {
          await ReportExporter.exportToPDF(reportData.report)
        } else if (format === 'excel') {
          await ReportExporter.exportToExcel(reportData.report, stats)
        } else if (format === 'csv') {
          await ReportExporter.exportToCSV([stats], `dashboard-data-${new Date().toISOString().split('T')[0]}`)
        }
      }
    } catch (error) {
      console.error('レポート出力エラー:', error)
      setError('レポートの出力に失敗しました')
    }
  }

  const fetchStats = useCallback(async () => {
    try {
      if (!loading) {
        setPeriodLoading(true)
      }
      setError(null)
      
      const response = await fetch(`/api/analytics?period=${selectedPeriod}`)
      const result = await response.json()
      
      if (result.success) {
        setStats({
          totalCustomers: result.data.totalCustomers,
          totalProducts: result.data.totalProducts,
          totalInvoices: result.data.totalInvoices,
          totalSales: result.data.totalSales,
          totalExpenses: result.data.totalExpenses,
          netProfit: result.data.netProfit,
          profitMargin: result.data.profitMargin,
          monthlyRevenue: result.data.monthlyRevenue,
          monthlyProfit: result.data.monthlyProfit,
          monthlyExpenseTotal: result.data.monthlyExpenseTotal,
          salesGrowth: result.data.salesGrowth || 0,
          expenseGrowth: result.data.expenseGrowth || 0,
          profitGrowth: result.data.profitGrowth || 0
        })
      } else {
        setError(result.message || 'データの取得に失敗しました')
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err)
      setError('データの取得中にエラーが発生しました')
    } finally {
      setLoading(false)
      setPeriodLoading(false)
    }
  }, [selectedPeriod, loading])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-bold mb-2">エラーが発生しました</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* 期間選択とレポート出力 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ダッシュボード
          </h1>
          <p className="text-gray-600">
            ビジネスの概要と主要指標をご確認ください
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* レポート出力ボタン */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>レポート出力</span>
          </Button>

          {/* 期間選択 */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setSelectedPeriod('month')}
              disabled={periodLoading}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'month' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              } ${periodLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              今月
            </button>
            <button
              onClick={() => setSelectedPeriod('quarter')}
              disabled={periodLoading}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'quarter' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              } ${periodLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              四半期
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              disabled={periodLoading}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'year' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              } ${periodLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              年間
            </button>
          </div>
        </div>
        
        {periodLoading && (
          <div className="text-sm text-gray-500">
            データを読み込み中...
          </div>
        )}
      </div>

      {/* タブベースの統合ビュー */}
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="realtime">リアルタイム</TabsTrigger>
          <TabsTrigger value="performance">パフォーマンス</TabsTrigger>
          <TabsTrigger value="ai-assistant">AIアシスタント</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* AIクイックアクション */}
          <AIQuickActions onActionSelect={handleQuickAction} />

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  登録済み商品
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
                  累計売上金額
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue and Profit Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今月の売上</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.monthlyRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  当月の売上合計
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今月の経費</CardTitle>
                <DollarSign className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.monthlyExpenseTotal)}
                </div>
                <p className="text-xs text-muted-foreground">
                  当月の経費合計
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今月の利益</CardTitle>
                <TrendingUp className={`h-4 w-4 ${stats.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.monthlyProfit)}
                </div>
                <p className="text-xs text-muted-foreground">
                  売上 - 経費
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">財務概要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">総売上</span>
                  <span className="text-lg font-semibold text-green-600">
                    {formatCurrency(stats.totalSales)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">総経費</span>
                  <span className="text-lg font-semibold text-red-600">
                    {formatCurrency(stats.totalExpenses)}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">純利益</span>
                    <span className={`text-xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(stats.netProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">利益率</span>
                    <span className={`text-sm font-medium ${stats.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.profitMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">前期比成長率</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">売上成長率</span>
                  <div className="flex items-center">
                    <span className={`text-lg font-semibold ${stats.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.salesGrowth >= 0 ? '+' : ''}{stats.salesGrowth.toFixed(1)}%
                    </span>
                    {stats.salesGrowth >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 ml-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 ml-1" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">経費変動率</span>
                  <div className="flex items-center">
                    <span className={`text-lg font-semibold ${stats.expenseGrowth <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.expenseGrowth >= 0 ? '+' : ''}{stats.expenseGrowth.toFixed(1)}%
                    </span>
                    {stats.expenseGrowth <= 0 ? (
                      <TrendingDown className="h-4 w-4 text-green-600 ml-1" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-red-600 ml-1" />
                    )}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">利益成長率</span>
                    <div className="flex items-center">
                      <span className={`text-xl font-bold ${stats.profitGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.profitGrowth >= 0 ? '+' : ''}{stats.profitGrowth.toFixed(1)}%
                      </span>
                      {stats.profitGrowth >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600 ml-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 ml-1" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">クイックアクション</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <a href="/customers" className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="font-medium text-blue-900">新規顧客登録</div>
                  <div className="text-sm text-blue-600">顧客情報を追加</div>
                </a>
                <a href="/products" className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="font-medium text-green-900">商品管理</div>
                  <div className="text-sm text-green-600">在庫と価格の管理</div>
                </a>
                <a href="/invoices" className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <div className="font-medium text-purple-900">請求書作成</div>
                  <div className="text-sm text-purple-600">新しい請求書を発行</div>
                </a>
                <a href="/reports" className="block p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                  <div className="font-medium text-orange-900">レポート表示</div>
                  <div className="text-sm text-orange-600">分析とレポート</div>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">システム状況</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">データベース</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  正常
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API接続</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  正常
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">バックアップ</span>
                <Badge variant="secondary">
                  準備中
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <RealTimeBusinessMonitor />
          
          {/* リアルタイムアラートセクション */}
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <Activity className="h-5 w-5" />
                <span>システム統合監視</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                AIエージェント、データベース、外部API連携の状態を監視中...
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mx-auto mb-1"></div>
                  <div className="text-xs text-gray-600">AI エージェント</div>
                </div>
                <div className="text-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mx-auto mb-1"></div>
                  <div className="text-xs text-gray-600">データベース</div>
                </div>
                <div className="text-center">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                  <div className="text-xs text-gray-600">外部API</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceMonitorDashboard />
        </TabsContent>

        <TabsContent value="ai-assistant" className="space-y-6">
          <BusinessAIAgent 
            externalQuery={currentQuery}
            onExternalQueryProcessed={handleQueryProcessed}
          />
        </TabsContent>
      </Tabs>

      {/* レポート出力モーダル */}
      <ReportExportModal
        isOpen={isExportModalOpen}
        onCloseAction={() => setIsExportModalOpen(false)}
        reportData={stats}
      />
    </div>
  )
}
