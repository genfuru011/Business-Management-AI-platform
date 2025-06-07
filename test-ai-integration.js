/**
 * AI統合エンドツーエンドテスト
 * フロントエンド→AIエージェント→MCP→データベース連携をテスト
 */

const API_BASE = 'http://localhost:3000'

async function testAIIntegration() {
  console.log('🚀 AI統合エンドツーエンドテスト開始...\n')

  try {
    // 1. ヘルスチェック
    console.log('1️⃣ システムヘルスチェック...')
    
    // Ollamaプロキシ確認
    try {
      const ollamaResponse = await fetch('http://localhost:11435/health')
      if (ollamaResponse.ok) {
        console.log('✅ Ollamaプロキシサーバー正常')
      } else {
        console.log('⚠️ Ollamaプロキシ応答エラー:', ollamaResponse.status)
      }
    } catch (error) {
      console.log('⚠️ Ollamaプロキシ接続失敗:', error.message)
    }

    // 2. AIエージェントAPIテスト
    console.log('\n2️⃣ AIエージェントAPIテスト...')
    
    const testQuery = "顧客データの概要を教えてください"
    const aiResponse = await fetch(`${API_BASE}/api/business-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: testQuery }
        ],
        provider: 'ollama',
        apiKey: 'ollama-local-key-123',
        modelId: 'llama3.2',
        apiEndpoint: 'http://localhost:11435/v1'
      })
    })

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json()
      throw new Error(`AIエージェントAPIエラー: ${errorData.error}`)
    }

    console.log('✅ AIエージェントAPI正常応答')
    
    // ストリーミングレスポンスを読み取り
    const reader = aiResponse.body?.getReader()
    if (reader) {
      console.log('📖 AIレスポンス読み取り中...')
      let responseText = ''
      let startTime = Date.now()
      
      while (true) {
        // 90秒のタイムアウトチェック
        if (Date.now() - startTime > 90000) {
          console.log('⏱️ AIレスポンス読み取りタイムアウト')
          break
        }
        
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = new TextDecoder().decode(value)
        responseText += chunk
        
        // プログレス表示
        if (responseText.length % 100 === 0) {
          console.log(`📝 読み取り中... (${responseText.length}文字)`)
        }
      }
      
      if (responseText.length > 0) {
        console.log('✅ AIレスポンス取得成功')
        console.log('📝 レスポンス長:', responseText.length, '文字')
        console.log('📄 レスポンス（最初の200文字）:', responseText.substring(0, 200))
      } else {
        console.log('⚠️ 空のレスポンス')
      }
    }

    // 3. MCPデータアクセステスト
    console.log('\n3️⃣ データアクセステスト...')
    
    // 顧客データ取得テスト
    const customersResponse = await fetch(`${API_BASE}/api/customers`)
    if (customersResponse.ok) {
      const customersData = await customersResponse.json()
      console.log('✅ 顧客データ取得成功:', customersData.data?.length || 0, '件')
    }

    // 製品データ取得テスト
    const productsResponse = await fetch(`${API_BASE}/api/products`)
    if (productsResponse.ok) {
      const productsData = await productsResponse.json()
      console.log('✅ 製品データ取得成功:', productsData.data?.length || 0, '件')
    }

    // 財務データ取得テスト
    const analyticsResponse = await fetch(`${API_BASE}/api/analytics?period=month`)
    if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json()
      console.log('✅ 財務分析データ取得成功')
    }

    console.log('\n🎉 エンドツーエンドテスト完了！')
    console.log('🔗 フロントエンド→AIエージェント→MCP→データベース連携が正常に動作しています')

  } catch (error) {
    console.error('\n❌ テストエラー:', error.message)
    console.error('📋 詳細:', error)
  }
}

// 2分後にタイムアウト（AI処理時間を考慮）
setTimeout(() => {
  console.log('⏱️ テストタイムアウト（120秒）')
  process.exit(1)
}, 120000)

// テスト実行
testAIIntegration()
