/**
 * MCP Demo API Endpoint
 * 
 * This endpoint demonstrates the MCP (Model Context Protocol) integration
 * with the database and AI agent system.
 */

import { NextRequest } from 'next/server'
import { businessMCPServer, businessMCPClient } from '@/lib/mcp-database'
import { processEnhancedBusinessQuery } from '@/lib/enhanced-ai-agent'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'overview'
    
    switch (action) {
      case 'tools':
        return await handleListTools()
      case 'resources':
        return await handleListResources()
      case 'demo':
        return await handleDemo()
      case 'overview':
      default:
        return await handleOverview()
    }
  } catch (error) {
    console.error('MCP Demo API Error:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, query, toolName, args, uri } = body
    
    switch (action) {
      case 'query':
        return await handleEnhancedQuery(query)
      case 'tool':
        return await handleToolExecution(toolName, args)
      case 'resource':
        return await handleResourceRead(uri)
      case 'test':
        return await handleMCPTest()
      default:
        return Response.json({
          success: false,
          error: 'Invalid action specified'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('MCP Demo API Error:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * Handle MCP overview
 */
async function handleOverview() {
  const tools = await businessMCPClient.listTools()
  const resources = await businessMCPClient.listResources()
  
  return Response.json({
    success: true,
    data: {
      mcpIntegration: {
        status: 'active',
        protocol: 'Model Context Protocol (MCP)',
        description: 'Standardized interface for AI-database interaction'
      },
      tools: {
        count: tools.length,
        available: tools.map(tool => ({
          name: tool.name,
          description: tool.description
        }))
      },
      resources: {
        count: resources.length,
        available: resources.map(resource => ({
          uri: resource.uri,
          name: resource.name,
          description: resource.description
        }))
      },
      capabilities: [
        'Standardized database access',
        'Type-safe API operations',
        'Secure data retrieval',
        'AI agent integration',
        'Real-time data processing',
        'Error handling and fallbacks'
      ],
      examples: {
        queryCustomers: {
          tool: 'query_customers',
          description: '顧客データの検索と取得',
          sampleArgs: { limit: 10, filter: { company: 'テスト会社' } }
        },
        analyzeSales: {
          tool: 'analyze_sales',
          description: '売上データの分析',
          sampleArgs: { period: 'month' }
        },
        getBusinessOverview: {
          tool: 'get_business_overview',
          description: 'ビジネス全体の概要取得',
          sampleArgs: { includeCustomers: true, includeSales: true }
        }
      }
    },
    timestamp: new Date().toISOString()
  })
}

/**
 * Handle list tools request
 */
async function handleListTools() {
  const tools = await businessMCPClient.listTools()
  
  return Response.json({
    success: true,
    data: {
      tools,
      count: tools.length,
      description: 'Available MCP tools for database operations'
    },
    timestamp: new Date().toISOString()
  })
}

/**
 * Handle list resources request
 */
async function handleListResources() {
  const resources = await businessMCPClient.listResources()
  
  return Response.json({
    success: true,
    data: {
      resources,
      count: resources.length,
      description: 'Available MCP resources for data access'
    },
    timestamp: new Date().toISOString()
  })
}

/**
 * Handle enhanced AI query with MCP
 */
async function handleEnhancedQuery(query: string) {
  if (!query) {
    return Response.json({
      success: false,
      error: 'Query parameter is required'
    }, { status: 400 })
  }

  try {
    // Use enhanced AI agent with MCP integration
    const aiResponse = await processEnhancedBusinessQuery(query, {
      provider: 'openai',
      modelId: 'gpt-4o',
      apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY
    })

    // Convert streaming response to text for demo purposes
    let responseText = ''
    for await (const chunk of aiResponse.textStream) {
      responseText += chunk
    }

    return Response.json({
      success: true,
      data: {
        query,
        response: responseText,
        method: 'Enhanced AI Agent with MCP',
        features: [
          'MCP protocol integration',
          'Standardized database access',
          'Real-time data analysis',
          'Secure operations'
        ]
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: `Enhanced query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      fallback: 'Consider using direct MCP tool calls for specific operations'
    }, { status: 500 })
  }
}

/**
 * Handle tool execution
 */
async function handleToolExecution(toolName: string, args: any) {
  if (!toolName) {
    return Response.json({
      success: false,
      error: 'Tool name is required'
    }, { status: 400 })
  }

  try {
    const result = await businessMCPClient.invokeTool(toolName, args)
    
    return Response.json({
      success: true,
      data: {
        tool: toolName,
        arguments: args,
        result,
        executedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      tool: toolName,
      arguments: args
    }, { status: 500 })
  }
}

/**
 * Handle resource reading
 */
async function handleResourceRead(uri: string) {
  if (!uri) {
    return Response.json({
      success: false,
      error: 'Resource URI is required'
    }, { status: 400 })
  }

  try {
    const result = await businessMCPClient.readResource(uri)
    
    return Response.json({
      success: true,
      data: {
        uri,
        result,
        readAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: `Resource read failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      uri
    }, { status: 500 })
  }
}

/**
 * Handle MCP demo with multiple operations
 */
async function handleDemo() {
  const demoResults: any = {
    overview: 'MCP (Model Context Protocol) とデータベースの統合デモ',
    operations: []
  }

  try {
    // Demo 1: List available tools
    const tools = await businessMCPClient.listTools()
    demoResults.operations.push({
      operation: 'list_tools',
      description: '利用可能なMCPツールの一覧取得',
      result: `${tools.length}個のツールが利用可能`,
      details: tools.map(t => t.name)
    })

    // Demo 2: Get customer data
    try {
      const customerData = await businessMCPClient.invokeTool('query_customers', { limit: 5 })
      demoResults.operations.push({
        operation: 'query_customers',
        description: '顧客データの取得（MCP経由）',
        result: `${customerData.customers?.length || 0}件の顧客データを取得`,
        summary: customerData.summary,
        dataSource: customerData.source || 'MongoDB'
      })
    } catch (error) {
      demoResults.operations.push({
        operation: 'query_customers',
        description: '顧客データの取得（MCP経由）',
        result: 'エラー: ' + (error instanceof Error ? error.message : 'Unknown error'),
        note: 'JSONフォールバックまたはデータベース設定を確認してください'
      })
    }

    // Demo 3: Get sales analysis
    try {
      const salesData = await businessMCPClient.invokeTool('analyze_sales', { period: 'month' })
      demoResults.operations.push({
        operation: 'analyze_sales',
        description: '売上分析（MCP経由）',
        result: `総売上: ¥${salesData.analytics?.totalSales?.toLocaleString() || 0}`,
        analytics: salesData.analytics,
        dataSource: salesData.source || 'MongoDB'
      })
    } catch (error) {
      demoResults.operations.push({
        operation: 'analyze_sales',
        description: '売上分析（MCP経由）',
        result: 'エラー: ' + (error instanceof Error ? error.message : 'Unknown error'),
        note: 'JSONフォールバックまたはデータベース設定を確認してください'
      })
    }

    // Demo 4: Get business overview
    try {
      const overview = await businessMCPClient.invokeTool('get_business_overview', {
        includeCustomers: true,
        includeSales: true,
        includeInventory: true,
        includeFinances: true
      })
      demoResults.operations.push({
        operation: 'get_business_overview',
        description: 'ビジネス全体概要（MCP経由）',
        result: '包括的なビジネスデータを取得完了',
        overview: {
          customers: overview.customers?.summary,
          sales: overview.sales?.analytics,
          inventory: overview.inventory?.summary,
          finances: overview.finances?.profitability
        }
      })
    } catch (error) {
      demoResults.operations.push({
        operation: 'get_business_overview',
        description: 'ビジネス全体概要（MCP経由）',
        result: 'エラー: ' + (error instanceof Error ? error.message : 'Unknown error'),
        note: 'JSONフォールバックまたはデータベース設定を確認してください'
      })
    }

    return Response.json({
      success: true,
      data: demoResults,
      summary: {
        totalOperations: demoResults.operations.length,
        successfulOperations: demoResults.operations.filter((op: any) => !op.result.includes('エラー')).length,
        mcpBenefits: [
          '標準化されたインターフェース',
          '型安全なAPI操作',
          'セキュアなデータアクセス',
          'エラーハンドリングとフォールバック',
          'AIエージェントとの統合'
        ]
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: `Demo failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      partialResults: demoResults
    }, { status: 500 })
  }
}

/**
 * Handle MCP system test
 */
async function handleMCPTest() {
  const testResults: any = {
    tests: [],
    summary: { passed: 0, failed: 0, total: 0 }
  }

  // Test 1: MCP Server availability
  try {
    const tools = await businessMCPClient.listTools()
    testResults.tests.push({
      name: 'MCP Server Availability',
      status: 'PASSED',
      description: 'MCPサーバーが正常に応答',
      result: `${tools.length}個のツールが利用可能`
    })
    testResults.summary.passed++
  } catch (error) {
    testResults.tests.push({
      name: 'MCP Server Availability',
      status: 'FAILED',
      description: 'MCPサーバーの応答エラー',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    testResults.summary.failed++
  }

  // Test 2: Database connection through MCP
  try {
    await businessMCPClient.invokeTool('query_customers', { limit: 1 })
    testResults.tests.push({
      name: 'Database Connection via MCP',
      status: 'PASSED',
      description: 'MCP経由でのデータベース接続成功'
    })
    testResults.summary.passed++
  } catch (error) {
    testResults.tests.push({
      name: 'Database Connection via MCP',
      status: 'FAILED',
      description: 'MCP経由でのデータベース接続失敗',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    testResults.summary.failed++
  }

  // Test 3: Resource reading
  try {
    await businessMCPClient.readResource('business://database/customers')
    testResults.tests.push({
      name: 'Resource Reading',
      status: 'PASSED',
      description: 'MCPリソースの読み込み成功'
    })
    testResults.summary.passed++
  } catch (error) {
    testResults.tests.push({
      name: 'Resource Reading',
      status: 'FAILED',
      description: 'MCPリソースの読み込み失敗',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    testResults.summary.failed++
  }

  testResults.summary.total = testResults.tests.length
  testResults.summary.successRate = testResults.summary.total > 0 ? 
    (testResults.summary.passed / testResults.summary.total) * 100 : 0

  return Response.json({
    success: true,
    data: testResults,
    recommendation: testResults.summary.successRate === 100 ? 
      'MCP統合は正常に動作しています' : 
      'MCP統合に問題があります。設定とデータベース接続を確認してください',
    timestamp: new Date().toISOString()
  })
}