import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 Test API endpoint called')
    
    const requestBody = await req.json()
    console.log('📝 Request body:', JSON.stringify(requestBody, null, 2))
    
    // 基本的なレスポンス
    return NextResponse.json({
      success: true,
      message: 'テストAPIが正常に動作しています',
      timestamp: new Date().toISOString(),
      received: requestBody
    })
    
  } catch (error) {
    console.error('❌ Test API Error:', error)
    return NextResponse.json(
      { 
        error: 'テストAPIエラー',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
