"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  RefreshCw,
  Zap,
  Bell,
  Target
} from 'lucide-react'

interface RealTimeMetric {
  id: string
  name: string
  value: string | number
  change: number
  status: 'up' | 'down' | 'neutral' | 'alert'
  lastUpdated: Date
}

interface RealTimeAlert {
  id: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  timestamp: Date
}

export default function RealTimeBusinessMonitor() {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([])
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // シミュレートされたリアルタイムデータ更新
  useEffect(() => {
    const updateData = () => {
      const newMetrics: RealTimeMetric[] = [
        {
          id: 'revenue',
          name: '今日の売上',
          value: `¥${(Math.random() * 500000 + 100000).toFixed(0)}`,
          change: (Math.random() - 0.5) * 20,
          status: Math.random() > 0.5 ? 'up' : 'down',
          lastUpdated: new Date()
        },
        {
          id: 'customers',
          name: 'アクティブ顧客',
          value: Math.floor(Math.random() * 100 + 50),
          change: (Math.random() - 0.5) * 10,
          status: Math.random() > 0.3 ? 'up' : 'down',
          lastUpdated: new Date()
        },
        {
          id: 'orders',
          name: '新規注文',
          value: Math.floor(Math.random() * 20 + 5),
          change: (Math.random() - 0.5) * 15,
          status: Math.random() > 0.4 ? 'up' : 'down',
          lastUpdated: new Date()
        },
        {
          id: 'inventory',
          name: '在庫アラート',
          value: Math.floor(Math.random() * 10 + 2),
          change: (Math.random() - 0.5) * 5,
          status: Math.random() > 0.7 ? 'alert' : 'neutral',
          lastUpdated: new Date()
        }
      ]

      setMetrics(newMetrics)
      setLastUpdate(new Date())

      // ランダムにアラートを生成
      if (Math.random() > 0.8) {
        const alertMessages = [
          '新規注文が20%増加しました',
          '在庫不足の商品があります',
          '売上目標を達成しました',
          '顧客からの問い合わせが増加中',
          'システム応答時間が改善されました'
        ]
        
        const newAlert: RealTimeAlert = {
          id: Date.now().toString(),
          message: alertMessages[Math.floor(Math.random() * alertMessages.length)],
          type: ['info', 'warning', 'success', 'error'][Math.floor(Math.random() * 4)] as any,
          timestamp: new Date()
        }

        setAlerts(prev => [newAlert, ...prev.slice(0, 4)])
      }
    }

    setIsConnected(true)
    updateData()

    const interval = setInterval(updateData, 5000) // 5秒毎に更新

    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Target className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      case 'alert':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive'
      case 'warning':
        return 'secondary'
      case 'success':
        return 'default'
      default:
        return 'outline'
    }
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-purple-800">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>リアルタイム監視</span>
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <>
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600">オンライン</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 bg-red-500 rounded-full" />
                  <span className="text-xs text-red-600">オフライン</span>
                </>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* リアルタイムメトリクス */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="bg-white rounded-lg p-3 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">{metric.name}</span>
                {getStatusIcon(metric.status)}
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {metric.value}
              </div>
              <div className={`text-xs ${getStatusColor(metric.status)}`}>
                {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>

        {/* リアルタイムアラート */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-purple-600" />
              <h4 className="text-sm font-medium text-purple-800">最新アラート</h4>
            </div>
            <div className="space-y-1">
              {alerts.slice(0, 3).map((alert) => (
                <Badge
                  key={alert.id}
                  variant={getAlertVariant(alert.type) as any}
                  className="w-full justify-start text-xs py-1"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {alert.message}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 最終更新時間 */}
        <div className="text-xs text-gray-500 text-center">
          最終更新: {lastUpdate.toLocaleTimeString('ja-JP')}
        </div>
      </CardContent>
    </Card>
  )
}
