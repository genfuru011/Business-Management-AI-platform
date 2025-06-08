/**
 * Enhanced AI Agent with MCP Integration
 * 
 * This enhanced version of the BusinessAIAgent uses MCP (Model Context Protocol)
 * for standardized and secure database operations.
 */

import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { businessMCPClient, businessMCPServer, BusinessMCPClient } from './mcp-database'
import { 
  AgentContext, 
  AgentIntent, 
  AgentCapability,
  BusinessInsightEngine 
} from './ai-agent'
import { 
  JapaneseTemporalQueryParser, 
  TemporalContext 
} from './temporal-query-parser'
import { getProviderApiEndpoint } from './llm-providers'

export interface EnhancedAgentContext extends AgentContext {
  mcpTools: string[]
  mcpResources: string[]
  temporalContext?: TemporalContext
  error?: {
    message: string
    timestamp: string
  }
}

export interface EnhancedBusinessData {
  customers?: any[]
  sales?: any[]
  inventory?: any[]
  finances?: any[]
  reports?: any[]
  overview?: any
  error?: {
    message: string
    timestamp: string
  }
}

/**
 * Enhanced Business AI Agent with MCP Integration
 */
export class EnhancedBusinessAIAgent {
  private aiConfig: {
    provider: string
    apiKey?: string
    modelId: string
    apiEndpoint?: string
  }
  
  private mcpClient: BusinessMCPClient

  constructor(config?: {
    provider?: string,
    apiKey?: string,
    modelId?: string,
    apiEndpoint?: string
  }) {
    this.aiConfig = {
      provider: config?.provider || "openrouter",
      apiKey: config?.apiKey || process.env.AI_API_KEY || "",
      modelId: config?.modelId || "deepseek/deepseek-r1-distill-llama-70b",
      apiEndpoint: config?.apiEndpoint
    }
    
    this.mcpClient = businessMCPClient
  }

