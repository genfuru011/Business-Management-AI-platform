/**
 * MCP (Model Context Protocol) Server for Database Operations
 * 
 * This module provides a standardized interface for AI agents to interact
 * with the business management database through MCP protocol.
 */

import { z } from 'zod'
import dbConnect, { getJsonData } from './database'
import { Customer, Product, Sale, Invoice, Expense } from './models'

// MCP Protocol Types
export interface MCPResource {
  uri: string
  name: string
  description: string
  mimeType?: string
}

export interface MCPTool {
  name: string
  description: string
  inputSchema: z.ZodSchema
}

export interface MCPRequest {
  method: string
  params: {
    name?: string
    arguments?: any
    uri?: string
  }
}

export interface MCPResponse {
  result?: any
  error?: {
    code: number
    message: string
  }
}

// Database operation schemas
const CustomerQuerySchema = z.object({
  limit: z.number().optional().default(10),
  filter: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    company: z.string().optional()
  }).optional()
})

const SalesAnalysisSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

const ProductQuerySchema = z.object({
  limit: z.number().optional().default(10),
  category: z.string().optional(),
  lowStock: z.boolean().optional()
})

const FinancialReportSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
  includeExpenses: z.boolean().default(true),
  includeSales: z.boolean().default(true)
})

/**
 * MCP Server for Business Database Operations
 */
export class BusinessDatabaseMCPServer {
  private resources: MCPResource[] = [
    {
      uri: 'business://database/customers',
      name: 'Customer Database',
      description: 'Access to customer data and management operations',
      mimeType: 'application/json'
    },
    {
      uri: 'business://database/products',
      name: 'Product Database',
      description: 'Access to product catalog and inventory data',
      mimeType: 'application/json'
    },
    {
      uri: 'business://database/sales',
      name: 'Sales Database',
      description: 'Access to sales transactions and analytics',
      mimeType: 'application/json'
    },
    {
      uri: 'business://database/finances',
      name: 'Financial Database',
      description: 'Access to financial data and reports',
      mimeType: 'application/json'
    }
  ]

  private tools: MCPTool[] = [
    {
      name: 'query_customers',
      description: 'Search and retrieve customer data with optional filtering',
      inputSchema: CustomerQuerySchema
    },
    {
      name: 'analyze_sales',
      description: 'Perform sales analysis for specified time period',
      inputSchema: SalesAnalysisSchema
    },
    {
      name: 'query_products',
      description: 'Retrieve product data with inventory information',
      inputSchema: ProductQuerySchema
    },
    {
      name: 'generate_financial_report',
      description: 'Generate comprehensive financial reports',
      inputSchema: FinancialReportSchema
    },
    {
      name: 'get_business_overview',
      description: 'Get a comprehensive overview of business metrics',
      inputSchema: z.object({
        includeCustomers: z.boolean().optional().default(true),
        includeSales: z.boolean().optional().default(true),
        includeInventory: z.boolean().optional().default(true),
        includeFinances: z.boolean().optional().default(true)
      })
    }
  ]

