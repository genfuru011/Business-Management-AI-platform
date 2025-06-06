import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import { BusinessReport } from './business-report'

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv'
  includeCharts?: boolean
  includeRawData?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

export class ReportExporter {
  // PDFエクスポート（Blob返却版）
  static async exportToPDFBlob(report: BusinessReport): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let yPosition = 20

    // フォント設定（日本語対応）
    pdf.setFont('helvetica', 'normal')

    // タイトル
    pdf.setFontSize(20)
    pdf.text(report.title, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // 生成日時
    pdf.setFontSize(10)
    pdf.text(`生成日時: ${new Date(report.generatedAt).toLocaleString('ja-JP')}`, 20, yPosition)
    yPosition += 10

    // サマリー
    pdf.setFontSize(14)
    pdf.text('エグゼクティブサマリー', 20, yPosition)
    yPosition += 10

    pdf.setFontSize(10)
    const summaryLines = pdf.splitTextToSize(report.summary, pageWidth - 40)
    pdf.text(summaryLines, 20, yPosition)
    yPosition += summaryLines.length * 5 + 10

    // セクション
    for (const section of report.sections) {
      // 改ページチェック
      if (yPosition > pageHeight - 40) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.setFontSize(14)
      pdf.text(section.title, 20, yPosition)
      yPosition += 10

      pdf.setFontSize(10)
      const contentLines = pdf.splitTextToSize(section.content, pageWidth - 40)
      pdf.text(contentLines, 20, yPosition)
      yPosition += contentLines.length * 5 + 5

      // インサイト
      if (section.insights && section.insights.length > 0) {
        pdf.setFontSize(12)
        pdf.text('主要なインサイト:', 25, yPosition)
        yPosition += 8

        pdf.setFontSize(10)
        section.insights.forEach((insight: string) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage()
            yPosition = 20
          }
          pdf.text(`• ${insight}`, 30, yPosition)
          yPosition += 6
        })
        yPosition += 5
      }
    }

    // 推奨事項
    if (report.recommendations && report.recommendations.length > 0) {
      if (yPosition > pageHeight - 40) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.setFontSize(14)
      pdf.text('推奨事項', 20, yPosition)
      yPosition += 10

      pdf.setFontSize(10)
      report.recommendations.forEach((rec: string, index: number) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage()
          yPosition = 20
        }
        pdf.text(`${index + 1}. ${rec}`, 25, yPosition)
        yPosition += 8
      })
    }

    // PDFをBlobとして返す
    return new Blob([pdf.output('blob')], { type: 'application/pdf' })
  }

  // PDFエクスポート（ダウンロード版）
  static async exportToPDF(report: BusinessReport) {
    const blob = await this.exportToPDFBlob(report)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `business-report-${new Date().toISOString().split('T')[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Excelエクスポート（Blob返却版）
  static async exportToExcelBlob(report: BusinessReport, rawData?: any): Promise<Blob> {
    const workbook = XLSX.utils.book_new()

    // サマリーシート
    const summaryData = [
      ['ビジネスレポート'],
      [''],
      ['タイトル', report.title],
      ['生成日時', report.generatedAt.toLocaleString('ja-JP')],
      [''],
      ['サマリー'],
      [report.summary],
      [''],
      ['推奨事項'],
      ...report.recommendations.map((rec: string, index: number) => [`${index + 1}`, rec])
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'サマリー')

    // セクション別シート
    report.sections.forEach((section: any, index: number) => {
      const sectionData = [
        [section.title],
        [''],
        ['内容'],
        [section.content],
        [''],
        ['インサイト'],
        ...section.insights.map((insight: string) => [insight])
      ]

      const sectionSheet = XLSX.utils.aoa_to_sheet(sectionData)
      XLSX.utils.book_append_sheet(workbook, sectionSheet, `セクション${index + 1}`)
    })

    // 生データシート（オプション）
    if (rawData && rawData.length > 0) {
      const dataSheet = XLSX.utils.json_to_sheet(rawData)
      XLSX.utils.book_append_sheet(workbook, dataSheet, '生データ')
    }

    // WorkbookをBlobに変換
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  }

  // Excelエクスポート（ダウンロード版）
  static async exportToExcel(report: BusinessReport, rawData?: any) {
    const blob = await this.exportToExcelBlob(report, rawData)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `business-report-${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // CSVエクスポート（Blob返却版）
  static async exportToCSVBlob(data: any[]): Promise<Blob> {
    if (!data || data.length === 0) {
      throw new Error('エクスポートするデータがありません')
    }

    const worksheet = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(worksheet)
    
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  }

  // CSVエクスポート（ダウンロード版）
  static async exportToCSV(data: any[], filename?: string) {
    const blob = await this.exportToCSVBlob(data)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // チャートキャプチャ
  static async captureChart(elementId: string): Promise<string> {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with id ${elementId} not found`)
    }

    const canvas = await html2canvas(element, {
      backgroundColor: 'white',
      scale: 2
    })
    
    return canvas.toDataURL('image/png')
  }

  // 複数形式での一括エクスポート
  static async exportMultipleFormats(
    report: BusinessReport,
    formats: ExportOptions['format'][],
    rawData?: any[]
  ) {
    const exports: Promise<any>[] = []

    if (formats.includes('pdf')) {
      exports.push(this.exportToPDF(report))
    }
    if (formats.includes('excel')) {
      exports.push(this.exportToExcel(report, rawData))
    }
    if (formats.includes('csv') && rawData) {
      exports.push(this.exportToCSV(rawData))
    }

    await Promise.all(exports)
  }

  // HTMLプレビュー生成
  static generateHTMLPreview(report: BusinessReport): string {
    return `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${report.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
          }
          h2 {
            color: #34495e;
            margin-top: 30px;
          }
          .meta {
            color: #7f8c8d;
            font-size: 0.9em;
            margin-bottom: 20px;
          }
          .section {
            margin-bottom: 30px;
          }
          .insights {
            background: #ecf0f1;
            padding: 15px;
            border-left: 4px solid #3498db;
            margin: 15px 0;
          }
          .recommendations {
            background: #d5f4e6;
            padding: 15px;
            border-left: 4px solid #27ae60;
            margin: 15px 0;
          }
          ul {
            padding-left: 20px;
          }
          li {
            margin-bottom: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${report.title}</h1>
          <div class="meta">生成日時: ${new Date(report.generatedAt).toLocaleString('ja-JP')}</div>
          
          <div class="section">
            <h2>エグゼクティブサマリー</h2>
            <p>${report.summary}</p>
          </div>

          ${report.sections.map((section: any) => `
            <div class="section">
              <h2>${section.title}</h2>
              <p>${section.content}</p>
              ${section.insights && section.insights.length > 0 ? `
                <div class="insights">
                  <h3>主要なインサイト</h3>
                  <ul>
                    ${section.insights.map((insight: string) => `<li>${insight}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}

          ${report.recommendations && report.recommendations.length > 0 ? `
            <div class="recommendations">
              <h2>推奨事項</h2>
              <ol>
                ${report.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
              </ol>
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `
  }
}
