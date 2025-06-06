"use client"

import { useState, useEffect } from 'react'

interface Product {
  _id: string
  name: string
  description?: string
  sku: string
  price: number
  cost?: number
  stock: number
  category?: string
  unit: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  // 新規商品フォームの状態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    cost: '',
    stock: '',
    category: '',
    unit: '個'
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('商品データの取得に失敗しました')
      }
      const result = await response.json()
      setProducts(result.data || [])
    } catch (error) {
      console.error('商品データの取得に失敗しました:', error)
      // フォールバック：デモデータを使用
      const demoProducts: Product[] = [
        {
          _id: '1',
          name: 'ノートパソコン Dell XPS 13',
          description: '高性能なノートパソコン、13インチ、Intel Core i7',
          sku: 'LAPTOP-DELL-XPS13-001',
          price: 150000,
          cost: 120000,
          stock: 5,
          category: 'コンピューター',
          unit: '台',
          isActive: true,
          createdAt: '2025-06-01',
          updatedAt: '2025-06-01'
        },
        {
          _id: '2',
          name: 'ワイヤレスマウス',
          description: 'Logicool ワイヤレスマウス MX Master 3',
          sku: 'MOUSE-LOG-MXMASTER3-001',
          price: 12000,
          cost: 8000,
          stock: 2,
          category: '周辺機器',
          unit: '個',
          isActive: true,
          createdAt: '2025-06-02',
          updatedAt: '2025-06-02'
        }
      ]
      setProducts(demoProducts)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        sku: formData.sku,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        stock: parseInt(formData.stock),
        category: formData.category,
        unit: formData.unit
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '商品の作成に失敗しました')
      }

      // フォームリセット
      setFormData({
        name: '',
        description: '',
        sku: '',
        price: '',
        cost: '',
        stock: '',
        category: '',
        unit: '個'
      })
      setShowAddForm(false)
      
      // 商品リスト更新
      await fetchProducts()
    } catch (error: any) {
      console.error('商品の作成に失敗しました:', error)
      alert(error.message || '商品の作成に失敗しました。もう一度お試しください。')
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
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
            商品管理
          </h1>
          <p className="text-gray-600">
            在庫と商品情報の管理
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          新規商品追加
        </button>
      </div>

      {/* 検索バー */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="商品名、SKUで検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 新規商品追加フォーム */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">新規商品追加</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品名 *
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="商品名を入力"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU *
                </label>
                <input
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  placeholder="SKUを入力"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  価格 *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="価格を入力"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  在庫数 *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  placeholder="在庫数を入力"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button 
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                商品を追加
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 商品一覧 */}
      <div className="grid gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                
                {product.description && (
                  <p className="text-gray-600 mb-3">{product.description}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">SKU:</span>
                    <span className="ml-2 font-medium">{product.sku}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">価格:</span>
                    <span className="ml-2 font-medium">¥{product.price.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">在庫:</span>
                    <span className="ml-2 font-medium">{product.stock} {product.unit}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">カテゴリ:</span>
                    <span className="ml-2 font-medium">{product.category || 'なし'}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                  編集
                </button>
                <button className="px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50">
                  削除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">商品が見つかりません</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? '検索条件を変更してください' 
              : '新しい商品を追加してください'}
          </p>
        </div>
      )}
    </div>
  )
}