  /**
   * Handle MCP requests
   */
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      switch (request.method) {
        case 'resources/list':
          return { result: { resources: this.resources } }
        
        case 'tools/list':
          return { result: { tools: this.tools } }
        
        case 'tools/call':
          return await this.handleToolCall(request.params.name!, request.params.arguments)
        
        case 'resources/read':
          return await this.handleResourceRead(request.params.uri!)
        
        default:
          return {
            error: {
              code: -32601,
              message: `Method not found: ${request.method}`
            }
          }
      }
    } catch (error) {
      return {
        error: {
          code: -32603,
          message: `Internal error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }
    }
  }

  /**
   * Handle tool execution
   */
  private async handleToolCall(toolName: string, args: any): Promise<MCPResponse> {
    switch (toolName) {
      case 'query_customers':
        return { result: await this.queryCustomers(args) }
      
      case 'analyze_sales':
        return { result: await this.analyzeSales(args) }
      
      case 'query_products':
        return { result: await this.queryProducts(args) }
      
      case 'generate_financial_report':
        return { result: await this.generateFinancialReport(args) }
      
      case 'get_business_overview':
        return { result: await this.getBusinessOverview(args) }
      
      default:
        return {
          error: {
            code: -32602,
            message: `Unknown tool: ${toolName}`
          }
        }
    }
  }

  /**
   * Handle resource reading
   */
  private async handleResourceRead(uri: string): Promise<MCPResponse> {
    const resourceMap: Record<string, () => Promise<any>> = {
      'business://database/customers': () => this.queryCustomers({ limit: 100 }),
      'business://database/products': () => this.queryProducts({ limit: 100 }),
      'business://database/sales': () => this.analyzeSales({ period: 'month' }),
      'business://database/finances': () => this.generateFinancialReport({ 
        period: 'month',
        includeExpenses: true,
        includeSales: true
      })
    }

    const handler = resourceMap[uri]
    if (!handler) {
      return {
        error: {
          code: -32602,
          message: `Unknown resource: ${uri}`
        }
      }
    }

    try {
      const data = await handler()
      return {
        result: {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(data, null, 2)
          }]
        }
      }
    } catch (error) {
      return {
        error: {
          code: -32603,
          message: `Failed to read resource: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }
    }
  }

  /**
   * Query customers with optional filtering
   */
  private async queryCustomers(args: z.infer<typeof CustomerQuerySchema>) {
    try {
      await dbConnect()
      
      const { limit, filter } = CustomerQuerySchema.parse(args)
      let query: any = {}
      
      if (filter) {
        if (filter.name) query.name = new RegExp(filter.name, 'i')
        if (filter.email) query.email = new RegExp(filter.email, 'i')
        if (filter.company) query.company = new RegExp(filter.company, 'i')
      }
      
      const customers = await Customer.find(query)
        .limit(limit)
        .sort({ createdAt: -1 })
        .select('name email company phone createdAt')
        .lean()
      
      return {
        customers,
        total: await Customer.countDocuments(query),
        summary: {
          totalCustomers: customers.length,
          recentCustomers: customers.filter(c => {
            const oneMonthAgo = new Date()
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
            return new Date(c.createdAt) > oneMonthAgo
          }).length
        }
      }
    } catch (error) {
      // Fallback to JSON data
      const jsonData = getJsonData('customers.json') || []
      const { limit } = CustomerQuerySchema.parse(args)
      
      return {
        customers: jsonData.slice(0, limit),
        total: jsonData.length,
        summary: {
          totalCustomers: jsonData.length,
          recentCustomers: 0
        },
        source: 'json-fallback'
      }
    }
  }

  /**
   * Analyze sales data for specified period
   */
  private async analyzeSales(args: z.infer<typeof SalesAnalysisSchema>) {
    try {
      await dbConnect()
      
      const { period, startDate, endDate } = SalesAnalysisSchema.parse(args)
      
      // Calculate date range based on period
      const now = new Date()
      let start = new Date()
      
      switch (period) {
        case 'day':
          start.setDate(now.getDate() - 1)
          break
        case 'week':
          start.setDate(now.getDate() - 7)
          break
        case 'month':
          start.setMonth(now.getMonth() - 1)
          break
        case 'year':
          start.setFullYear(now.getFullYear() - 1)
          break
      }
      
      if (startDate) start = new Date(startDate)
      const end = endDate ? new Date(endDate) : now
      
      const sales = await Sale.find({
        saleDate: { $gte: start, $lte: end }
      }).populate('customer').lean()
      
      const totalSales = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
      const avgSaleAmount = sales.length > 0 ? totalSales / sales.length : 0
      
      return {
        period,
        dateRange: { start, end },
        sales: sales.slice(0, 20), // Limit for performance
        analytics: {
          totalSales,
          salesCount: sales.length,
          averageSaleAmount: avgSaleAmount,
          topPaymentMethods: this.getTopPaymentMethods(sales),
          dailyBreakdown: this.getDailyBreakdown(sales, start, end)
        }
      }
    } catch (error) {
      // Fallback to JSON data
      const jsonData = getJsonData('sales.json') || []
      const { period } = SalesAnalysisSchema.parse(args)
      
      return {
        period,
        sales: jsonData.slice(0, 20),
        analytics: {
          totalSales: jsonData.reduce((sum: number, sale: any) => sum + (sale.amount || 0), 0),
          salesCount: jsonData.length,
          averageSaleAmount: 0,
          topPaymentMethods: [],
          dailyBreakdown: []
        },
        source: 'json-fallback'
      }
    }
  }

  /**
   * Query products with inventory information
   */
  private async queryProducts(args: z.infer<typeof ProductQuerySchema>) {
    try {
      await dbConnect()
      
      const { limit, category, lowStock } = ProductQuerySchema.parse(args)
      let query: any = { isActive: true }
      
      if (category) query.category = new RegExp(category, 'i')
      if (lowStock) query.stock = { $lt: 10 }
      
      const products = await Product.find(query)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
      
      return {
        products,
        total: await Product.countDocuments(query),
        summary: {
          totalProducts: products.length,
          lowStockItems: products.filter(p => p.stock < 10).length,
          totalInventoryValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
          categories: [...new Set(products.map(p => p.category).filter(Boolean))]
        }
      }
    } catch (error) {
      // Fallback to JSON data
      const jsonData = getJsonData('products.json') || []
      const { limit } = ProductQuerySchema.parse(args)
      
      return {
        products: jsonData.slice(0, limit),
        total: jsonData.length,
        summary: {
          totalProducts: jsonData.length,
          lowStockItems: 0,
          totalInventoryValue: 0,
          categories: []
        },
        source: 'json-fallback'
      }
    }
  }

  /**
   * Generate comprehensive financial report
   */
  private async generateFinancialReport(args: z.infer<typeof FinancialReportSchema>) {
    try {
      await dbConnect()
      
      const { period, includeExpenses, includeSales } = FinancialReportSchema.parse(args)
      
      const now = new Date()
      let start = new Date()
      
      switch (period) {
        case 'day':
          start.setDate(now.getDate() - 1)
          break
        case 'week':
          start.setDate(now.getDate() - 7)
          break
        case 'month':
          start.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          start.setMonth(now.getMonth() - 3)
          break
        case 'year':
          start.setFullYear(now.getFullYear() - 1)
          break
      }
      
      const result: any = { period, dateRange: { start, end: now } }
      
      if (includeSales) {
        const sales = await Sale.find({
          saleDate: { $gte: start, $lte: now }
        }).lean()
        
        result.sales = {
          total: sales.reduce((sum, sale) => sum + (sale.amount || 0), 0),
          count: sales.length,
          average: sales.length > 0 ? sales.reduce((sum, sale) => sum + (sale.amount || 0), 0) / sales.length : 0
        }
      }
      
      if (includeExpenses) {
        const expenses = await Expense.find({
          date: { $gte: start, $lte: now }
        }).lean()
        
        result.expenses = {
          total: expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
          count: expenses.length,
          byCategory: this.groupExpensesByCategory(expenses)
        }
      }
      
      if (includeSales && includeExpenses) {
        result.profitability = {
          grossProfit: (result.sales?.total || 0) - (result.expenses?.total || 0),
          profitMargin: result.sales?.total > 0 ? 
            ((result.sales.total - (result.expenses?.total || 0)) / result.sales.total) * 100 : 0
        }
      }
      
      return result
    } catch (error) {
      // Fallback to JSON data
      const salesData = getJsonData('sales.json') || []
      const financesData = getJsonData('finances.json') || []
      const { period } = FinancialReportSchema.parse(args)
      
      return {
        period,
        sales: {
          total: salesData.reduce((sum: number, sale: any) => sum + (sale.amount || 0), 0),
          count: salesData.length,
          average: 0
        },
        expenses: {
          total: financesData.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0),
          count: financesData.length,
          byCategory: {}
        },
        source: 'json-fallback'
      }
    }
  }

  /**
   * Get comprehensive business overview
   */
  private async getBusinessOverview(args: any) {
    const overview: any = {}
    
    if (args.includeCustomers) {
      overview.customers = await this.queryCustomers({ limit: 5 })
    }
    
    if (args.includeSales) {
      overview.sales = await this.analyzeSales({ period: 'month' })
    }
    
    if (args.includeInventory) {
      overview.inventory = await this.queryProducts({ limit: 10, lowStock: true })
    }
    
    if (args.includeFinances) {
      overview.finances = await this.generateFinancialReport({ 
        period: 'month',
        includeExpenses: true,
        includeSales: true
      })
    }
    
    return overview
  }

  // Helper methods
  private getTopPaymentMethods(sales: any[]): Array<{ method: string; count: number; total: number }> {
    const methods = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod || 'unknown'
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 }
      }
      acc[method].count++
      acc[method].total += sale.amount || 0
      return acc
    }, {} as Record<string, { count: number; total: number }>)
    
    return Object.entries(methods)
      .map(([method, data]) => ({ 
        method, 
        count: (data as { count: number; total: number }).count, 
        total: (data as { count: number; total: number }).total 
      }))
      .sort((a, b) => b.total - a.total)
  }

  private getDailyBreakdown(sales: any[], start: Date, end: Date): Array<{ date: string; sales: number; count: number }> {
    const breakdown: Record<string, { sales: number; count: number }> = {}
    
    // Initialize all days in range
    const current = new Date(start)
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0]
      breakdown[dateStr] = { sales: 0, count: 0 }
      current.setDate(current.getDate() + 1)
    }
    
    // Fill with actual sales data
    sales.forEach(sale => {
      const dateStr = new Date(sale.saleDate).toISOString().split('T')[0]
      if (breakdown[dateStr]) {
        breakdown[dateStr].sales += sale.amount || 0
        breakdown[dateStr].count++
      }
    })
    
    return Object.entries(breakdown)
      .map(([date, data]) => ({ 
        date, 
        sales: (data as { sales: number; count: number }).sales, 
        count: (data as { sales: number; count: number }).count 
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private groupExpensesByCategory(expenses: any[]): Record<string, { total: number; count: number }> {
    return expenses.reduce((acc, expense) => {
      const category = expense.category || 'uncategorized'
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0 }
      }
      acc[category].total += expense.amount || 0
      acc[category].count++
      return acc
    }, {} as Record<string, { total: number; count: number }>)
  }
}

