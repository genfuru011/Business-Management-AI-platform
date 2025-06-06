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
  Mail, 
  Phone,
  Building,
  MapPin
} from 'lucide-react'

interface Customer {
  _id: string
  name: string
  email: string
  phone?: string
  company?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  // 新規顧客フォームの状態
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (!response.ok) {
        throw new Error('顧客データの取得に失敗しました')
      }
      const data = await response.json()
      setCustomers(data.customers || [])
    } catch (error) {
      console.error('顧客データの取得に失敗しました:', error)
      // フォールバック：デモデータを使用
      const demoCustomers: Customer[] = [
        {
          _id: '1',
          name: '田中太郎',
          email: 'tanaka@example.com',
          phone: '090-1234-5678',
          company: '株式会社ABC',
          address: {
            street: '新宿区西新宿1-1-1',
            city: '東京都',
            zipCode: '160-0023',
            country: 'Japan'
          },
          createdAt: '2025-06-01',
          updatedAt: '2025-06-01'
        },
        {
          _id: '2',
          name: '鈴木花子',
          email: 'suzuki@example.com',
          phone: '080-9876-5432',
          company: '有限会社XYZ',
          address: {
            street: '渋谷区渋谷2-2-2',
            city: '東京都',
            zipCode: '150-0002',
            country: 'Japan'
          },
          createdAt: '2025-06-02',
          updatedAt: '2025-06-02'
        }
      ]
      setCustomers(demoCustomers)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const customerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: 'Japan'
        },
        notes: formData.notes
      }

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData)
      })

      if (!response.ok) {
        throw new Error('顧客の作成に失敗しました')
      }

      // フォームリセット
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        notes: ''
      })
      setShowAddForm(false)
      
      // 顧客リスト更新
      await fetchCustomers()
    } catch (error) {
      console.error('顧客の作成に失敗しました:', error)
      alert('顧客の作成に失敗しました。もう一度お試しください。')
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <h1 className="text-3xl font-bold mb-8 bg-gray-200 h-8 w-48 rounded"></h1>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            顧客管理
          </h1>
          <p className="text-gray-600">
            顧客情報の管理と編集
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>新規顧客追加</span>
        </Button>
      </div>

      {/* 検索バー */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="顧客名、メール、会社名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 新規顧客追加フォーム */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>新規顧客追加</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">名前 *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">メールアドレス *</label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">電話番号</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">会社名</label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">住所</label>
                <Input
                  placeholder="〒000-0000 都道府県市区町村番地"
                  value={formData.street}
                  onChange={(e) => setFormData({...formData, street: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">メモ</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 flex space-x-2">
                <Button type="submit">追加</Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 顧客リスト */}
      <div className="space-y-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer._id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{customer.name}</h3>
                    {customer.company && (
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <Building size={12} />
                        <span>{customer.company}</span>
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail size={16} />
                      <span>{customer.email}</span>
                    </div>
                    {customer.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone size={16} />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    {customer.address?.street && (
                      <div className="flex items-start space-x-2 md:col-span-2">
                        <MapPin size={16} className="mt-0.5" />
                        <span>
                          {customer.address.street}
                          {customer.address.city && `, ${customer.address.city}`}
                          {customer.address.zipCode && ` ${customer.address.zipCode}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingCustomer(customer)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">顧客が見つかりませんでした。</p>
        </div>
      )}
    </div>
  )
}
