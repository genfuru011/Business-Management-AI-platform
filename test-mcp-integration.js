#!/usr/bin/env node
/**
 * MCP統合テストスクリプト
 */

import { getMCPClient } from './lib/mcp-client.ts'

async function testMCPIntegration() {
  console.log('🧪 MCP統合テストを開始します...')
  
  const mcpClient = getMCPClient()
  
  try {
    // MCPサーバーに接続
    console.log('🔗 MCPサーバーに接続中...')
    const connected = await mcpClient.connect()
    
    if (!connected) {
      console.log('❌ MCPサーバー接続に失敗しました')
      return
    }
    
    console.log('✅ MCPサーバーに接続しました')
    
    // 利用可能なツールを取得
    console.log('🔧 利用可能なツールを取得中...')
    const tools = await mcpClient.getAvailableTools()
    console.log('利用可能なツール:', tools.map(t => t.name))
    
    // 顧客データをテスト
    console.log('👥 顧客データをテスト中...')
    const customerResult = await mcpClient.callTool('get_customers', { limit: 3 })
    console.log('顧客データテスト結果:', customerResult)
    
    // 売上データをテスト
    console.log('📈 売上データをテスト中...')
    const salesResult = await mcpClient.callTool('get_sales_data', {})
    console.log('売上データテスト結果:', salesResult)
    
    // 財務サマリーをテスト
    console.log('💰 財務サマリーをテスト中...')
    const financialResult = await mcpClient.callTool('get_financial_summary', {})
    console.log('財務サマリーテスト結果:', financialResult)
    
    console.log('✅ すべてのMCPテストが完了しました')
    
  } catch (error) {
    console.error('❌ MCPテストエラー:', error)
  } finally {
    // 接続を切断
    await mcpClient.disconnect()
    console.log('🔌 MCPサーバーから切断しました')
  }
}

// テスト実行
testMCPIntegration().catch(console.error)
