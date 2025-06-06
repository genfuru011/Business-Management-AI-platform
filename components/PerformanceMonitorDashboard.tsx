"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { performanceMonitor, PerformanceMetric, SystemLoad } from '@/lib/performance-monitor'
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Database,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings
} from 'lucide-react'

export default function PerformanceMonitorDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [systemLoad, setSystemLoad] = useState<SystemLoad | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string[]>([])
  const [performanceReport, setPerformanceReport] = useState<any>(null)

  // 監視開始/停止
  const toggleMonitoring = () => {
    if (isMonitoring) {
      setIsMonitoring(false)
    } else {
      setIsMonitoring(true)
      const stopMonitoring = performanceMonitor.startRealTimeMonitoring((newMetrics) => {
        setMetrics(newMetrics)
      }, 3000)

      // クリーンアップ関数を保存（実際のアプリでは useRef を使用）
      setTimeout(() => {
        if (!isMonitoring) {
          stopMonitoring()
        }
      }, 30000) // 30秒後に自動停止
    }
  }

  // システム負荷とメトリクスの更新
  useEffect(() => {
    const updateSystemLoad = async () => {
      const load = await performanceMonitor.simulateSystemLoad()
      setSystemLoad(load)
      
      const suggestions = performanceMonitor.generateOptimizationSuggestions(load)
      setOptimizationSuggestions(suggestions)
      
      const report = performanceMonitor.generatePerformanceReport()
      setPerformanceReport(report)
    }

    updateSystemLoad()
    const interval = setInterval(updateSystemLoad, 5000)

    return () => clearInterval(interval)
  }, [])

  // ステータスに応じたアイコンとカラー
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  // メトリクスアイコン
  const getMetricIcon = (name: string) => {
    if (name.includes('CPU')) return <Cpu className="h-4 w-4" />
    if (name.includes('メモリ')) return <HardDrive className="h-4 w-4" />
    if (name.includes('ディスク')) return <HardDrive className="h-4 w-4" />
    if (name.includes('ネットワーク')) return <Wifi className="h-4 w-4" />
    if (name.includes('DB')) return <Database className="h-4 w-4" />
    if (name.includes('API')) return <Zap className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* 監視制御 */}
      <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-indigo-800">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>パフォーマンス監視</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={isMonitoring ? "destructive" : "default"}
                size="sm"
                onClick={toggleMonitoring}
                className="flex items-center space-x-1"
              >
                <RefreshCw className={`h-4 w-4 ${isMonitoring ? 'animate-spin' : ''}`} />
                <span>{isMonitoring ? '監視停止' : '監視開始'}</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {metrics.length}
              </div>
              <div className="text-xs text-gray-600">記録メトリクス</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.filter(m => m.status === 'good').length}
              </div>
              <div className="text-xs text-gray-600">正常</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {metrics.filter(m => m.status === 'warning').length}
              </div>
              <div className="text-xs text-gray-600">警告</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {metrics.filter(m => m.status === 'critical').length}
              </div>
              <div className="text-xs text-gray-600">重要</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* システム負荷概要 */}
      {systemLoad && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>システム負荷</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">CPU</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{systemLoad.cpu.toFixed(1)}%</div>
                  <div className={`text-xs ${systemLoad.cpu > 80 ? 'text-red-600' : systemLoad.cpu > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {systemLoad.cpu > 80 ? '高負荷' : systemLoad.cpu > 60 ? '中負荷' : '正常'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4 text-green-600" />
                  <span className="text-sm">メモリ</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{systemLoad.memory.toFixed(1)}%</div>
                  <div className={`text-xs ${systemLoad.memory > 85 ? 'text-red-600' : systemLoad.memory > 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {systemLoad.memory > 85 ? '高使用' : systemLoad.memory > 70 ? '中使用' : '正常'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">API応答</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{systemLoad.apiResponseTime.toFixed(0)}ms</div>
                  <div className={`text-xs ${systemLoad.apiResponseTime > 500 ? 'text-red-600' : systemLoad.apiResponseTime > 300 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {systemLoad.apiResponseTime > 500 ? '遅い' : systemLoad.apiResponseTime > 300 ? '普通' : '高速'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">DB接続</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{systemLoad.databaseConnections}</div>
                  <div className={`text-xs ${systemLoad.databaseConnections > 40 ? 'text-red-600' : systemLoad.databaseConnections > 25 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {systemLoad.databaseConnections > 40 ? '多い' : systemLoad.databaseConnections > 25 ? '普通' : '少ない'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm">遅延</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{systemLoad.networkLatency.toFixed(0)}ms</div>
                  <div className={`text-xs ${systemLoad.networkLatency > 100 ? 'text-red-600' : systemLoad.networkLatency > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {systemLoad.networkLatency > 100 ? '遅い' : systemLoad.networkLatency > 50 ? '普通' : '高速'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">ディスク</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{systemLoad.diskUsage.toFixed(1)}%</div>
                  <div className={`text-xs ${systemLoad.diskUsage > 90 ? 'text-red-600' : systemLoad.diskUsage > 75 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {systemLoad.diskUsage > 90 ? '満杯近い' : systemLoad.diskUsage > 75 ? '使用中' : '余裕'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 最適化提案 */}
      {optimizationSuggestions.length > 0 && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <TrendingUp className="h-5 w-5" />
              <span>最適化提案</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {optimizationSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 bg-white rounded border"
                >
                  <div className="text-sm flex-1">{suggestion}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* リアルタイムメトリクス */}
      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>リアルタイムメトリクス</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.slice(-6).map((metric) => (
                <div
                  key={metric.id}
                  className={`p-3 rounded-lg border ${getStatusColor(metric.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getMetricIcon(metric.name)}
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                    {getStatusIcon(metric.status)}
                  </div>
                  <div className="text-lg font-bold">
                    {metric.value.toFixed(1)} {metric.unit}
                  </div>
                  <div className="text-xs opacity-75">
                    {metric.timestamp.toLocaleTimeString('ja-JP')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* パフォーマンスレポート */}
      {performanceReport && (
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span>パフォーマンスレポート</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-700">
                {performanceReport.summary}
              </div>
              
              {performanceReport.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">推奨事項:</h4>
                  <div className="space-y-1">
                    {performanceReport.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                        <span>•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
