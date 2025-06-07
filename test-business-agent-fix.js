/**
 * Test script to verify the business-agent API fix
 * Tests both messages array format (useChat) and query format (backward compatibility)
 */

const API_BASE = 'http://localhost:3000'

async function testBusinessAgentFix() {
  console.log('🧪 Business Agent APIの修正テスト開始...\n')

  try {
    // Test 1: messages array format (useChat hook format)
    console.log('1️⃣ messages配列形式のテスト (useChat形式)...')
    
    const messagesFormatTest = await fetch(`${API_BASE}/api/business-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: '売上の概要を教えてください' }
        ],
        provider: 'openai',
        apiKey: 'test-key',
        modelId: 'gpt-4o'
      })
    })

    if (messagesFormatTest.ok) {
      console.log('✅ messages配列形式のテスト成功')
    } else {
      const errorData = await messagesFormatTest.json()
      console.log('❌ messages配列形式のテスト失敗:', errorData.error)
    }

    // Test 2: direct query format (backward compatibility)
    console.log('\n2️⃣ query直接形式のテスト (後方互換性)...')
    
    const queryFormatTest = await fetch(`${API_BASE}/api/business-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '顧客データの概要を教えてください',
        provider: 'openai',
        apiKey: 'test-key',
        modelId: 'gpt-4o'
      })
    })

    if (queryFormatTest.ok) {
      console.log('✅ query直接形式のテスト成功')
    } else {
      const errorData = await queryFormatTest.json()
      console.log('❌ query直接形式のテスト失敗:', errorData.error)
    }

    // Test 3: empty request (should fail properly)
    console.log('\n3️⃣ 空リクエストのテスト (エラーハンドリング確認)...')
    
    const emptyRequestTest = await fetch(`${API_BASE}/api/business-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'openai',
        apiKey: 'test-key',
        modelId: 'gpt-4o'
      })
    })

    if (!emptyRequestTest.ok) {
      const errorData = await emptyRequestTest.json()
      if (errorData.error === 'クエリが必要です') {
        console.log('✅ 空リクエストのエラーハンドリング正常')
      } else {
        console.log('⚠️ 期待されるエラーメッセージと異なります:', errorData.error)
      }
    } else {
      console.log('❌ 空リクエストが不正に成功しました')
    }

    console.log('\n🎉 すべてのテストが完了しました!')

  } catch (error) {
    console.error('\n❌ テストエラー:', error.message)
  }
}

// Node.jsで実行する場合
if (typeof window === 'undefined') {
  testBusinessAgentFix()
}

export { testBusinessAgentFix }