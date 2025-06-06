/**
 * AI Business Report Generator
 * ビジネスレポート自動生成システム
 */

export interface BusinessReport {
  title: string
  summary: string
  sections: ReportSection[]
  recommendations: string[]
  metrics: ReportMetric[]
  generatedAt: Date
}

export interface ReportSection {
  title: string
  content: string
  insights: string[]
  charts?: ChartData[]
}

export interface ReportMetric {
  name: string
  value: number | string
  change?: number
  trend: 'up' | 'down' | 'stable'
  importance: 'high' | 'medium' | 'low'
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area'
  title: string
  data: any[]
}

export class BusinessReportGenerator {
  /**
   * 包括的なビジネスレポートを生成
   */
  static async generateComprehensiveReport(businessData: any): Promise<BusinessReport> {
    const currentDate = new Date()
    
    const report: BusinessReport = {
      title: `ビジネス統合レポート - ${currentDate.toLocaleDateString('ja-JP')}`,
      summary: "",
      sections: [],
      recommendations: [],
      metrics: [],
      generatedAt: currentDate
    }

    // セクション1: エグゼクティブサマリー
    report.sections.push(this.generateExecutiveSummary(businessData))
    
    // セクション2: 売上分析
    if (businessData.sales?.length) {
      report.sections.push(this.generateSalesAnalysis(businessData.sales))
    }
    
    // セクション3: 顧客分析
    if (businessData.customers?.length) {
      report.sections.push(this.generateCustomerAnalysis(businessData.customers))
    }
    
    // セクション4: 在庫分析
    if (businessData.inventory?.length) {
      report.sections.push(this.generateInventoryAnalysis(businessData.inventory))
    }
    
    // セクション5: 財務分析
    if (businessData.finances?.length) {
      report.sections.push(this.generateFinancialAnalysis(businessData.finances))
    }
    
    // 主要メトリクス
    report.metrics = this.generateKeyMetrics(businessData)
    
    // 推奨事項
    report.recommendations = this.generateRecommendations(businessData)
    
    // サマリー生成
    report.summary = this.generateOverallSummary(report)
    
    return report
  }

  private static generateExecutiveSummary(businessData: any): ReportSection {
    const insights = []
    
    if (businessData.customers?.length) {
      insights.push(`総顧客数: ${businessData.customers.length}名`)
    }
    
    if (businessData.sales?.length) {
      const totalSales = businessData.sales.reduce((sum: number, sale: any) => sum + (sale.totalSales || 0), 0)
      insights.push(`今月の売上: ¥${totalSales.toLocaleString()}`)
    }
    
    if (businessData.inventory?.length) {
      const lowStockCount = businessData.inventory.filter((item: any) => item.stock < 10).length
      if (lowStockCount > 0) {
        insights.push(`在庫不足商品: ${lowStockCount}点`)
      }
    }

    return {
      title: "エグゼクティブサマリー",
      content: "ビジネスの現状を一目で把握できる重要指標をまとめました。",
      insights
    }
  }

  private static generateSalesAnalysis(salesData: any[]): ReportSection {
    const insights = []
    const currentPeriod = salesData[0] || {}
    
    if (currentPeriod.salesGrowth !== undefined) {
      if (currentPeriod.salesGrowth > 10) {
        insights.push(`🚀 売上成長率${currentPeriod.salesGrowth}% - 優秀な成長`)
      } else if (currentPeriod.salesGrowth > 0) {
        insights.push(`📈 売上成長率${currentPeriod.salesGrowth}% - 安定的な成長`)
      } else {
        insights.push(`📉 売上成長率${currentPeriod.salesGrowth}% - 改善要`)
      }
    }
    
    if (currentPeriod.monthlyRevenue) {
      insights.push(`月間売上: ¥${currentPeriod.monthlyRevenue.toLocaleString()}`)
    }

    return {
      title: "売上分析",
      content: "売上トレンドと成長パターンの詳細分析",
      insights
    }
  }

  private static generateCustomerAnalysis(customerData: any[]): ReportSection {
    const insights = []
    const totalCustomers = customerData.length
    
    // 新規顧客分析
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    
    const newCustomers = customerData.filter(customer => 
      new Date(customer.createdAt) > monthAgo
    ).length
    
    insights.push(`総顧客数: ${totalCustomers}名`)
    insights.push(`新規顧客（過去1ヶ月）: ${newCustomers}名`)
    
    if (newCustomers / totalCustomers > 0.1) {
      insights.push("🌟 新規顧客獲得が好調")
    } else if (newCustomers < 2) {
      insights.push("⚠️ 新規顧客獲得の強化が必要")
    }

    return {
      title: "顧客分析",
      content: "顧客ベースの成長と顧客獲得トレンド",
      insights
    }
  }

