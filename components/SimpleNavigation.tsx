"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  DollarSign,
  BarChart3
} from 'lucide-react'

const navigation = [
  {
    name: 'ダッシュボード',
    href: '/simple-dashboard',
    icon: LayoutDashboard
  },
  {
    name: '顧客管理',
    href: '/customers',
    icon: Users
  },
  {
    name: '商品管理',
    href: '/products',
    icon: Package
  },
  {
    name: '請求書',
    href: '/invoices',
    icon: FileText
  },
  {
    name: '財務',
    href: '/finances',
    icon: DollarSign
  },
  {
    name: 'レポート',
    href: '/reports',
    icon: BarChart3
  }
]

export default function SimpleNavigation() {
  const pathname = usePathname()

  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">
          ビジネス管理
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          シンプル版
        </p>
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <p className="text-xs text-green-700">
            🚫 AI機能なし
          </p>
        </div>
      </div>
      
      <div className="px-3">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-xs text-gray-600">
            📋 シンプル版機能:
          </p>
          <ul className="text-xs text-gray-500 mt-1 space-y-1">
            <li>• 基本的なデータ管理</li>
            <li>• 統計表示</li>
            <li>• レポート出力</li>
          </ul>
        </div>
      </div>
    </nav>
  )
}