/**
 * AI Agent Framework for Business Management Integration
 * GitHub Copilot風の統合型AIエージェント機能
 */

import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { getProviderApiEndpoint } from './llm-providers'

export interface AgentContext {
  businessData: {
    customers?: any[]
    sales?: any[]
    inventory?: any[]
    finances?: any[]
    reports?: any[]
  }
  userQuery: string
  intent: AgentIntent
  capabilities: AgentCapability[]
}

export enum AgentIntent {
  DASHBOARD_ANALYSIS = "dashboard_analysis",
  CUSTOMER_MANAGEMENT = "customer_management", 
  SALES_ANALYSIS = "sales_analysis",
  INVENTORY_MANAGEMENT = "inventory_management",
  FINANCIAL_REPORT = "financial_report",
  GENERAL_QUERY = "general_query",
  BUSINESS_INSIGHTS = "business_insights",
  REPORT_GENERATION = "report_generation"
}

export enum AgentCapability {
  DATA_ANALYSIS = "data_analysis",
  REPORT_GENERATION = "report_generation", 
  CUSTOMER_INSIGHTS = "customer_insights",
  SALES_FORECASTING = "sales_forecasting",
  INVENTORY_OPTIMIZATION = "inventory_optimization",
  FINANCIAL_ANALYSIS = "financial_analysis"
}

export class BusinessAIAgent {
  private aiConfig: {
    provider: string
    apiKey?: string
    modelId: string
    apiEndpoint?: string
  }

  constructor(config?: {
    provider?: string,
    apiKey?: string,
    modelId?: string,
    apiEndpoint?: string
  }) {
    this.aiConfig = {
      provider: config?.provider || "openrouter",
      apiKey: config?.apiKey || process.env.AI_API_KEY || "",
      modelId: config?.modelId || "deepseek/deepseek-r1-0528",
      apiEndpoint: config?.apiEndpoint
    }
  }

  /**
   * ユーザーのクエリから意図を分析
   */
  async analyzeIntent(query: string): Promise<AgentIntent> {
    const lowerQuery = query.toLowerCase()
    
    // キーワードベースの意図分析（後でAIベースに拡張可能）
    if (lowerQuery.includes('レポート') || lowerQuery.includes('報告書') || lowerQuery.includes('まとめて')) {
      return AgentIntent.REPORT_GENERATION
    } else if (lowerQuery.includes('ダッシュボード') || lowerQuery.includes('概要') || lowerQuery.includes('全体')) {
      return AgentIntent.DASHBOARD_ANALYSIS
    } else if (lowerQuery.includes('顧客') || lowerQuery.includes('クライアント') || lowerQuery.includes('お客様')) {
      return AgentIntent.CUSTOMER_MANAGEMENT
    } else if (lowerQuery.includes('売上') || lowerQuery.includes('販売') || lowerQuery.includes('売れ行き')) {
      return AgentIntent.SALES_ANALYSIS
    } else if (lowerQuery.includes('在庫') || lowerQuery.includes('商品') || lowerQuery.includes('製品')) {
      return AgentIntent.INVENTORY_MANAGEMENT
    } else if (lowerQuery.includes('財務') || lowerQuery.includes('会計') || lowerQuery.includes('収支')) {
      return AgentIntent.FINANCIAL_REPORT
    } else if (lowerQuery.includes('分析') || lowerQuery.includes('洞察') || lowerQuery.includes('トレンド')) {
      return AgentIntent.BUSINESS_INSIGHTS
    }
    
    return AgentIntent.GENERAL_QUERY
  }

