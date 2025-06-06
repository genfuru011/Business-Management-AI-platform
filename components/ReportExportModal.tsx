"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ReportExporter } from '@/lib/report-exporter'
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  FileImage, 
  Eye,
  X,
  Loader2
} from 'lucide-react'

interface ReportExportModalProps {
  isOpen: boolean
  onCloseAction: () => void
  reportData?: any
}

export default function ReportExportModal({ isOpen, onCloseAction, reportData }: ReportExportModalProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'pdf' | 'excel' | 'csv'>('pdf')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  if (!isOpen) return null

  const handleExport = async (type: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true)
    setExportType(type)
    
    try {
      const sampleReport = reportData || {
        title: 'ビジネス分析レポート',
        generatedAt: new Date().toISOString(),
        period: '2024年6月',
        metrics: {
          totalRevenue: 2500000,
          totalExpenses: 1800000,
          netProfit: 700000,
          profitMargin: 28.0,
          customerCount: 45,
          averageOrderValue: 55556
        },
        sections: [
          {
            title: '売上分析',
            content: '今月の売上は前月比15%増となり、順調な成長を見せています。特に新規顧客の獲得が好調で、マーケティング施策の効果が現れています。',
            insights: [
              '新規顧客数が前月比30%増',
              'リピート購入率が25%向上',
              'オンライン売上の比率が60%に増加'
            ]
          },
          {
            title: '顧客分析',
            content: '顧客満足度の向上により、リピート率が大幅に改善されています。カスタマーサポートの強化が功を奏しています。',
            insights: [
              '顧客満足度スコア4.2/5.0',
              '平均購入頻度が月2.3回に増加',
              'カスタマーサポート応答時間50%短縮'
            ]
          }
        ],
        recommendations: [
          'マーケティング予算の増額を検討',
          '在庫管理システムの最適化',
          '顧客ロイヤルティプログラムの導入',
          'ECサイトのユーザビリティ改善'
        ],
        charts: []
      }

      let blob: Blob
      let filename: string
      
      switch (type) {
        case 'pdf':
          blob = await ReportExporter.exportToPDFBlob(sampleReport)
          filename = `business-report-${new Date().toISOString().split('T')[0]}.pdf`
          break
        case 'excel':
          blob = await ReportExporter.exportToExcelBlob(sampleReport)
          filename = `business-report-${new Date().toISOString().split('T')[0]}.xlsx`
          break
        case 'csv':
          blob = await ReportExporter.exportToCSVBlob([sampleReport])
          filename = `business-report-${new Date().toISOString().split('T')[0]}.csv`
          break
      }

      // ダウンロード
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      // PDFの場合はプレビューも表示
      if (type === 'pdf') {
        const previewUrl = window.URL.createObjectURL(blob)
        setPreviewUrl(previewUrl)
      }

    } catch (error) {
      console.error('レポート出力エラー:', error)
      alert('レポートの出力に失敗しました')
    } finally {
      setIsExporting(false)
    }
  }

  const handlePreview = async () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    } else {
      await handleExport('pdf')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>レポート出力</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCloseAction}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">出力形式を選択</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
              >
                {isExporting && exportType === 'pdf' ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <FileText className="h-6 w-6 text-red-600" />
                )}
                <span className="text-sm">PDF</span>
                <Badge variant="secondary" className="text-xs">推奨</Badge>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => handleExport('excel')}
                disabled={isExporting}
              >
                {isExporting && exportType === 'excel' ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-6 w-6 text-green-600" />
                )}
                <span className="text-sm">Excel</span>
                <Badge variant="outline" className="text-xs">データ分析用</Badge>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => handleExport('csv')}
                disabled={isExporting}
              >
                {isExporting && exportType === 'csv' ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <FileImage className="h-6 w-6 text-blue-600" />
                )}
                <span className="text-sm">CSV</span>
                <Badge variant="outline" className="text-xs">データ処理用</Badge>
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-3">プレビュー機能</h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={isExporting}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                PDFプレビュー
              </Button>
              {previewUrl && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const a = document.createElement('a')
                    a.href = previewUrl
                    a.download = `business-report-${new Date().toISOString().split('T')[0]}.pdf`
                    a.click()
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  ダウンロード
                </Button>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">📋 レポート内容</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• ビジネス分析の概要</li>
              <li>• 売上・収支の詳細データ</li>
              <li>• 顧客分析とトレンド</li>
              <li>• AI分析による洞察</li>
              <li>• 改善提案と推奨事項</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCloseAction}>
              キャンセル
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
