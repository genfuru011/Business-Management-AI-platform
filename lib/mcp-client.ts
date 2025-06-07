/**
 * MCP Client for Business AI Agent
 * Model Context Protocol クライアント実装
 */

import { spawn } from 'child_process'
import { EventEmitter } from 'events'

export interface MCPTool {
  name: string
  description: string
  inputSchema: any
}

export interface MCPToolResult {
  success: boolean
  data?: any
  error?: string
  message?: string
}

export class MCPClient extends EventEmitter {
  private serverProcess: any = null
  private isConnected: boolean = false
  private requestId: number = 0
  private pendingRequests: Map<number, any> = new Map()

  constructor(private serverScript: string = 'scripts/mcp-server.cjs') {
    super()
  }

  /**
   * MCPサーバーに接続
   */
  async connect(): Promise<boolean> {
    try {
      console.log('🔗 MCPサーバーに接続中...')
      
      this.serverProcess = spawn('node', [this.serverScript], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      })

      this.serverProcess.stdout.on('data', (data) => {
        this.handleServerMessage(data.toString())
      })

      this.serverProcess.stderr.on('data', (data) => {
        console.error('MCP Server Error:', data.toString())
      })

      this.serverProcess.on('close', (code) => {
        console.log(`MCPサーバーが終了しました (code: ${code})`)
        this.isConnected = false
        this.emit('disconnected')
      })

      // 接続確認
      await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        clientInfo: {
          name: 'business-ai-agent',
          version: '1.0.0'
        }
      })

      this.isConnected = true
      console.log('✅ MCPサーバーへの接続が完了しました')
      return true

    } catch (error) {
      console.error('❌ MCPサーバー接続エラー:', error)
      return false
    }
  }

  /**
   * 利用可能なツール一覧を取得
   */
  async getAvailableTools(): Promise<MCPTool[]> {
    if (!this.isConnected) {
      throw new Error('MCPサーバーに接続されていません')
    }

    try {
      const response = await this.sendRequest('tools/list', {})
      return response.tools || []
    } catch (error) {
      console.error('ツール一覧取得エラー:', error)
      return []
    }
  }

  /**
   * ツールを実行
   */
  async callTool(name: string, args: any = {}): Promise<MCPToolResult> {
    if (!this.isConnected) {
      console.log('⚠️ MCPサーバーに接続されていません。JSONフォールバックモードを使用します')
      return this.fallbackToolCall(name, args)
    }

    try {
      console.log(`🔧 MCPツール実行: ${name}`, args)
      
      const response = await this.sendRequest('tools/call', {
        name,
        arguments: args
      })

      if (response.content && response.content.length > 0) {
        const content = response.content[0]
        if (content.type === 'text') {
          const result = JSON.parse(content.text)
          console.log(`✅ MCPツール実行完了: ${name}`)
          return result
        }
      }

      return {
        success: false,
        error: 'Invalid response format',
        message: `ツール ${name} の実行に失敗しました`
      }

    } catch (error) {
      console.error(`❌ MCPツール実行エラー (${name}):`, error)
      // エラー時はフォールバックモードを使用
      return this.fallbackToolCall(name, args)
    }
  }

  /**
   * MCPサーバーリクエスト送信
   */
  private async sendRequest(method: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params
      }

      this.pendingRequests.set(id, { resolve, reject })

      // タイムアウト設定
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(new Error(`Request timeout: ${method}`))
        }
      }, 30000) // 30秒タイムアウト

      this.serverProcess.stdin.write(JSON.stringify(request) + '\n')
    })
  }

  /**
   * サーバーからのメッセージ処理
   */
  private handleServerMessage(data: string) {
    const lines = data.trim().split('\n')
    
    for (const line of lines) {
      if (!line.trim()) continue
      
      try {
        const message = JSON.parse(line)
        
        if (message.id && this.pendingRequests.has(message.id)) {
          const pending = this.pendingRequests.get(message.id)
          this.pendingRequests.delete(message.id)
          
          if (message.error) {
            pending.reject(new Error(message.error.message || 'MCP Server Error'))
          } else {
            pending.resolve(message.result)
          }
        }
      } catch (error) {
        console.error('MCPメッセージ解析エラー:', error, 'Data:', line)
      }
    }
  }

  /**
   * JSONファイルを使用したフォールバック実装
   */
  private async fallbackToolCall(name: string, args: any): Promise<MCPToolResult> {
    try {
      const fs = require('fs')
      const path = require('path')
      const dataDir = path.join(process.cwd(), 'data')

      console.log(`📁 JSONフォールバックモード: ${name}`)

      switch (name) {
        case 'get_customers':
          const customers = this.loadJsonData(path.join(dataDir, 'customers.json'))
          const filteredCustomers = args.filter ? 
            customers.filter((c: any) => 
              c.name?.toLowerCase().includes(args.filter.toLowerCase()) ||
              c.company?.toLowerCase().includes(args.filter.toLowerCase())
            ) : customers
          return {
            success: true,
            data: filteredCustomers.slice(0, args.limit || 50),
            message: `${filteredCustomers.length}件の顧客データを取得しました (JSON)`
          }

        case 'get_products':
          const products = this.loadJsonData(path.join(dataDir, 'products.json'))
          const filteredProducts = args.category ? 
            products.filter((p: any) => 
              p.category?.toLowerCase().includes(args.category.toLowerCase())
            ) : products
          return {
            success: true,
            data: filteredProducts.slice(0, args.limit || 50),
            message: `${filteredProducts.length}件の商品データを取得しました (JSON)`
          }

        case 'get_sales_data':
          const sales = this.loadJsonData(path.join(dataDir, 'sales.json'))
          let filteredSales = sales
          if (args.startDate || args.endDate) {
            filteredSales = sales.filter((s: any) => {
              const saleDate = new Date(s.saleDate || s.date || s.createdAt)
              if (args.startDate && saleDate < new Date(args.startDate)) return false
              if (args.endDate && saleDate > new Date(args.endDate)) return false
              return true
            })
          }
          return {
            success: true,
            data: filteredSales,
            message: `${filteredSales.length}件の売上データを取得しました (JSON)`
          }

        case 'get_financial_summary':
          const salesData = this.loadJsonData(path.join(dataDir, 'sales.json'))
          const financesData = this.loadJsonData(path.join(dataDir, 'finances.json'))
          
          const totalRevenue = salesData.reduce((sum: number, sale: any) => sum + (sale.amount || sale.totalAmount || 0), 0)
          const expenses = financesData.filter((f: any) => f.type === 'expense')
          const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0)
          const netProfit = totalRevenue - totalExpenses
          const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
          
          return {
            success: true,
            data: {
              totalRevenue,
              totalExpenses,
              netProfit,
              profitMargin: Math.round(profitMargin * 100) / 100,
              salesCount: salesData.length,
              expenseCount: expenses.length,
              averageSaleAmount: salesData.length > 0 ? totalRevenue / salesData.length : 0
            },
            message: '財務サマリーを生成しました (JSON)'
          }

        case 'search_business_data':
          const allCustomers = this.loadJsonData(path.join(dataDir, 'customers.json'))
          const allProducts = this.loadJsonData(path.join(dataDir, 'products.json'))
          const allSales = this.loadJsonData(path.join(dataDir, 'sales.json'))
          
          const query = args.query.toLowerCase()
          const searchResults = {
            customers: allCustomers.filter((c: any) => 
              c.name?.toLowerCase().includes(query) ||
              c.company?.toLowerCase().includes(query)
            ).slice(0, 10),
            products: allProducts.filter((p: any) => 
              p.name?.toLowerCase().includes(query) ||
              p.category?.toLowerCase().includes(query)
            ).slice(0, 10),
            sales: allSales.filter((s: any) => 
              s.notes?.toLowerCase().includes(query)
            ).slice(0, 10)
          }
          
          return {
            success: true,
            data: searchResults,
            message: `検索クエリ「${args.query}」で ${searchResults.customers.length} 件の顧客、${searchResults.products.length} 件の商品、${searchResults.sales.length} 件の売上が見つかりました (JSON)`
          }

        default:
          return {
            success: false,
            error: `Unknown tool: ${name}`,
            message: `未知のツール: ${name}`
          }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `フォールバック実行エラー: ${name}`
      }
    }
  }

  /**
   * JSONファイル読み込み
   */
  private loadJsonData(filePath: string): any[] {
    try {
      const fs = require('fs')
      if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(rawData)
      }
      return []
    } catch (error) {
      console.error(`JSONファイル読み込みエラー: ${filePath}`, error)
      return []
    }
  }

  /**
   * 接続を切断
   */
  async disconnect(): Promise<void> {
    if (this.serverProcess) {
      this.serverProcess.kill()
      this.serverProcess = null
    }
    this.isConnected = false
    this.pendingRequests.clear()
    console.log('🔌 MCPサーバーから切断しました')
  }

  /**
   * 接続状態を確認
   */
  isConnectedToServer(): boolean {
    return this.isConnected
  }
}

// シングルトンインスタンス
let mcpClientInstance: MCPClient | null = null

export function getMCPClient(): MCPClient {
  if (!mcpClientInstance) {
    mcpClientInstance = new MCPClient()
  }
  return mcpClientInstance
}