  private static generateInventoryAnalysis(inventoryData: any[]): ReportSection {
    const insights = []
    const totalProducts = inventoryData.length
    const lowStockItems = inventoryData.filter(item => item.stock < 10)
    const highValueItems = inventoryData.filter(item => item.price > 10000)
    
    insights.push(`総商品数: ${totalProducts}点`)
    
    if (lowStockItems.length > 0) {
      insights.push(`⚠️ 在庫不足商品: ${lowStockItems.length}点`)
      insights.push(`補充必要: ${lowStockItems.map(item => item.name).slice(0, 3).join(', ')}${lowStockItems.length > 3 ? ' 他' : ''}`)
    }
    
    if (highValueItems.length > 0) {
      insights.push(`💎 高価値商品: ${highValueItems.length}点`)
    }

    return {
      title: "在庫分析",
      content: "在庫レベルと商品ポートフォリオの分析",
      insights
    }
  }

  private static generateFinancialAnalysis(financialData: any[]): ReportSection {
    const insights = []
    const current = financialData[0] || {}
    
    if (current.netProfit !== undefined) {
      if (current.netProfit > 0) {
        insights.push(`✅ 純利益: ¥${current.netProfit.toLocaleString()}`)
      } else {
        insights.push(`🔴 純損失: ¥${Math.abs(current.netProfit).toLocaleString()}`)
      }
    }
    
    if (current.profitMargin !== undefined) {
      if (current.profitMargin > 15) {
        insights.push(`💰 利益率${current.profitMargin}% - 優秀`)
      } else if (current.profitMargin > 5) {
        insights.push(`📊 利益率${current.profitMargin}% - 標準的`)
      } else {
        insights.push(`⚠️ 利益率${current.profitMargin}% - 改善要`)
      }
    }

    return {
      title: "財務分析",
      content: "収益性と財務健全性の評価",
      insights
    }
  }

  private static generateKeyMetrics(businessData: any): ReportMetric[] {
    const metrics: ReportMetric[] = []
    
    if (businessData.customers?.length) {
      metrics.push({
        name: "総顧客数",
        value: businessData.customers.length,
        trend: 'up',
        importance: 'high'
      })
    }
    
    if (businessData.sales?.length && businessData.sales[0].monthlyRevenue) {
      metrics.push({
        name: "月間売上",
        value: `¥${businessData.sales[0].monthlyRevenue.toLocaleString()}`,
        change: businessData.sales[0].salesGrowth,
        trend: businessData.sales[0].salesGrowth > 0 ? 'up' : 'down',
        importance: 'high'
      })
    }
    
    if (businessData.finances?.length && businessData.finances[0].profitMargin) {
      metrics.push({
        name: "利益率",
        value: `${businessData.finances[0].profitMargin}%`,
        trend: businessData.finances[0].profitMargin > 10 ? 'up' : 'stable',
        importance: 'high'
      })
    }
    
    return metrics
  }

  private static generateRecommendations(businessData: any): string[] {
    const recommendations = []
    
    // 売上関連の推奨事項
    if (businessData.sales?.length && businessData.sales[0].salesGrowth < 5) {
      recommendations.push("マーケティング活動の強化を検討してください")
      recommendations.push("既存顧客へのアップセル・クロスセル機会を探索しましょう")
    }
    
    // 在庫関連の推奨事項
    if (businessData.inventory?.length) {
      const lowStockItems = businessData.inventory.filter((item: any) => item.stock < 10)
      if (lowStockItems.length > 0) {
        recommendations.push(`${lowStockItems.length}点の商品で在庫補充が必要です`)
      }
    }
    
    // 顧客関連の推奨事項
    if (businessData.customers?.length < 50) {
      recommendations.push("新規顧客獲得のためのデジタルマーケティング戦略を検討してください")
    }
    
    // 財務関連の推奨事項
    if (businessData.finances?.length && businessData.finances[0].profitMargin < 10) {
      recommendations.push("コスト構造の見直しと効率化を進めましょう")
      recommendations.push("価格戦略の最適化を検討してください")
    }
    
    return recommendations
  }

  private static generateOverallSummary(report: BusinessReport): string {
    const keyInsights = report.sections
      .flatMap(section => section.insights)
      .slice(0, 5)
    
    return `
このレポートは${report.generatedAt.toLocaleDateString('ja-JP')}時点でのビジネス状況を包括的に分析したものです。
主要な洞察: ${keyInsights.join('、')}。
${report.recommendations.length}件の改善提案を含んでいます。
    `.trim()
  }
}