  /**
   * 意図に基づいて必要な機能を決定
   */
  getRequiredCapabilities(intent: AgentIntent): AgentCapability[] {
    const capabilityMap: Record<AgentIntent, AgentCapability[]> = {
      [AgentIntent.DASHBOARD_ANALYSIS]: [
        AgentCapability.DATA_ANALYSIS,
        AgentCapability.REPORT_GENERATION
      ],
      [AgentIntent.CUSTOMER_MANAGEMENT]: [
        AgentCapability.CUSTOMER_INSIGHTS,
        AgentCapability.DATA_ANALYSIS
      ],
      [AgentIntent.SALES_ANALYSIS]: [
        AgentCapability.SALES_FORECASTING,
        AgentCapability.DATA_ANALYSIS
      ],
      [AgentIntent.INVENTORY_MANAGEMENT]: [
        AgentCapability.INVENTORY_OPTIMIZATION,
        AgentCapability.DATA_ANALYSIS
      ],
      [AgentIntent.FINANCIAL_REPORT]: [
        AgentCapability.FINANCIAL_ANALYSIS,
        AgentCapability.REPORT_GENERATION
      ],
      [AgentIntent.BUSINESS_INSIGHTS]: [
        AgentCapability.DATA_ANALYSIS,
        AgentCapability.REPORT_GENERATION,
        AgentCapability.SALES_FORECASTING
      ],
      [AgentIntent.REPORT_GENERATION]: [
        AgentCapability.REPORT_GENERATION,
        AgentCapability.DATA_ANALYSIS,
        AgentCapability.CUSTOMER_INSIGHTS,
        AgentCapability.SALES_FORECASTING,
        AgentCapability.INVENTORY_OPTIMIZATION,
        AgentCapability.FINANCIAL_ANALYSIS
      ],
      [AgentIntent.GENERAL_QUERY]: []
    }

    return capabilityMap[intent] || []
  }

  /**
   * ビジネスデータを収集
   */
  async collectBusinessData(capabilities: AgentCapability[]): Promise<any> {
    const businessData: any = {}

    try {
      // 各機能に基づいてデータを収集
      if (capabilities.includes(AgentCapability.CUSTOMER_INSIGHTS)) {
        // 顧客データを取得（APIエンドポイントから）
        businessData.customers = await this.fetchCustomerData()
      }

      if (capabilities.includes(AgentCapability.SALES_FORECASTING)) {
        // 売上データを取得
        businessData.sales = await this.fetchSalesData()
      }

      if (capabilities.includes(AgentCapability.INVENTORY_OPTIMIZATION)) {
        // 在庫データを取得
        businessData.inventory = await this.fetchInventoryData()
      }

      if (capabilities.includes(AgentCapability.FINANCIAL_ANALYSIS)) {
        // 財務データを取得
        businessData.finances = await this.fetchFinancialData()
      }

    } catch (error) {
      console.error('ビジネスデータ収集エラー:', error)
    }

    return businessData
  }

