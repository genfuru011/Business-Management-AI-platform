"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  DollarSign, 
  MessageSquare,
  BarChart3,
  Bot,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard },
  { name: '顧客管理', href: '/customers', icon: Users },
  { name: '在庫管理', href: '/products', icon: Package },
  { name: '請求書', href: '/invoices', icon: FileText },
  { name: '売上・収支', href: '/finances', icon: DollarSign },
  { name: 'レポート', href: '/reports', icon: BarChart3 },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">
          Business Management
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          AI統合プラットフォーム
        </p>
        <div className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs text-center">
          🧠 フル機能版
        </div>
        
        {/* AIエージェント機能強調 */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
          <div className="flex items-center space-x-2">
            <Bot className="h-4 w-4 text-white" />
            <Sparkles className="h-3 w-3 text-yellow-300" />
            <span className="text-sm font-medium text-white">AI Copilot</span>
          </div>
          <p className="text-xs text-blue-100 mt-1">
            ビジネス統合支援
          </p>
        </div>
      </div>
      
      <ul className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
