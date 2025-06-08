"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '../lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  DollarSign 
} from 'lucide-react'

const navigation = [
  {
    name: 'ダッシュボード',
    href: '/',
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
  }
]

export default function Navigation() {
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
    </nav>
  )
}