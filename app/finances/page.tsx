"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Banknote,
  Building,
  Receipt
} from 'lucide-react'

interface Sale {
  _id: string
  invoice?: {
    _id: string
    invoiceNumber: string
  }
  customer: {
    _id: string
    name: string
    company?: string
  }
  amount: number
  paymentMethod: 'cash' | 'credit_card' | 'bank_transfer' | 'paypal' | 'other'
  saleDate: string
  saleType: 'invoice_based' | 'direct_sale'
  productName?: string
  description?: string
  quantity?: number
  unitPrice?: number
  notes?: string
}

interface Expense {
  _id: string
  description: string
  amount: number
  category: string
  expenseDate: string
  paymentMethod: 'cash' | 'credit_card' | 'bank_transfer' | 'other'
  receipt?: string
  notes?: string
}

export default function FinancesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [customers, setCustomers] = useState<Array<{_id: string, name: string, company?: string}>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses' | 'summary'>('summary')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('month')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddSale, setShowAddSale] = useState(false)

  // 新規支出フォームの状態
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: '',
    paymentMethod: 'cash',
    notes: ''
  })

  // 新規売上フォームの状態
  const [saleForm, setSaleForm] = useState({
    customer: '',
    productName: '',
    description: '',
    quantity: '1',
    unitPrice: '',
    amount: '',
    paymentMethod: 'cash',
    notes: ''
  })

  useEffect(() => {
    fetchFinancialData()
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      const result = await response.json()
      
      if (result.success) {
        setCustomers(result.data)
      }
    } catch (error) {
      console.error('顧客データの取得エラー:', error)
    }
  }

  const fetchFinancialData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 売上データと支出データを並行で取得
      const [salesResponse, expensesResponse] = await Promise.all([
        fetch('/api/sales'),
        fetch('/api/expenses')
      ])
      
      if (!salesResponse.ok || !expensesResponse.ok) {
        throw new Error('財務データの取得に失敗しました')
      }
      
      const salesResult = await salesResponse.json()
      const expensesResult = await expensesResponse.json()
      
      if (salesResult.success) {
        setSales(salesResult.data)
      } else {
        console.error('売上データの取得エラー:', salesResult.message)
        setSales([])
      }
      
      if (expensesResult.success) {
        setExpenses(expensesResult.data)
      } else {
        console.error('支出データの取得エラー:', expensesResult.message)
        setExpenses([])
      }
    } catch (error) {
      console.error('財務データの取得エラー:', error)
      setError('財務データの取得中にエラーが発生しました')
      setSales([])
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const amount = parseFloat(saleForm.amount) || (parseFloat(saleForm.quantity) * parseFloat(saleForm.unitPrice))
      
      if (!amount || amount <= 0) {
        throw new Error('有効な金額を入力してください')
      }
      
      const saleData = {
        customer: saleForm.customer,
        productName: saleForm.productName,
        description: saleForm.description,
        quantity: parseInt(saleForm.quantity) || 1,
        unitPrice: parseFloat(saleForm.unitPrice) || 0,
        amount: amount,
        paymentMethod: saleForm.paymentMethod,
        notes: saleForm.notes,
        saleType: 'direct_sale',
        saleDate: new Date().toISOString()
      }

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData)
      })

      if (!response.ok) {
        throw new Error('売上の作成に失敗しました')
      }

      const result = await response.json()
      if (result.success) {
        // フォームリセット
        setSaleForm({
          customer: '',
          productName: '',
          description: '',
          quantity: '1',
          unitPrice: '',
          amount: '',
          paymentMethod: 'cash',
          notes: ''
        })
        setShowAddSale(false)
        
        // データ更新
        await fetchFinancialData()
      } else {
        throw new Error(result.message || '売上の作成に失敗しました')
      }
    } catch (error) {
      console.error('売上の作成に失敗しました:', error)
      setError('売上の作成中にエラーが発生しました')
    }
  }

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const expenseData = {
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        paymentMethod: expenseForm.paymentMethod,
        notes: expenseForm.notes,
        expenseDate: new Date().toISOString()
      }

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData)
      })

      if (!response.ok) {
        throw new Error('支出の作成に失敗しました')
      }

      const result = await response.json()
      if (result.success) {
        // フォームリセット
        setExpenseForm({
          description: '',
          amount: '',
          category: '',
          paymentMethod: 'cash',
          notes: ''
        })
        setShowAddExpense(false)
        
        // データ更新
        await fetchFinancialData()
      } else {
        throw new Error(result.message || '支出の作成に失敗しました')
      }
    } catch (error) {
      console.error('支出の作成に失敗しました:', error)
      setError('支出の作成中にエラーが発生しました')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote size={16} />
      case 'credit_card': return <CreditCard size={16} />
      case 'bank_transfer': return <Building size={16} />
      default: return <DollarSign size={16} />
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return '現金'
      case 'credit_card': return 'クレジットカード'
      case 'bank_transfer': return '銀行振込'
      case 'paypal': return 'PayPal'
      default: return 'その他'
    }
  }

  const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netProfit = totalSales - totalExpenses
  const profitMargin = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0

  const expenseCategories = [...new Set(expenses.map(e => e.category))]
  const expenseByCategory = expenseCategories.map(category => ({
    category,
    amount: expenses.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0)
  })).sort((a, b) => b.amount - a.amount)

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold mb-4">財務管理</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
          </div>
          <Button onClick={fetchFinancialData} className="bg-blue-600 hover:bg-blue-700">
            再試行
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">財務管理</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setShowAddSale(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            売上を追加
          </Button>
          <Button 
            onClick={() => setShowAddExpense(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            支出を追加
          </Button>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総売上</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              {sales.length}件の売上
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総支出</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.length}件の支出
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">純利益</CardTitle>
            <DollarSign className={`h-4 w-4 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              利益率 {profitMargin}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均売上</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(sales.length > 0 ? totalSales / sales.length : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              1件あたりの売上
            </p>
          </CardContent>
        </Card>
      </div>

      {/* タブナビゲーション */}
      <div className="flex space-x-1 mb-6">
        {['summary', 'sales', 'expenses'].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={activeTab === tab ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            {tab === 'summary' && 'サマリー'}
            {tab === 'sales' && '売上一覧'}
            {tab === 'expenses' && '支出一覧'}
          </Button>
        ))}
      </div>

      {/* サマリータブ */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* カテゴリ別支出 */}
          <Card>
            <CardHeader>
              <CardTitle>カテゴリ別支出</CardTitle>
            </CardHeader>
            <CardContent>
              {expenseByCategory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">支出データがありません</p>
              ) : (
                <div className="space-y-3">
                  {expenseByCategory.map((item) => (
                    <div key={item.category} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-sm font-bold">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 最近の取引 */}
          <Card>
            <CardHeader>
              <CardTitle>最近の取引</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...sales, ...expenses]
                  .sort((a, b) => new Date('saleDate' in b ? b.saleDate : b.expenseDate).getTime() - new Date('saleDate' in a ? a.saleDate : a.expenseDate).getTime())
                  .slice(0, 5)
                  .map((transaction) => (
                    <div key={transaction._id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {'saleDate' in transaction ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          {'customer' in transaction 
                            ? `${transaction.customer.name}からの売上`
                            : transaction.description
                          }
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${'saleDate' in transaction ? 'text-green-600' : 'text-red-600'}`}>
                        {'saleDate' in transaction ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 売上タブ */}
      {activeTab === 'sales' && (
        <Card>
          <CardHeader>
            <CardTitle>売上一覧 ({sales.length}件)</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">売上データがありません</h3>
                <p className="text-gray-500 mb-4">売上を追加してください。</p>
                <Button onClick={() => setShowAddSale(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  売上を追加
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sales.map((sale) => (
                  <div key={sale._id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold">
                            {sale.saleType === 'invoice_based' && sale.invoice
                              ? sale.invoice.invoiceNumber
                              : sale.productName || 'Direct Sale'
                            }
                          </h3>
                          <Badge className={sale.saleType === 'invoice_based' ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}>
                            {sale.saleType === 'invoice_based' ? '請求書売上' : '直接売上'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Building className="mr-2 h-4 w-4" />
                            <div>
                              <div className="font-medium">{sale.customer.name}</div>
                              {sale.customer.company && (
                                <div className="text-xs">{sale.customer.company}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            <div>
                              <div>{formatDate(sale.saleDate)}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            {getPaymentMethodIcon(sale.paymentMethod)}
                            <span className="ml-2">{getPaymentMethodText(sale.paymentMethod)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(sale.amount)}
                        </div>
                      </div>
                    </div>
                    
                    {sale.notes && (
                      <div className="mt-2 text-sm text-gray-500 border-t pt-2">
                        {sale.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 支出タブ */}
      {activeTab === 'expenses' && (
        <Card>
          <CardHeader>
            <CardTitle>支出一覧 ({expenses.length}件)</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <TrendingDown className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">支出データがありません</h3>
                <p className="text-gray-500 mb-4">支出を追加してください。</p>
                <Button onClick={() => setShowAddExpense(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  支出を追加
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div key={expense._id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold">{expense.description}</h3>
                          <Badge className="bg-blue-100 text-blue-800">
                            {expense.category}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            <div>{formatDate(expense.expenseDate)}</div>
                          </div>
                          
                          <div className="flex items-center">
                            {getPaymentMethodIcon(expense.paymentMethod)}
                            <span className="ml-2">{getPaymentMethodText(expense.paymentMethod)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(expense.amount)}
                        </div>
                      </div>
                    </div>
                    
                    {expense.notes && (
                      <div className="mt-2 text-sm text-gray-500 border-t pt-2">
                        {expense.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 新規売上追加フォーム */}
      {showAddSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">新規売上追加</h2>
            <form onSubmit={handleSaleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">顧客</label>
                <select
                  value={saleForm.customer}
                  onChange={(e) => setSaleForm({...saleForm, customer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">顧客を選択してください</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} {customer.company && `(${customer.company})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">商品名</label>
                <Input
                  value={saleForm.productName}
                  onChange={(e) => setSaleForm({...saleForm, productName: e.target.value})}
                  placeholder="商品名を入力"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">説明</label>
                <Input
                  value={saleForm.description}
                  onChange={(e) => setSaleForm({...saleForm, description: e.target.value})}
                  placeholder="商品の説明"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">数量</label>
                  <Input
                    type="number"
                    value={saleForm.quantity}
                    onChange={(e) => {
                      setSaleForm({...saleForm, quantity: e.target.value})
                      // 数量が変更されたら金額を自動計算
                      if (saleForm.unitPrice) {
                        const amount = parseFloat(e.target.value) * parseFloat(saleForm.unitPrice)
                        setSaleForm(prev => ({...prev, quantity: e.target.value, amount: amount.toString()}))
                      }
                    }}
                    placeholder="数量"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">単価</label>
                  <Input
                    type="number"
                    value={saleForm.unitPrice}
                    onChange={(e) => {
                      setSaleForm({...saleForm, unitPrice: e.target.value})
                      // 単価が変更されたら金額を自動計算
                      if (saleForm.quantity) {
                        const amount = parseFloat(saleForm.quantity) * parseFloat(e.target.value)
                        setSaleForm(prev => ({...prev, unitPrice: e.target.value, amount: amount.toString()}))
                      }
                    }}
                    placeholder="単価"
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">合計金額</label>
                <Input
                  type="number"
                  value={saleForm.amount}
                  onChange={(e) => setSaleForm({...saleForm, amount: e.target.value})}
                  placeholder="合計金額"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">支払い方法</label>
                <select
                  value={saleForm.paymentMethod}
                  onChange={(e) => setSaleForm({...saleForm, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="cash">現金</option>
                  <option value="credit_card">クレジットカード</option>
                  <option value="bank_transfer">銀行振込</option>
                  <option value="paypal">PayPal</option>
                  <option value="other">その他</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">備考</label>
                <Input
                  value={saleForm.notes}
                  onChange={(e) => setSaleForm({...saleForm, notes: e.target.value})}
                  placeholder="備考（任意）"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddSale(false)}>
                  キャンセル
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  追加
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 新規支出追加フォーム */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">新規支出追加</h2>
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">説明</label>
                <Input
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                  placeholder="支出の説明を入力"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">金額</label>
                <Input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                  placeholder="金額を入力"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">カテゴリ</label>
                <Input
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                  placeholder="カテゴリを入力"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">支払い方法</label>
                <select
                  value={expenseForm.paymentMethod}
                  onChange={(e) => setExpenseForm({...expenseForm, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="cash">現金</option>
                  <option value="credit_card">クレジットカード</option>
                  <option value="bank_transfer">銀行振込</option>
                  <option value="other">その他</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">備考</label>
                <Input
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({...expenseForm, notes: e.target.value})}
                  placeholder="備考（任意）"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddExpense(false)}>
                  キャンセル
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  追加
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
