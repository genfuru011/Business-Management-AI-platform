import { NextRequest, NextResponse } from 'next/server'
import { processBusinessQuery } from '@/lib/ai-agent'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json()
    
    // useChat からのリクエスト形式をデバッグ
    console.log('🔍 Full Request Body:', JSON.stringify(requestBody, null, 2))
    
    const { 
      messages,
      query, 
      provider,
      apiKey,
      modelId,
      apiEndpoint 
    } = requestBody

    // useChat は messages 配列で送信するため、最後のメッセージからクエリを取得
    let actualQuery = query
    if (!actualQuery && messages && Array.isArray(messages) && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.role === 'user' && lastMessage.content) {
        actualQuery = lastMessage.content
      }
    }

    console.log('Business AI Agent Request:', { 
      actualQuery: actualQuery || 'undefined', 
      provider: provider || 'undefined', 
      modelId: modelId || 'undefined',
      messagesCount: messages ? messages.length : 0
    })

    if (!actualQuery || typeof actualQuery !== 'string' || actualQuery.trim() === '') {
      console.log('❌ Invalid query:', { actualQuery, type: typeof actualQuery })
      return NextResponse.json(
        { error: 'クエリが必要です', received: { actualQuery, provider, modelId, messagesCount: messages ? messages.length : 0 } },
        { status: 400 }
      )
    }

    // AIエージェントでクエリを処理
    const result = await processBusinessQuery(actualQuery, {
      provider,
      apiKey,
      modelId,
      apiEndpoint
    })

    // ストリーミングレスポンスを返す
    return new Response(result.toAIStream(), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('❌ Business AI Agent Error Details:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        error: 'AIエージェントの処理中にエラーが発生しました',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
