// システムパフォーマンス監視と最適化ツール
export interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'good' | 'warning' | 'critical'
  threshold: {
    warning: number
    critical: number
  }
  timestamp: Date
}

export interface SystemLoad {
  cpu: number
  memory: number
  diskUsage: number
  networkLatency: number
  databaseConnections: number
  apiResponseTime: number
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private readonly MAX_METRICS = 100

  // パフォーマンスメトリクスを記録
  recordMetric(name: string, value: number, unit: string, thresholds: { warning: number; critical: number }) {
    const status = this.determineStatus(value, thresholds)
    
    const metric: PerformanceMetric = {
      id: Date.now().toString(),
      name,
      value,
      unit,
      status,
      threshold: thresholds,
      timestamp: new Date()
    }

    this.metrics.push(metric)
    
    // 古いメトリクスを削除
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS)
    }

    return metric
  }

  // ステータス判定
  private determineStatus(value: number, thresholds: { warning: number; critical: number }): 'good' | 'warning' | 'critical' {
    if (value >= thresholds.critical) {
      return 'critical'
    }
    if (value >= thresholds.warning) {
      return 'warning'
    }
    return 'good'
  }

  // システム負荷をシミュレート
  async simulateSystemLoad(): Promise<SystemLoad> {
    // 実際の環境では、実際のシステムメトリクスを取得
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      diskUsage: Math.random() * 100,
      networkLatency: Math.random() * 200 + 10,
      databaseConnections: Math.floor(Math.random() * 50),
      apiResponseTime: Math.random() * 1000 + 100
    }
  }

  // APIレスポンス時間を測定
  async measureApiResponseTime(apiUrl: string): Promise<number> {
    const startTime = performance.now()
    
    try {
      await fetch(apiUrl)
      const endTime = performance.now()
      return endTime - startTime
    } catch (error) {
      console.error('API測定エラー:', error)
      return -1
    }
  }

  // データベース接続数をチェック
  async checkDatabaseConnections(): Promise<number> {
    try {
      const response = await fetch('/api/system/db-status')
      const data = await response.json()
      return data.connections || 0
    } catch (error) {
      console.error('DB接続チェックエラー:', error)
      return -1
    }
  }

  // パフォーマンス分析レポート生成
  generatePerformanceReport(): {
    summary: string
    criticalIssues: PerformanceMetric[]
    warnings: PerformanceMetric[]
    recommendations: string[]
  } {
    const criticalIssues = this.metrics.filter(m => m.status === 'critical')
    const warnings = this.metrics.filter(m => m.status === 'warning')
    
    const recommendations: string[] = []
    
    if (criticalIssues.length > 0) {
      recommendations.push('🔴 緊急対応が必要な問題があります')
    }
    
    if (warnings.length > 0) {
      recommendations.push('⚠️ 予防的なメンテナンスを検討してください')
    }

    // CPU使用率の分析
    const cpuMetrics = this.metrics.filter(m => m.name.includes('CPU'))
    if (cpuMetrics.some(m => m.value > 80)) {
      recommendations.push('CPU使用率が高いため、プロセス最適化を検討してください')
    }

    // メモリ使用率の分析
    const memoryMetrics = this.metrics.filter(m => m.name.includes('Memory'))
    if (memoryMetrics.some(m => m.value > 85)) {
      recommendations.push('メモリ使用率が高いため、メモリリークの確認を行ってください')
    }

    return {
      summary: `パフォーマンス概要: ${criticalIssues.length}件の重要な問題、${warnings.length}件の警告`,
      criticalIssues,
      warnings,
      recommendations
    }
  }

  // 最適化提案の生成
  generateOptimizationSuggestions(systemLoad: SystemLoad): string[] {
    const suggestions: string[] = []

    if (systemLoad.cpu > 80) {
      suggestions.push('🔧 CPUキャッシュの最適化を実装してください')
      suggestions.push('⚡ 非同期処理の見直しを行ってください')
    }

    if (systemLoad.memory > 85) {
      suggestions.push('🧹 不要なデータのガベージコレクションを実行してください')
      suggestions.push('💾 メモリ効率的なデータ構造の使用を検討してください')
    }

    if (systemLoad.apiResponseTime > 500) {
      suggestions.push('🚀 APIレスポンスの最適化（キャッシュ、圧縮）を実装してください')
      suggestions.push('📊 データベースクエリの最適化を行ってください')
    }

    if (systemLoad.databaseConnections > 40) {
      suggestions.push('🔗 データベース接続プールの最適化を検討してください')
      suggestions.push('📋 不要な接続の自動切断機能を実装してください')
    }

    if (suggestions.length === 0) {
      suggestions.push('✅ システムは最適な状態で動作しています')
    }

    return suggestions
  }

  // リアルタイム監視の開始
  startRealTimeMonitoring(callback: (metrics: PerformanceMetric[]) => void, intervalMs: number = 5000) {
    const interval = setInterval(async () => {
      const systemLoad = await this.simulateSystemLoad()
      
      // 各メトリクスを記録
      this.recordMetric('CPU使用率', systemLoad.cpu, '%', { warning: 70, critical: 85 })
      this.recordMetric('メモリ使用率', systemLoad.memory, '%', { warning: 75, critical: 90 })
      this.recordMetric('ディスク使用率', systemLoad.diskUsage, '%', { warning: 80, critical: 95 })
      this.recordMetric('ネットワーク遅延', systemLoad.networkLatency, 'ms', { warning: 100, critical: 200 })
      this.recordMetric('DB接続数', systemLoad.databaseConnections, '個', { warning: 30, critical: 45 })
      this.recordMetric('API応答時間', systemLoad.apiResponseTime, 'ms', { warning: 500, critical: 1000 })

      callback(this.getRecentMetrics(10))
    }, intervalMs)

    return () => clearInterval(interval)
  }

  // 最新のメトリクスを取得
  getRecentMetrics(count: number = 10): PerformanceMetric[] {
    return this.metrics.slice(-count)
  }

  // メトリクスの統計情報を取得
  getMetricsStats(metricName: string): {
    average: number
    min: number
    max: number
    trend: 'increasing' | 'decreasing' | 'stable'
  } {
    const relevantMetrics = this.metrics
      .filter(m => m.name === metricName)
      .slice(-10) // 最新10件

    if (relevantMetrics.length === 0) {
      return { average: 0, min: 0, max: 0, trend: 'stable' }
    }

    const values = relevantMetrics.map(m => m.value)
    const average = values.reduce((sum, val) => sum + val, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    // トレンド分析（簡易版）
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (values.length >= 3) {
      const recent = values.slice(-3)
      const older = values.slice(0, Math.max(1, values.length - 3))
      const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length
      const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length

      if (recentAvg > olderAvg * 1.1) {
        trend = 'increasing'
      } else if (recentAvg < olderAvg * 0.9) {
        trend = 'decreasing'
      }
    }

    return { average, min, max, trend }
  }
}

// シングルトンインスタンス
export const performanceMonitor = new PerformanceMonitor()