  /**
   * AIエージェントの統合レスポンス生成
   */
  async generateResponse(context: AgentContext) {
    const systemPrompt = this.buildSystemPrompt(context)
    
    // プロバイダー設定に基づいてLLMを初期化
    const endpoint = getProviderApiEndpoint(this.aiConfig.provider, this.aiConfig.apiEndpoint)
    const llmProvider = createOpenAI({
      baseURL: endpoint,
      apiKey: this.aiConfig.apiKey || "dummy"
    })

    return streamText({
      model: llmProvider(this.aiConfig.modelId),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: context.userQuery }
      ],
    })
  }

  /**
   * コンテキストに基づいたシステムプロンプト構築（改善版）
   */
  private buildSystemPrompt(context: AgentContext): string {
    let prompt = `あなたは統合型ビジネス管理AIエージェント「Business Copilot」です。GitHub Copilotのように、ビジネス管理のあらゆる側面をサポートし、データに基づいた実用的な洞察と提案を提供します。

🎯 現在のコンテキスト:
- 分析対象: ${context.intent}
- 利用可能な機能: ${context.capabilities.join(', ')}

`

    // ビジネスデータがある場合は分析結果を追加
    if (context.businessData.customers?.length) {
      const customerInsights = BusinessInsightEngine.analyzeCustomerInsights(context.businessData.customers)
      prompt += `👥 顧客分析:\n${customerInsights}\n\n`
    }
    
    if (context.businessData.sales?.length) {
      const salesInsights = BusinessInsightEngine.analyzeSalesTrends(context.businessData.sales)
      prompt += `📈 売上分析:\n${salesInsights}\n\n`
    }
    
    if (context.businessData.inventory?.length) {
      const inventoryInsights = BusinessInsightEngine.analyzeInventoryOptimization(context.businessData.inventory)
      prompt += `📦 在庫分析:\n${inventoryInsights}\n\n`
    }
    
    if (context.businessData.finances?.length) {
      const financialInsights = BusinessInsightEngine.analyzeFinancialHealth(context.businessData.finances)
      prompt += `💰 財務分析:\n${financialInsights}\n\n`
    }

    prompt += `
🚀 あなたの役割:
1. **データドリブン分析**: 提供されたビジネスデータを基に具体的な洞察を提供
2. **実用的提案**: すぐに実行できる具体的なアクションプランを提示
3. **意思決定支援**: データに基づいた戦略的判断をサポート
4. **成長戦略**: ビジネス成長のための具体的な施策を提案
5. **リスク管理**: 潜在的な課題や改善点を特定し対策を提示

💡 回答スタイル:
- 日本語で親しみやすく、でも専門的に
- データと数値を活用した説得力のある説明
- 具体的なアクションアイテムを含める
- 必要に応じて優先順位を明示
- 絵文字を使って見やすく整理

現在のユーザークエリに対して、上記の分析結果を活用しながら、実用的で行動可能なアドバイスを提供してください。`

    return prompt
  }

  // データ取得メソッド（改善版）
  private async fetchCustomerData(): Promise<any[]> {
    try {
      // サーバーサイドでfetchを使用する場合の対応
      const baseUrl = typeof window !== 'undefined' 
        ? '' 
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      
      const response = await fetch(`${baseUrl}/api/customers`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        // 最新の10件の顧客データを返す（データ量を制限）
        return result.data.slice(0, 10).map((customer: any) => ({
          id: customer._id,
          name: customer.name,
          email: customer.email,
          company: customer.company,
          createdAt: customer.createdAt
        }))
      }
      return []
    } catch (error) {
      console.error('顧客データ取得エラー:', error)
      return []
    }
  }

  private async fetchSalesData(): Promise<any[]> {
    try {
      const baseUrl = typeof window !== 'undefined' 
        ? '' 
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        
      const response = await fetch(`${baseUrl}/api/analytics?period=month`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        return [{
          totalSales: result.totalSales || 0,
          monthlyRevenue: result.monthlyRevenue || 0,
          salesGrowth: result.salesGrowth || 0,
          period: 'month'
        }]
      }
      return []
    } catch (error) {
      console.error('売上データ取得エラー:', error)
      return []
    }
  }

  private async fetchInventoryData(): Promise<any[]> {
    try {
      const baseUrl = typeof window !== 'undefined' 
        ? '' 
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        
      const response = await fetch(`${baseUrl}/api/products`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        // 在庫情報を簡約化
        return result.data.slice(0, 10).map((product: any) => ({
          id: product._id,
          name: product.name,
          sku: product.sku,
          stock: product.stock,
          price: product.price,
          category: product.category
        }))
      }
      return []
    } catch (error) {
      console.error('在庫データ取得エラー:', error)
      return []
    }
  }

  private async fetchFinancialData(): Promise<any[]> {
    try {
      const baseUrl = typeof window !== 'undefined' 
        ? '' 
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        
      const response = await fetch(`${baseUrl}/api/analytics?period=month`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        return [{
          totalExpenses: result.totalExpenses || 0,
          netProfit: result.netProfit || 0,
          profitMargin: result.profitMargin || 0,
          monthlyExpenseTotal: result.monthlyExpenseTotal || 0
        }]
      }
      return []
    } catch (error) {
      console.error('財務データ取得エラー:', error)
      return []
    }
  }
}

/**
 * 高度なビジネス分析クラス
 */
