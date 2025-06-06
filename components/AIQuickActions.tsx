"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Bot, 
  TrendingUp,
  Users,
  Package,
  DollarSign,
  FileText,
  Zap,
  Target,
  Lightbulb
} from 'lucide-react'

interface AIQuickActionsProps {
  onActionSelect: (query: string) => void
  className?: string
}

const quickActions = [
  {
    id: 'daily-summary',
    title: '日次サマリー',
    description: '今日のビジネス概況',
    icon: TrendingUp,
    query: '今日のビジネス状況をまとめて教えてください。売上、顧客、在庫の状況を含めてください。',
    color: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  {
    id: 'customer-insights',
    title: '顧客分析',
    description: '顧客動向と提案',
    icon: Users,
    query: '最近の顧客データを分析して、新規獲得や既存顧客の傾向について教えてください。',
    color: 'bg-green-50 border-green-200 text-green-700'
  },
  {
    id: 'inventory-alert',
    title: '在庫アラート',
    description: '在庫状況と補充提案',
    icon: Package,
    query: '在庫状況を確認して、補充が必要な商品や売れ筋商品について教えてください。',
    color: 'bg-orange-50 border-orange-200 text-orange-700'
  },
  {
    id: 'financial-health',
    title: '財務健全性',
    description: '収益性と改善案',
    icon: DollarSign,
    query: '現在の財務状況を分析して、利益改善のための具体的な提案をしてください。',
    color: 'bg-purple-50 border-purple-200 text-purple-700'
  },
  {
    id: 'growth-strategy',
    title: '成長戦略',
    description: '売上拡大のアイデア',
    icon: Target,
    query: 'ビジネス成長のための戦略を提案してください。売上拡大、効率化、新規開拓について教えてください。',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700'
  },
  {
    id: 'optimization',
    title: '業務最適化',
    description: 'プロセス改善提案',
    icon: Zap,
    query: '現在のビジネスプロセスを最適化するための提案をしてください。コスト削減や効率化について教えてください。',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700'
  }
]

export default function AIQuickActions({ onActionSelect, className = "" }: AIQuickActionsProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  const handleActionClick = (action: typeof quickActions[0]) => {
    setSelectedAction(action.id)
    onActionSelect(action.query)
    
    // アニメーション効果のためにリセット
    setTimeout(() => setSelectedAction(null), 1000)
  }

  return (
    <Card className={`${className} border-gray-200`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-800">
          <Bot className="h-5 w-5 text-blue-600" />
          <span>AI クイックアクション</span>
          <Lightbulb className="h-4 w-4 text-yellow-500" />
        </CardTitle>
        <p className="text-sm text-gray-600">
          よく使用される分析を1クリックで実行
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            const isSelected = selectedAction === action.id
            
            return (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => handleActionClick(action)}
                disabled={isSelected}
                className={`h-auto p-4 text-left justify-start flex-col items-start space-y-2 transition-all duration-200 ${
                  action.color
                } ${
                  isSelected 
                    ? 'scale-95 opacity-70' 
                    : 'hover:scale-105 hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-2 w-full">
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium text-sm">{action.title}</span>
                </div>
                <p className="text-xs opacity-80 text-left w-full">
                  {action.description}
                </p>
                {isSelected && (
                  <div className="flex items-center space-x-1 text-xs">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                    <span>分析中...</span>
                  </div>
                )}
              </Button>
            )
          })}
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>各アクションは現在のビジネスデータを自動取得して分析します</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
