"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Users, Mail, Phone, Building } from 'lucide-react'
import { Customer } from '../../types'
import { loadData, formatCurrency, formatDate } from '../../lib/utils'

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await loadData<Customer>('customers.json')
        setCustomers(data)
      } catch (error) {
        console.error('顧客データ読み込みエラー:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">顧客管理</h1>
          <p className="text-gray-600 mt-2">顧客情報の管理と表示</p>
        </div>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          新規顧客追加
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総顧客数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総支出額</CardTitle>
            <Badge className="bg-green-100 text-green-800">
              {formatCurrency(customers.reduce((sum, customer) => sum + customer.totalSpent, 0))}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(customer => customer.totalSpent > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">購入済み顧客</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均支出額</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                customers.length > 0
                  ? customers.reduce((sum, customer) => sum + customer.totalSpent, 0) / customers.length
                  : 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle>顧客一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      {customer.totalSpent > 0 && (
                        <Badge variant="secondary">
                          {formatCurrency(customer.totalSpent)}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {customer.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.company && (
                        <div className="flex items-center space-x-1">
                          <Building className="h-4 w-4" />
                          <span>{customer.company}</span>
                        </div>
                      )}
                    </div>
                    
                    {customer.address && (
                      <p className="text-sm text-gray-600">{customer.address}</p>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      登録日: {formatDate(customer.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      編集
                    </Button>
                    <Button variant="outline" size="sm">
                      詳細
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {customers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              顧客データがありません
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}