export class BusinessInsightEngine {
  /**
   * 売上トレンド分析
   */
  static analyzeSalesTrends(salesData: any[]): string {
    if (!salesData.length) return "売上データが不足しています。"
    
    const current = salesData[0]
    let insights = []
    
    if (current.salesGrowth > 10) {
      insights.push(`🚀 売上成長率が${current.salesGrowth}%と好調です！`)
    } else if (current.salesGrowth < -5) {
      insights.push(`⚠️ 売上が${Math.abs(current.salesGrowth)}%減少しています。対策が必要です。`)
    } else {
      insights.push(`📊 売上は安定推移（成長率: ${current.salesGrowth}%）`)
    }
    
    return insights.join('\n')
  }

  /**
   * 在庫最適化提案
   */
  static analyzeInventoryOptimization(inventoryData: any[]): string {
    if (!inventoryData.length) return "在庫データが不足しています。"
    
    let insights = []
    const lowStockItems = inventoryData.filter(item => item.stock < 10)
    const highValueItems = inventoryData.filter(item => item.price > 10000)
    
    if (lowStockItems.length > 0) {
      insights.push(`⚡ 在庫不足商品: ${lowStockItems.map(item => item.name).join(', ')}`)
      insights.push(`💡 提案: 早急に補充を検討してください`)
    }
    
    if (highValueItems.length > 0) {
      insights.push(`💎 高価値商品: ${highValueItems.length}点`)
      insights.push(`💡 提案: 重点的な販売戦略を立案しましょう`)
    }
    
    return insights.join('\n')
  }

  /**
   * 顧客分析
   */
  static analyzeCustomerInsights(customerData: any[]): string {
    if (!customerData.length) return "顧客データが不足しています。"
    
    let insights = []
    const recentCustomers = customerData.filter(customer => {
      const createdDate = new Date(customer.createdAt)
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return createdDate > monthAgo
    })
    
    insights.push(`👥 総顧客数: ${customerData.length}名`)
    insights.push(`🆕 新規顧客（過去1ヶ月）: ${recentCustomers.length}名`)
    
    if (recentCustomers.length > 5) {
      insights.push(`🚀 新規顧客獲得が好調です！`)
    } else if (recentCustomers.length < 2) {
      insights.push(`💡 新規顧客獲得の改善が必要です`)
    }
    
    return insights.join('\n')
  }

  /**
   * 財務健全性分析
   */
  static analyzeFinancialHealth(financialData: any[]): string {
    if (!financialData.length) return "財務データが不足しています。"
    
    const current = financialData[0]
    let insights = []
    
    if (current.profitMargin > 20) {
      insights.push(`💰 利益率${current.profitMargin}%と優秀です！`)
    } else if (current.profitMargin < 5) {
      insights.push(`⚠️ 利益率${current.profitMargin}%が低いです。コスト削減を検討してください`)
    }
    
    if (current.netProfit > 0) {
      insights.push(`✅ 黒字経営を維持（純利益: ¥${current.netProfit.toLocaleString()}）`)
    } else {
      insights.push(`🔴 赤字状況です。早急な改善策が必要です`)
    }
    
    return insights.join('\n')
  }
}

/**
 * AIエージェントのメインエントリーポイント
 */
export async function processBusinessQuery(
  query: string,
  config?: {
    provider?: string,
    apiKey?: string,
    modelId?: string,
    apiEndpoint?: string
  }
) {
  const agent = new BusinessAIAgent(config)
  
  // 意図を分析
  const intent = await agent.analyzeIntent(query)
  
  // 必要な機能を決定
  const capabilities = agent.getRequiredCapabilities(intent)
  
  // ビジネスデータを収集
  const businessData = await agent.collectBusinessData(capabilities)
  
  // コンテキストを構築
  const context: AgentContext = {
    businessData,
    userQuery: query,
    intent,
    capabilities
  }
  
  // AIレスポンスを生成
  return agent.generateResponse(context)
}
