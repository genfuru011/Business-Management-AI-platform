#!/usr/bin/env node

/**
 * MCP Server for Business Management AI Platform
 * Model Context Protocol サーバー実装
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js')
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js')
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

// 環境変数の設定
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/business-management'
const USE_JSON_FALLBACK = process.env.USE_JSON_FALLBACK === 'true'
const DATA_DIR = path.join(process.cwd(), 'data')
const MCP_LOG_LEVEL = process.env.MCP_LOG_LEVEL || 'info'

// ログ機能
const log = {
  info: (msg) => MCP_LOG_LEVEL === 'info' && console.error(`[MCP INFO] ${msg}`),
  error: (msg) => console.error(`[MCP ERROR] ${msg}`),
  debug: (msg) => MCP_LOG_LEVEL === 'debug' && console.error(`[MCP DEBUG] ${msg}`)
}

// MongoDBスキーマ定義（簡略版）
const CustomerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  company: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  notes: String,
  createdAt: { type: Date, default: Date.now }
})

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  sku: String,
  price: Number,
  cost: Number,
  stock: Number,
  category: String,
  isActive: { type: Boolean, default: true }
})

const SaleSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  amount: Number,
  paymentMethod: String,
  saleDate: { type: Date, default: Date.now },
  notes: String
})

const ExpenseSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  category: String,
  expenseDate: { type: Date, default: Date.now },
  paymentMethod: String
})

// モデル定義
let Customer, Product, Sale, Expense

// データベース接続関数
async function connectDatabase() {
  if (USE_JSON_FALLBACK) {
    log.info('Using JSON fallback mode - no database connection needed')
    return true
  }

  try {
    await mongoose.connect(MONGODB_URI)
    Customer = mongoose.model('Customer', CustomerSchema)
    Product = mongoose.model('Product', ProductSchema)
    Sale = mongoose.model('Sale', SaleSchema)
    Expense = mongoose.model('Expense', ExpenseSchema)
    log.info(`Connected to MongoDB: ${MONGODB_URI}`)
    return true
  } catch (error) {
    log.error(`MongoDB connection failed: ${error.message}`)
    log.info('Falling back to JSON mode')
    return false
  }
}

// JSONデータ読み込み関数
function loadJsonData(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename)
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(rawData)
    }
    return []
  } catch (error) {
    log.error(`Error reading JSON data from ${filename}: ${error.message}`)
    return []
  }
}

// ビジネスデータ取得関数
async function getCustomers(limit = 50, filter = '') {
  if (USE_JSON_FALLBACK || !Customer) {
    const customers = loadJsonData('customers.json')
    if (filter) {
      return customers.filter(c => 
        c.name?.toLowerCase().includes(filter.toLowerCase()) ||
        c.company?.toLowerCase().includes(filter.toLowerCase())
      ).slice(0, limit)
    }
    return customers.slice(0, limit)
  }

  try {
    const query = filter ? {
      $or: [
        { name: { $regex: filter, $options: 'i' } },
        { company: { $regex: filter, $options: 'i' } }
      ]
    } : {}
    return await Customer.find(query).limit(limit).lean()
  } catch (error) {
    log.error(`Error fetching customers: ${error.message}`)
    return []
  }
}

async function getProducts(limit = 50, category = '') {
  if (USE_JSON_FALLBACK || !Product) {
    const products = loadJsonData('products.json')
    if (category) {
      return products.filter(p => 
        p.category?.toLowerCase().includes(category.toLowerCase())
      ).slice(0, limit)
    }
    return products.slice(0, limit)
  }

  try {
    const query = category ? { category: { $regex: category, $options: 'i' } } : {}
    return await Product.find(query).limit(limit).lean()
  } catch (error) {
    log.error(`Error fetching products: ${error.message}`)
    return []
  }
}

async function getSalesData(startDate = null, endDate = null) {
  if (USE_JSON_FALLBACK || !Sale) {
    const sales = loadJsonData('sales.json')
    if (startDate || endDate) {
      return sales.filter(s => {
        const saleDate = new Date(s.saleDate || s.date)
        if (startDate && saleDate < new Date(startDate)) return false
        if (endDate && saleDate > new Date(endDate)) return false
        return true
      })
    }
    return sales
  }

  try {
    const query = {}
    if (startDate || endDate) {
      query.saleDate = {}
      if (startDate) query.saleDate.$gte = new Date(startDate)
      if (endDate) query.saleDate.$lte = new Date(endDate)
    }
    return await Sale.find(query).populate('customer').lean()
  } catch (error) {
    log.error(`Error fetching sales data: ${error.message}`)
    return []
  }
}

async function getFinancialSummary() {
  try {
    const salesData = await getSalesData()
    const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.amount || 0), 0)
    
    const expenses = USE_JSON_FALLBACK || !Expense ? 
      loadJsonData('finances.json').filter(f => f.type === 'expense') :
      await Expense.find().lean()
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
    
    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      salesCount: salesData.length,
      expenseCount: expenses.length,
      averageSaleAmount: salesData.length > 0 ? totalRevenue / salesData.length : 0
    }
  } catch (error) {
    log.error(`Error generating financial summary: ${error.message}`)
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      salesCount: 0,
      expenseCount: 0,
      averageSaleAmount: 0
    }
  }
}

async function searchBusinessData(query, type = 'all') {
  const results = {
    customers: [],
    products: [],
    sales: [],
    summary: ''
  }

  try {
    if (type === 'all' || type === 'customers') {
      results.customers = await getCustomers(10, query)
    }
    
    if (type === 'all' || type === 'products') {
      results.products = await getProducts(10, query)
    }
    
    if (type === 'all' || type === 'sales') {
      const allSales = await getSalesData()
      results.sales = allSales.filter(s => 
        s.notes?.toLowerCase().includes(query.toLowerCase()) ||
        s.customer?.name?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
    }

    results.summary = `検索クエリ「${query}」で ${results.customers.length} 件の顧客、${results.products.length} 件の商品、${results.sales.length} 件の売上が見つかりました。`
    
    return results
  } catch (error) {
    log.error(`Error searching business data: ${error.message}`)
    return results
  }
}

// MCPサーバー設定
const server = new Server({
  name: 'business-data-server',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
})

// ツール一覧の定義
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_customers',
        description: '顧客データを取得します。フィルタリングと件数制限が可能です。',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: '取得する顧客数の上限（デフォルト: 50）',
              default: 50
            },
            filter: {
              type: 'string',
              description: '顧客名または会社名でフィルタリング',
              default: ''
            }
          }
        }
      },
      {
        name: 'get_products',
        description: '商品データを取得します。カテゴリーフィルタリングと件数制限が可能です。',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: '取得する商品数の上限（デフォルト: 50）',
              default: 50
            },
            category: {
              type: 'string',
              description: 'カテゴリーでフィルタリング',
              default: ''
            }
          }
        }
      },
      {
        name: 'get_sales_data',
        description: '売上データを取得します。期間指定が可能です。',
        inputSchema: {
          type: 'object',
          properties: {
            startDate: {
              type: 'string',
              description: '開始日（YYYY-MM-DD形式）',
              default: null
            },
            endDate: {
              type: 'string',
              description: '終了日（YYYY-MM-DD形式）',
              default: null
            }
          }
        }
      },
      {
        name: 'get_financial_summary',
        description: '財務サマリー（売上、支出、利益）を取得します。',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'search_business_data',
        description: 'ビジネスデータを横断的に検索します。',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '検索クエリ',
              required: true
            },
            type: {
              type: 'string',
              description: '検索対象タイプ（all, customers, products, sales）',
              default: 'all'
            }
          },
          required: ['query']
        }
      }
    ]
  }
})

// ツール実行ハンドラー
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    log.debug(`Executing tool: ${name} with args: ${JSON.stringify(args)}`)
    
    switch (name) {
      case 'get_customers':
        const customers = await getCustomers(args.limit, args.filter)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                data: customers,
                count: customers.length,
                message: `${customers.length}件の顧客データを取得しました`
              }, null, 2)
            }
          ]
        }

      case 'get_products':
        const products = await getProducts(args.limit, args.category)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                data: products,
                count: products.length,
                message: `${products.length}件の商品データを取得しました`
              }, null, 2)
            }
          ]
        }

      case 'get_sales_data':
        const sales = await getSalesData(args.startDate, args.endDate)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                data: sales,
                count: sales.length,
                message: `${sales.length}件の売上データを取得しました`
              }, null, 2)
            }
          ]
        }

      case 'get_financial_summary':
        const summary = await getFinancialSummary()
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                data: summary,
                message: '財務サマリーを生成しました'
              }, null, 2)
            }
          ]
        }

      case 'search_business_data':
        const searchResults = await searchBusinessData(args.query, args.type)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                data: searchResults,
                message: searchResults.summary
              }, null, 2)
            }
          ]
        }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    log.error(`Tool execution error for ${name}: ${error.message}`)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            message: `ツール実行エラー: ${name}`
          }, null, 2)
        }
      ],
      isError: true
    }
  }
})

// サーバー起動
async function main() {
  log.info('Starting Business Data MCP Server...')
  
  // データベース接続
  await connectDatabase()
  
  // トランスポート設定
  const transport = new StdioServerTransport()
  await server.connect(transport)
  
  log.info('Business Data MCP Server is running and ready to serve tools')
}

// エラーハンドリング
process.on('uncaughtException', (error) => {
  log.error(`Uncaught exception: ${error.message}`)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  log.error(`Unhandled rejection at: ${promise}, reason: ${reason}`)
  process.exit(1)
})

// プロセス終了時のクリーンアップ
process.on('SIGINT', async () => {
  log.info('Received SIGINT, shutting down gracefully...')
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close()
  }
  process.exit(0)
})

// メイン関数実行
if (require.main === module) {
  main().catch((error) => {
    log.error(`Failed to start server: ${error.message}`)
    process.exit(1)
  })
}