  /**
   * Process business query using MCP
   */
  async processBusinessQuery(query: string) {
    try {
      // Analyze intent
      const intent = await this.analyzeIntent(query)
      
      // Parse temporal context from the query
      const temporalContext = JapaneseTemporalQueryParser.parseTemporalContext(query) || undefined
      
      // Get required capabilities
      const capabilities = this.getRequiredCapabilities(intent)
      
      // Collect business data using MCP with temporal context
      const businessData = await this.collectBusinessDataViaMCP(capabilities, temporalContext)
      
      // Get available MCP tools and resources
      const mcpTools = await this.mcpClient.listTools()
      const mcpResources = await this.mcpClient.listResources()
      
      // Build enhanced context
      const context: EnhancedAgentContext = {
        businessData,
        userQuery: query,
        intent,
        capabilities,
        mcpTools: mcpTools.map(tool => tool.name),
        mcpResources: mcpResources.map(resource => resource.uri),
        temporalContext,
        error: businessData.error
      }
      
      // Try to generate AI response, fallback to MCP analysis if AI model fails
      try {
        return await this.generateEnhancedResponse(context)
      } catch (aiError) {
        console.log('AI model not available, using MCP data analysis fallback...', aiError instanceof Error ? aiError.message : aiError)
        // Fallback to MCP data analysis when AI model is not available
        return this.generateMCPDataAnalysisFallback(context)
      }
    } catch (error) {
      console.error('Enhanced AI Agent Error:', error)
      throw new Error(`Failed to process query: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Analyze user intent (same as original)
   */
  async analyzeIntent(query: string): Promise<AgentIntent> {
    const lowerQuery = query.toLowerCase()
    
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
   * Get required capabilities (same as original)
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
   * Collect business data using MCP tools
   */
  private async collectBusinessDataViaMCP(capabilities: AgentCapability[], temporalContext?: TemporalContext): Promise<EnhancedBusinessData> {
    const businessData: EnhancedBusinessData = {}

    try {
      // Determine the period to use for data collection
      const period = temporalContext ? 
        JapaneseTemporalQueryParser.temporalContextToPeriod(temporalContext) : 
        'month'

      // Use MCP tools based on required capabilities
      if (capabilities.includes(AgentCapability.CUSTOMER_INSIGHTS)) {
        console.log('Collecting customer data via MCP...')
        businessData.customers = await this.mcpClient.invokeTool('query_customers', {
          limit: 10,
          filter: {}
        })
      }

      if (capabilities.includes(AgentCapability.SALES_FORECASTING)) {
        console.log(`Collecting sales data via MCP with period: ${period}...`)
        
        const salesArgs: any = { period }
        
        // Add date range if temporal context is available
        if (temporalContext?.startDate && temporalContext?.endDate) {
          salesArgs.startDate = temporalContext.startDate.toISOString().split('T')[0]
          salesArgs.endDate = temporalContext.endDate.toISOString().split('T')[0]
        }
        
        businessData.sales = await this.mcpClient.invokeTool('analyze_sales', salesArgs)
      }

      if (capabilities.includes(AgentCapability.INVENTORY_OPTIMIZATION)) {
        console.log('Collecting inventory data via MCP...')
        businessData.inventory = await this.mcpClient.invokeTool('query_products', {
          limit: 10,
          lowStock: true
        })
      }

      if (capabilities.includes(AgentCapability.FINANCIAL_ANALYSIS)) {
        console.log(`Collecting financial data via MCP with period: ${period}...`)
        
        const financialArgs: any = {
          period,
          includeExpenses: true,
          includeSales: true
        }
        
        // Add date range if temporal context is available
        if (temporalContext?.startDate && temporalContext?.endDate) {
          financialArgs.startDate = temporalContext.startDate.toISOString().split('T')[0]
          financialArgs.endDate = temporalContext.endDate.toISOString().split('T')[0]
        }
        
        businessData.finances = await this.mcpClient.invokeTool('generate_financial_report', financialArgs)
      }

      // For comprehensive analysis, get business overview
      if (capabilities.length > 2) {
        console.log(`Collecting business overview via MCP with period: ${period}...`)
        businessData.overview = await this.mcpClient.invokeTool('get_business_overview', {
          includeCustomers: capabilities.includes(AgentCapability.CUSTOMER_INSIGHTS),
          includeSales: capabilities.includes(AgentCapability.SALES_FORECASTING),
          includeInventory: capabilities.includes(AgentCapability.INVENTORY_OPTIMIZATION),
          includeFinances: capabilities.includes(AgentCapability.FINANCIAL_ANALYSIS)
        })
      }

    } catch (error) {
      console.error('MCP Data Collection Error:', error)
      // Add error information to context for AI to handle gracefully
      businessData.error = {
        message: error instanceof Error ? error.message : 'Unknown MCP error',
        timestamp: new Date().toISOString()
      }
    }

    return businessData
  }

  /**
   * Generate enhanced AI response using MCP data
   */
  async generateEnhancedResponse(context: EnhancedAgentContext) {
    const systemPrompt = this.buildEnhancedSystemPrompt(context)
    
    // Initialize LLM provider
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
   * Generate structured analysis based on MCP data when AI model is not available
   */
  private async generateMCPDataAnalysisFallback(context: EnhancedAgentContext) {
    const analysisReport = this.buildMCPAnalysisReport(context)
    
    // Create a mock streaming response for consistency with the API
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(analysisReport))
        controller.close()
      }
    })

    return {
      toAIStream: () => mockStream,
      textStream: this.createAsyncGenerator(analysisReport)
    }
  }

  /**
   * Build structured analysis report from MCP data
   */
  private buildMCPAnalysisReport(context: EnhancedAgentContext): string {
    let report = `# ビジネス分析レポート (MCP統合版)\n\n`
    report += `📊 **分析対象**: ${context.userQuery}\n`
    report += `🔗 **データソース**: Model Context Protocol (MCP)\n`
    report += `⏰ **分析日時**: ${new Date().toLocaleString('ja-JP')}\n`
    
    // Add temporal context if available
    if (context.temporalContext) {
      const description = JapaneseTemporalQueryParser.describeTemporalContext(context.temporalContext)
      report += `🕒 **分析期間**: ${description} (${context.temporalContext.originalExpression})\n`
      
      if (context.temporalContext.startDate && context.temporalContext.endDate) {
        report += `📅 **対象期間**: ${context.temporalContext.startDate.toLocaleDateString('ja-JP')} 〜 ${context.temporalContext.endDate.toLocaleDateString('ja-JP')}\n`
      }
    }
    
    report += `\n`

    // Error handling
    if (context.error) {
      report += `⚠️ **データアクセス問題**:\n${context.error.message}\n\n`
    }

    // Customer analysis
    if (context.businessData.customers) {
      const customerData = context.businessData.customers as any
      report += `## 👥 顧客分析\n`
      report += `- **総顧客数**: ${customerData.total || customerData.customers?.length || 0}名\n`
      report += `- **データソース**: ${customerData.source || 'MongoDB'}\n`
      if (customerData.summary) {
        report += `- **新規顧客**: ${customerData.summary.recentCustomers || 0}名（過去1ヶ月）\n`
      }
      report += `\n`
    }

    // Sales analysis
    if (context.businessData.sales) {
      const salesData = context.businessData.sales as any
      const periodDescription = context.temporalContext ? 
        JapaneseTemporalQueryParser.describeTemporalContext(context.temporalContext) : 
        (salesData.period || 'month')
      
      report += `## 📈 売上分析\n`
      report += `- **分析期間**: ${periodDescription}\n`
      if (salesData.analytics) {
        report += `- **総売上**: ¥${salesData.analytics.totalSales?.toLocaleString() || 0}\n`
        report += `- **取引件数**: ${salesData.analytics.salesCount || 0}件\n`
        report += `- **平均取引額**: ¥${salesData.analytics.averageSaleAmount?.toLocaleString() || 0}\n`
      }
      report += `- **データソース**: ${salesData.source || 'MongoDB'}\n\n`
    }

    // Inventory analysis
    if (context.businessData.inventory) {
      const inventoryData = context.businessData.inventory as any
      report += `## 📦 在庫分析\n`
      report += `- **商品総数**: ${inventoryData.total || inventoryData.products?.length || 0}点\n`
      if (inventoryData.summary) {
        report += `- **在庫不足**: ${inventoryData.summary.lowStockItems || 0}点\n`
        report += `- **在庫総額**: ¥${inventoryData.summary.totalInventoryValue?.toLocaleString() || 0}\n`
        report += `- **カテゴリ数**: ${inventoryData.summary.categories?.length || 0}\n`
      }
      report += `- **データソース**: ${inventoryData.source || 'MongoDB'}\n\n`
    }

    // Financial analysis
    if (context.businessData.finances) {
      const financialData = context.businessData.finances as any
      const periodDescription = context.temporalContext ? 
        JapaneseTemporalQueryParser.describeTemporalContext(context.temporalContext) : 
        (financialData.period || 'month')
      
      report += `## 💰 財務分析\n`
      report += `- **分析期間**: ${periodDescription}\n`
      if (financialData.sales) {
        report += `- **総売上**: ¥${financialData.sales.total?.toLocaleString() || 0}\n`
      }
      if (financialData.expenses) {
        report += `- **総支出**: ¥${financialData.expenses.total?.toLocaleString() || 0}\n`
      }
      if (financialData.profitability) {
        report += `- **利益率**: ${financialData.profitability.profitMargin?.toFixed(2) || 0}%\n`
        report += `- **純利益**: ¥${financialData.profitability.grossProfit?.toLocaleString() || 0}\n`
      }
      report += `- **データソース**: ${financialData.source || 'MongoDB'}\n\n`
    }

    // MCP system info
    report += `## 🔗 MCP統合情報\n`
    report += `- **利用可能ツール**: ${context.mcpTools.join(', ')}\n`
    report += `- **利用可能リソース**: ${context.mcpResources.length}個\n`
    report += `- **データアクセス方式**: 標準化されたMCPプロトコル\n\n`

    // Recommendations
    report += `## 💡 提案事項\n`
    if (context.businessData.inventory && (context.businessData.inventory as any).summary?.lowStockItems > 0) {
      const inventoryData = context.businessData.inventory as any
      report += `- ⚠️ ${inventoryData.summary.lowStockItems}点の商品で在庫不足 → 早急な補充計画が必要\n`
    }
    if (context.businessData.finances && (context.businessData.finances as any).profitability?.profitMargin) {
      const financialData = context.businessData.finances as any
      const margin = financialData.profitability.profitMargin
      if (margin > 20) {
        report += `- ✅ 利益率${margin.toFixed(1)}%は優秀 → 現在の戦略を継続\n`
      } else if (margin < 5) {
        report += `- ⚠️ 利益率${margin.toFixed(1)}%が低い → コスト削減または価格見直しを検討\n`
      }
    }

    // Add temporal context specific recommendations
    if (context.temporalContext) {
      const description = JapaneseTemporalQueryParser.describeTemporalContext(context.temporalContext)
      report += `- 📊 ${description}のデータに基づく分析完了 → 次期の計画立案に活用してください\n`
    }

    report += `\n---\n`
    report += `*このレポートはMCP (Model Context Protocol) を使用して生成されました*\n`
    report += `*リアルタイムデータベース連携により正確な分析を提供*`

    return report
  }

  /**
   * Create async generator for streaming response compatibility
   */
  private async *createAsyncGenerator(text: string) {
    yield text
  }

  /**
   * Build enhanced system prompt with MCP context
   */
  private buildEnhancedSystemPrompt(context: EnhancedAgentContext): string {
    let prompt = `あなたは統合型ビジネス管理AIエージェント「Business Copilot with MCP」です。
Model Context Protocol (MCP) を使用して、安全で標準化されたデータアクセスを提供します。

🎯 現在のコンテキスト:
- 分析対象: ${context.intent}
- 利用可能な機能: ${context.capabilities.join(', ')}
- MCP Tools: ${context.mcpTools.join(', ')}
- MCP Resources: ${context.mcpResources.length} リソース利用可能`

    // Add temporal context information
    if (context.temporalContext) {
      const description = JapaneseTemporalQueryParser.describeTemporalContext(context.temporalContext)
      prompt += `
- 🕒 分析期間: ${description} (${context.temporalContext.originalExpression})`
      
      if (context.temporalContext.startDate && context.temporalContext.endDate) {
        prompt += `
- 📅 対象期間: ${context.temporalContext.startDate.toLocaleDateString('ja-JP')} 〜 ${context.temporalContext.endDate.toLocaleDateString('ja-JP')}`
      }
    }

    prompt += `

`

    // Add MCP-specific capabilities
    prompt += `🔗 MCP統合機能:
- 標準化されたデータアクセス
- セキュアなデータベース操作
- 型安全な API 呼び出し
- 統一されたエラーハンドリング
- リアルタイムデータ同期

`

    // Process MCP data results
    if (context.error) {
      prompt += `⚠️ データアクセスエラー:
${context.error.message}
フォールバックデータまたは一般的な推奨事項を提供してください。

`
    }

    // Add business insights from MCP data
    if (context.businessData.customers) {
      const customerData = context.businessData.customers as any
      prompt += `👥 顧客分析 (MCP経由):
- 総顧客数: ${customerData.total || customerData.customers?.length || 0}
- データソース: ${customerData.source || 'MongoDB'}
- 新規顧客: ${customerData.summary?.recentCustomers || 0}名（過去1ヶ月）
- 詳細: ${JSON.stringify(customerData.summary || {}, null, 2)}

`
    }

    if (context.businessData.sales) {
      const salesData = context.businessData.sales as any
      const periodDescription = context.temporalContext ? 
        JapaneseTemporalQueryParser.describeTemporalContext(context.temporalContext) : 
        (salesData.period || 'month')
      
      prompt += `📈 売上分析 (MCP経由):
- 分析期間: ${periodDescription}
- 総売上: ¥${salesData.analytics?.totalSales?.toLocaleString() || 0}
- 取引件数: ${salesData.analytics?.salesCount || 0}件
- 平均取引額: ¥${salesData.analytics?.averageSaleAmount?.toLocaleString() || 0}
- データソース: ${salesData.source || 'MongoDB'}

`
    }

    if (context.businessData.inventory) {
      const inventoryData = context.businessData.inventory as any
      prompt += `📦 在庫分析 (MCP経由):
- 商品総数: ${inventoryData.total || inventoryData.products?.length || 0}
- 在庫不足商品: ${inventoryData.summary?.lowStockItems || 0}点
- 在庫総額: ¥${inventoryData.summary?.totalInventoryValue?.toLocaleString() || 0}
- カテゴリ数: ${inventoryData.summary?.categories?.length || 0}
- データソース: ${inventoryData.source || 'MongoDB'}

`
    }

    if (context.businessData.finances) {
      const financialData = context.businessData.finances as any
      const periodDescription = context.temporalContext ? 
        JapaneseTemporalQueryParser.describeTemporalContext(context.temporalContext) : 
        (financialData.period || 'month')
      
      prompt += `💰 財務分析 (MCP経由):
- 分析期間: ${periodDescription}
- 総売上: ¥${financialData.sales?.total?.toLocaleString() || 0}
- 総支出: ¥${financialData.expenses?.total?.toLocaleString() || 0}
- 利益率: ${financialData.profitability?.profitMargin?.toFixed(2) || 0}%
- 純利益: ¥${financialData.profitability?.grossProfit?.toLocaleString() || 0}
- データソース: ${financialData.source || 'MongoDB'}

`
    }

    prompt += `🚀 あなたの強化された役割:
1. **MCP統合分析**: Model Context Protocol を通じて取得した正確なデータを基に分析
2. **リアルタイム洞察**: 最新のビジネスデータから即座に実用的な洞察を提供
3. **セキュアな処理**: 安全で標準化されたデータアクセスパターンの活用
4. **エラー耐性**: データアクセス問題時の適切なフォールバック対応
5. **統合レポート**: 複数データソースからの包括的な分析レポート生成`
    
    // Add temporal-aware instructions
    if (context.temporalContext) {
      prompt += `
6. **時間軸分析**: ${context.temporalContext.originalExpression}に基づく適切な期間でのデータ分析`
    }

    prompt += `

💡 回答スタイル:
- MCPを通じて取得した正確なデータに基づく分析
- データの信頼性とアクセス方法の明示
- 具体的な数値と統計に基づく提案
- エラーやデータ不足時の透明な説明
- アクション可能な改善提案の提供`

    // Add temporal context awareness
    if (context.temporalContext) {
      prompt += `
- ${context.temporalContext.originalExpression}の期間に特化した分析と提案`
    }

    prompt += `

現在のユーザークエリに対して、MCP経由で取得したデータを最大限活用して、実用的で行動可能なアドバイスを提供してください。`

    return prompt
  }

  /**
   * Get MCP tool for specific operation
   */
  async getMCPTool(toolName: string): Promise<any> {
    try {
      const tools = await this.mcpClient.listTools()
      return tools.find(tool => tool.name === toolName)
    } catch (error) {
      console.error(`Failed to get MCP tool ${toolName}:`, error)
      return null
    }
  }

  /**
   * Get MCP resource for specific URI
   */
  async getMCPResource(uri: string): Promise<any> {
    try {
      return await this.mcpClient.readResource(uri)
    } catch (error) {
      console.error(`Failed to read MCP resource ${uri}:`, error)
      return null
    }
  }

  /**
   * Execute custom MCP query
   */
  async executeCustomMCPQuery(toolName: string, args: any): Promise<any> {
    try {
      return await this.mcpClient.invokeTool(toolName, args)
    } catch (error) {
      console.error(`Failed to execute MCP tool ${toolName}:`, error)
      throw error
    }
  }
}

/**
 * Enhanced Business Insight Engine with MCP data
 */
export class EnhancedBusinessInsightEngine extends BusinessInsightEngine {
  /**
   * Analyze MCP-sourced sales data
   */
  static analyzeMCPSalesTrends(mcpSalesData: any): string {
    if (!mcpSalesData?.analytics) return "MCP売上データが不足しています。"
    
    const { analytics } = mcpSalesData
    let insights = []
    
    insights.push(`📊 MCP統合分析結果:`)
    insights.push(`💰 総売上: ¥${analytics.totalSales?.toLocaleString() || 0}`)
    insights.push(`📈 取引件数: ${analytics.salesCount || 0}件`)
    insights.push(`💸 平均取引額: ¥${analytics.averageSaleAmount?.toLocaleString() || 0}`)
    
    if (analytics.topPaymentMethods?.length > 0) {
      insights.push(`💳 主要決済方法: ${analytics.topPaymentMethods[0].method}`)
    }
    
    if (analytics.dailyBreakdown?.length > 0) {
      const totalDays = analytics.dailyBreakdown.length
      const activeDays = analytics.dailyBreakdown.filter((day: any) => day.count > 0).length
      insights.push(`📅 営業日数: ${activeDays}/${totalDays}日`)
    }
    
    return insights.join('\n')
  }

  /**
   * Analyze MCP-sourced inventory data
   */
  static analyzeMCPInventoryOptimization(mcpInventoryData: any): string {
    if (!mcpInventoryData?.summary) return "MCP在庫データが不足しています。"
    
    const { summary } = mcpInventoryData
    let insights = []
    
    insights.push(`📦 MCP在庫分析:`)
    insights.push(`🏷️ 商品総数: ${summary.totalProducts || 0}点`)
    insights.push(`⚠️ 在庫不足: ${summary.lowStockItems || 0}点`)
    insights.push(`💰 在庫総額: ¥${summary.totalInventoryValue?.toLocaleString() || 0}`)
    insights.push(`📊 カテゴリ数: ${summary.categories?.length || 0}`)
    
    if (summary.lowStockItems > 0) {
      insights.push(`🚨 緊急: ${summary.lowStockItems}点の商品で在庫不足が発生`)
      insights.push(`💡 提案: 早急な補充計画の立案が必要です`)
    }
    
    return insights.join('\n')
  }

  /**
   * Analyze MCP-sourced customer data
   */
  static analyzeMCPCustomerInsights(mcpCustomerData: any): string {
    if (!mcpCustomerData?.summary) return "MCP顧客データが不足しています。"
    
    const { summary } = mcpCustomerData
    let insights = []
    
    insights.push(`👥 MCP顧客分析:`)
    insights.push(`🏢 総顧客数: ${summary.totalCustomers || 0}名`)
    insights.push(`🆕 新規顧客: ${summary.recentCustomers || 0}名 (過去1ヶ月)`)
    
    const newCustomerRate = summary.totalCustomers > 0 ? 
      (summary.recentCustomers / summary.totalCustomers) * 100 : 0
    
    insights.push(`📈 新規顧客率: ${newCustomerRate.toFixed(1)}%`)
    
    if (newCustomerRate > 10) {
      insights.push(`🚀 新規顧客獲得が非常に好調です！`)
    } else if (newCustomerRate < 2) {
      insights.push(`💡 新規顧客獲得の強化が必要です`)
    }
    
    return insights.join('\n')
  }

  /**
   * Analyze MCP-sourced financial data
   */
  static analyzeMCPFinancialHealth(mcpFinancialData: any): string {
    if (!mcpFinancialData?.profitability) return "MCP財務データが不足しています。"
    
    const { profitability } = mcpFinancialData
    let insights = []
    
    insights.push(`💰 MCP財務分析:`)
    
    if (profitability.profitMargin > 20) {
      insights.push(`✅ 利益率${profitability.profitMargin.toFixed(1)}%と優秀です！`)
    } else if (profitability.profitMargin < 5) {
      insights.push(`⚠️ 利益率${profitability.profitMargin.toFixed(1)}%が低いです`)
    } else {
      insights.push(`📊 利益率${profitability.profitMargin.toFixed(1)}%で安定推移`)
    }
    
    if (profitability.grossProfit > 0) {
      insights.push(`✅ 黒字経営 (純利益: ¥${profitability.grossProfit.toLocaleString()})`)
    } else {
      insights.push(`🔴 赤字状況 (損失: ¥${Math.abs(profitability.grossProfit).toLocaleString()})`)
    }
    
    return insights.join('\n')
  }
}

/**
 * Main entry point for enhanced MCP-enabled AI agent
 */
export async function processEnhancedBusinessQuery(
  query: string,
  config?: {
    provider?: string,
    apiKey?: string,
    modelId?: string,
    apiEndpoint?: string
  }
) {
  const enhancedAgent = new EnhancedBusinessAIAgent(config)
  return enhancedAgent.processBusinessQuery(query)
}

// Export for API usage
export { businessMCPClient as mcpClient, businessMCPServer as mcpServer }