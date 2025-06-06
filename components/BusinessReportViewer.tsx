"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface BusinessReport {
  title: string
  summary: string
  sections: ReportSection[]
  recommendations: string[]
  metrics: ReportMetric[]
  generatedAt: Date
}

interface ReportSection {
  title: string
  content: string
  insights: string[]
}

interface ReportMetric {
  name: string
  value: number | string
  change?: number
  trend: 'up' | 'down' | 'stable'
  importance: 'high' | 'medium' | 'low'
}

interface BusinessReportViewerProps {
  className?: string
}

export default function BusinessReportViewer({ className = "" }: BusinessReportViewerProps) {
  const [report, setReport] = useState<BusinessReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateReport = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/business-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportType: 'comprehensive' })
      })

      if (!response.ok) {
        throw new Error('レポート生成に失敗しました')
      }

      const result = await response.json()
      
      if (result.success && result.report) {
        setReport(result.report)
      } else {
        throw new Error('レポートデータが不正です')
      }
    } catch (error) {
      console.error('Report generation error:', error)
      setError(error instanceof Error ? error.message : 'レポート生成中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
  }

  const getImportanceBadge = (importance: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      low: 'bg-green-100 text-green-800 border-green-200'
    }
    
    return (
      <Badge variant="outline" className={colors[importance as keyof typeof colors]}>
        {importance === 'high' ? '重要' : importance === 'medium' ? '中' : '低'}
      </Badge>
    )
  }

  if (!report && !loading) {
    return (
      <Card className={`${className} border-gray-200`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>ビジネスレポート</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            包括的なビジネス分析レポートを生成します
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">
              レポートを生成してビジネスの状況を詳しく分析しましょう
            </p>
            <Button onClick={generateReport} className="bg-blue-600 hover:bg-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              レポート生成
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className={`${className} border-gray-200`}>
        <CardContent className="py-16">
          <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
            <p className="text-gray-600">レポートを生成中...</p>
            <p className="text-sm text-gray-500 mt-2">
              ビジネスデータを分析しています
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} border-gray-200`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>{report?.title}</span>
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              生成日時: {report?.generatedAt ? new Date(report.generatedAt).toLocaleString('ja-JP') : ''}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generateReport}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              更新
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              ダウンロード
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* サマリー */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">エグゼクティブサマリー</h3>
          <p className="text-blue-800 text-sm">{report?.summary}</p>
        </div>

        {/* 主要メトリクス */}
        {report?.metrics && report.metrics.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">主要指標</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.metrics.map((metric, index) => (
                <div key={index} className="bg-white border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-600">{metric.name}</span>
                    {getImportanceBadge(metric.importance)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold">{metric.value}</span>
                    {getTrendIcon(metric.trend)}
                    {metric.change !== undefined && (
                      <span className={`text-sm ${
                        metric.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* レポートセクション */}
        {report?.sections && report.sections.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">詳細分析</h3>
            <div className="space-y-4">
              {report.sections.map((section, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">{section.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{section.content}</p>
                  {section.insights && section.insights.length > 0 && (
                    <div className="space-y-1">
                      {section.insights.map((insight, insightIndex) => (
                        <div key={insightIndex} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{insight}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 推奨事項 */}
        {report?.recommendations && report.recommendations.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">改善提案</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="space-y-2">
                {report.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-yellow-800">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
