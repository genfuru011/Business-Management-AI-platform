/**
 * AI Agent Framework for Business Management Integration
 * GitHub Copilot風の統合型AIエージェント機能
 */

import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { getMCPClient, MCPClient, MCPToolResult } from "./mcp-client"

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
  private mcpClient: MCPClient

  constructor(config?: {
    provider?: string,
    apiKey?: string,
    modelId?: string,
    apiEndpoint?: string
  }) {
    this.aiConfig = {
      provider: config?.provider || process.env.AI_PROVIDER || "ollama",
      apiKey: config?.apiKey || process.env.AI_API_KEY || "ollama-local-key-123",
      modelId: config?.modelId || process.env.AI_MODEL || "llama3.2",
      apiEndpoint: config?.apiEndpoint || process.env.AI_ENDPOINT || "http://localhost:11435/v1"
    }
    this.mcpClient = getMCPClient()
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
   * ビジネスデータを収集（MCP統合版）
   */
  async collectBusinessData(capabilities: AgentCapability[]): Promise<any> {
    const businessData: any = {}

    try {
      // MCPサーバーへの接続を確認・確立
      if (!this.mcpClient.isConnectedToServer()) {
        console.log('🔗 MCPサーバーに接続中...')
        await this.mcpClient.connect()
      }

      // 各機能に基づいてMCPツールでデータを収集
      if (capabilities.includes(AgentCapability.CUSTOMER_INSIGHTS)) {
        console.log('👥 顧客データを取得中...')
        const customerResult = await this.mcpClient.callTool('get_customers', { 
          limit: 10 
        })
        businessData.customers = customerResult.success ? customerResult.data : []
      }

      if (capabilities.includes(AgentCapability.SALES_FORECASTING)) {
        console.log('📈 売上データを取得中...')
        const salesResult = await this.mcpClient.callTool('get_sales_data', {})
        businessData.sales = salesResult.success ? salesResult.data : []
      }

      if (capabilities.includes(AgentCapability.INVENTORY_OPTIMIZATION)) {
        console.log('📦 在庫データを取得中...')
        const productsResult = await this.mcpClient.callTool('get_products', {
          limit: 10
        })
        businessData.inventory = productsResult.success ? productsResult.data : []
      }

      if (capabilities.includes(AgentCapability.FINANCIAL_ANALYSIS)) {
        console.log('💰 財務データを取得中...')
        const financialResult = await this.mcpClient.callTool('get_financial_summary', {})
        businessData.finances = financialResult.success ? [financialResult.data] : []
      }

      console.log('✅ MCPデータ収集完了')

    } catch (error) {
      console.error('❌ MCPデータ収集エラー:', error)
      // エラー時は従来のAPI呼び出しにフォールバック
      return this.collectBusinessDataFallback(capabilities)
    }

    return businessData
  }

  /**
   * フォールバック: 従来のAPI呼び出しでデータ収集
   */
  private async collectBusinessDataFallback(capabilities: AgentCapability[]): Promise<any> {
    const businessData: any = {}

    try {
      console.log('⚠️ MCPフォールバック: 従来のAPI呼び出しを使用')
      
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
    
    console.log('🔧 AI設定:', {
      provider: this.aiConfig.provider,
      model: this.aiConfig.modelId,
      endpoint: this.aiConfig.apiEndpoint,
      hasApiKey: !!this.aiConfig.apiKey
    })
    
    try {
      // プロバイダー設定に基づいてLLMを初期化
      const llmProvider = createOpenAI({
        baseURL: this.aiConfig.apiEndpoint,
        apiKey: this.aiConfig.apiKey || "dummy"
      })

      return streamText({
        model: llmProvider(this.aiConfig.modelId),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: context.userQuery }
        ],
        abortSignal: AbortSignal.timeout(300000), // 5分タイムアウト
      })
    } catch (error) {
      console.error('AI応答生成エラー:', error)
      
      // タイムアウトエラーの場合の特別処理
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('timeout'))) {
        throw new Error('AI応答がタイムアウトしました。もう一度お試しください。')
      }
      
      throw error
    }
  }

  /**
   * コンテキストに基づいたシステムプロンプト構築（改善版 + MCP対応）
   */
  private buildSystemPrompt(context: AgentContext): string {
    let prompt = `あなたは統合型ビジネス管理AIエージェント「Business Copilot」です。GitHub Copilotのように、ビジネス管理のあらゆる側面をサポートし、データに基づいた実用的な洞察と提案を提供します。

🎯 現在のコンテキスト:
- 分析対象: ${context.intent}
- 利用可能な機能: ${context.capabilities.join(', ')}
- データソース: Model Context Protocol (MCP) + フォールバック

`

    // ビジネスデータがある場合は分析結果を追加
    if (context.businessData.customers?.length) {
      const customerInsights = BusinessInsightEngine.analyzeCustomerInsights(context.businessData.customers)
      prompt += `👥 顧客分析 (MCP):\n${customerInsights}\n\n`
    }
    
    if (context.businessData.sales?.length) {
      const salesInsights = BusinessInsightEngine.analyzeSalesTrends(context.businessData.sales)
      prompt += `📈 売上分析 (MCP):\n${salesInsights}\n\n`
    }
    
    if (context.businessData.inventory?.length) {
      const inventoryInsights = BusinessInsightEngine.analyzeInventoryOptimization(context.businessData.inventory)
      prompt += `📦 在庫分析 (MCP):\n${inventoryInsights}\n\n`
    }
    
    if (context.businessData.finances?.length) {
      const financialInsights = BusinessInsightEngine.analyzeFinancialHealth(context.businessData.finances)
      prompt += `💰 財務分析 (MCP):\n${financialInsights}\n\n`
    }

    prompt += `
🚀 あなたの役割:
1. **MCPデータドリブン分析**: Model Context Protocolを通じて取得したリアルタイムビジネスデータを基に具体的な洞察を提供
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

🔧 技術的優位性:
- MCPプロトコルによる高速データアクセス
- 複数データソースの統合分析
- リアルタイム洞察提供

現在のユーザークエリに対して、上記のMCP分析結果を活用しながら、実用的で行動可能なアドバイスを提供してください。`

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
 * 高度なビジネス分析クラス（MCP対応版）
 */
export class BusinessInsightEngine {
  /**
   * 売上トレンド分析（MCP対応）
   */
  static analyzeSalesTrends(salesData: any[]): string {
    if (!salesData.length) return "📊 売上データが不足しています。MCPサーバーからのデータ取得を確認してください。"
    
    let insights = []
    
    // 売上データの構造を動的に判断
    if (typeof salesData[0] === 'object' && salesData[0].hasOwnProperty('amount')) {
      // 個別売上データの場合
      const totalSales = salesData.reduce((sum, sale) => sum + (sale.amount || 0), 0)
      const averageSale = totalSales / salesData.length
      
      insights.push(`📊 総売上: ¥${totalSales.toLocaleString()}`)
      insights.push(`📊 売上件数: ${salesData.length}件`)
      insights.push(`📊 平均売上単価: ¥${Math.round(averageSale).toLocaleString()}`)
      
      // 最近の売上傾向
      const recentSales = salesData.slice(-10)
      const recentTotal = recentSales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
      const recentAverage = recentTotal / recentSales.length
      
      if (recentAverage > averageSale * 1.1) {
        insights.push(`🚀 最近の売上が好調です！（直近平均: ¥${Math.round(recentAverage).toLocaleString()}）`)
      } else if (recentAverage < averageSale * 0.9) {
        insights.push(`⚠️ 最近の売上が低下しています（直近平均: ¥${Math.round(recentAverage).toLocaleString()}）`)
      }
    } else {
      // 集約済みデータの場合
      const current = salesData[0]
      if (current.salesGrowth !== undefined) {
        if (current.salesGrowth > 10) {
          insights.push(`🚀 売上成長率が${current.salesGrowth}%と好調です！`)
        } else if (current.salesGrowth < -5) {
          insights.push(`⚠️ 売上が${Math.abs(current.salesGrowth)}%減少しています。対策が必要です。`)
        } else {
          insights.push(`📊 売上は安定推移（成長率: ${current.salesGrowth}%）`)
        }
      }
    }
    
    return insights.join('\n')
  }

  /**
   * 在庫最適化提案（MCP対応）
   */
  static analyzeInventoryOptimization(inventoryData: any[]): string {
    if (!inventoryData.length) return "📦 在庫データが不足しています。MCPサーバーからのデータ取得を確認してください。"
    
    let insights = []
    const lowStockItems = inventoryData.filter(item => (item.stock || item.quantity || 0) < 10)
    const highValueItems = inventoryData.filter(item => (item.price || 0) > 10000)
    const totalItems = inventoryData.length
    
    insights.push(`📦 総商品数: ${totalItems}点`)
    
    if (lowStockItems.length > 0) {
      insights.push(`⚡ 在庫不足商品: ${lowStockItems.length}点`)
      insights.push(`💡 要補充商品: ${lowStockItems.slice(0, 3).map(item => item.name).join(', ')}${lowStockItems.length > 3 ? '他' : ''}`)
    }
    
    if (highValueItems.length > 0) {
      insights.push(`💎 高価値商品: ${highValueItems.length}点（¥10,000以上）`)
      insights.push(`💡 提案: 重点的な販売戦略を立案しましょう`)
    }
    
    // 在庫総額を計算
    const totalValue = inventoryData.reduce((sum, item) => 
      sum + ((item.price || 0) * (item.stock || item.quantity || 0)), 0)
    if (totalValue > 0) {
      insights.push(`💰 総在庫価値: ¥${totalValue.toLocaleString()}`)
    }
    
    return insights.join('\n')
  }

  /**
   * 顧客分析（MCP対応）
   */
  static analyzeCustomerInsights(customerData: any[]): string {
    if (!customerData.length) return "👥 顧客データが不足しています。MCPサーバーからのデータ取得を確認してください。"
    
    let insights = []
    
    const totalCustomers = customerData.length
    insights.push(`👥 総顧客数: ${totalCustomers}名`)
    
    // 最近の顧客（createdAt, registeredAt, dateJoinedなどを確認）
    const recentCustomers = customerData.filter(customer => {
      const dateField = customer.createdAt || customer.registeredAt || customer.dateJoined
      if (!dateField) return false
      
      const createdDate = new Date(dateField)
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return createdDate > monthAgo
    })
    
    insights.push(`🆕 新規顧客（過去1ヶ月）: ${recentCustomers.length}名`)
    
    if (recentCustomers.length > totalCustomers * 0.2) {
      insights.push(`🚀 新規顧客獲得が好調です！（成長率: ${Math.round((recentCustomers.length / totalCustomers) * 100)}%）`)
    } else if (recentCustomers.length < totalCustomers * 0.05) {
      insights.push(`💡 新規顧客獲得の改善が必要です`)
    }
    
    // 会社別分析
    const companyCustomers = customerData.filter(c => c.company && c.company.trim())
    if (companyCustomers.length > 0) {
      insights.push(`🏢 法人顧客: ${companyCustomers.length}社`)
    }
    
    return insights.join('\n')
  }

  /**
   * 財務健全性分析（MCP対応）
   */
  static analyzeFinancialHealth(financialData: any[]): string {
    if (!financialData.length) return "💰 財務データが不足しています。MCPサーバーからのデータ取得を確認してください。"
    
    const current = financialData[0]
    let insights = []
    
    // 売上・収益分析
    if (current.totalRevenue !== undefined) {
      insights.push(`💰 総売上: ¥${(current.totalRevenue || 0).toLocaleString()}`)
    }
    
    if (current.totalExpenses !== undefined) {
      insights.push(`💸 総経費: ¥${(current.totalExpenses || 0).toLocaleString()}`)
    }
    
    // 利益率分析
    if (current.profitMargin !== undefined) {
      if (current.profitMargin > 20) {
        insights.push(`✅ 利益率${current.profitMargin}%と優秀です！`)
      } else if (current.profitMargin < 5) {
        insights.push(`⚠️ 利益率${current.profitMargin}%が低いです。コスト削減を検討してください`)
      } else {
        insights.push(`📊 利益率: ${current.profitMargin}%`)
      }
    }
    
    // 純利益分析
    if (current.netProfit !== undefined) {
      if (current.netProfit > 0) {
        insights.push(`✅ 黒字経営を維持（純利益: ¥${current.netProfit.toLocaleString()}）`)
      } else {
        insights.push(`🔴 赤字状況です（純損失: ¥${Math.abs(current.netProfit).toLocaleString()}）`)
        insights.push(`💡 早急な改善策が必要です`)
      }
    }
    
    // 平均取引額
    if (current.averageSaleAmount !== undefined && current.averageSaleAmount > 0) {
      insights.push(`📊 平均取引額: ¥${Math.round(current.averageSaleAmount).toLocaleString()}`)
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