/**
 * MCP Client for AI Agent Integration
 */
export class BusinessMCPClient {
  constructor(private server: BusinessDatabaseMCPServer) {}

  /**
   * Invoke a tool through MCP
   */
  async invokeTool(name: string, args?: any): Promise<any> {
    const response = await this.server.handleRequest({
      method: 'tools/call',
      params: { name, arguments: args }
    })
    
    if (response.error) {
      throw new Error(`MCP Tool Error: ${response.error.message}`)
    }
    
    return response.result
  }

  /**
   * Read a resource through MCP
   */
  async readResource(uri: string): Promise<any> {
    const response = await this.server.handleRequest({
      method: 'resources/read',
      params: { uri }
    })
    
    if (response.error) {
      throw new Error(`MCP Resource Error: ${response.error.message}`)
    }
    
    return response.result
  }

  /**
   * List available tools
   */
  async listTools(): Promise<MCPTool[]> {
    const response = await this.server.handleRequest({
      method: 'tools/list',
      params: {}
    })
    
    if (response.error) {
      throw new Error(`MCP Error: ${response.error.message}`)
    }
    
    return response.result.tools
  }

  /**
   * List available resources
   */
  async listResources(): Promise<MCPResource[]> {
    const response = await this.server.handleRequest({
      method: 'resources/list',
      params: {}
    })
    
    if (response.error) {
      throw new Error(`MCP Error: ${response.error.message}`)
    }
    
    return response.result.resources
  }
}

// Export singleton instances
export const businessMCPServer = new BusinessDatabaseMCPServer()
export const businessMCPClient = new BusinessMCPClient(businessMCPServer)