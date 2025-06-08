import { NextRequest, NextResponse } from 'next/server'
import { processEnhancedBusinessQuery } from '@/lib/enhanced-ai-agent'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { 
      query, 
      messages,
      provider,
      apiKey,
      modelId,
      apiEndpoint 
    } = await req.json()

    // Extract query from messages array (useChat format) or use direct query parameter (backward compatibility)
    let userQuery: string
    if (messages && Array.isArray(messages) && messages.length > 0) {
      // Get the last user message from messages array
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()
      userQuery = lastUserMessage?.content || ''
    } else if (query && typeof query === 'string') {
      // Backward compatibility with direct query parameter
      userQuery = query
    } else {
      userQuery = ''
    }

    console.log('Business AI Agent Request:', { userQuery, provider, modelId })

    if (!userQuery || typeof userQuery !== 'string' || userQuery.trim() === '') {
      return NextResponse.json(
        { error: 'クエリが必要です' },
        { status: 400 }
      )
    }

    // Enhanced AIエージェントでクエリを処理（MCP統合版）
    const result = await processEnhancedBusinessQuery(userQuery, {
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
    console.error('Business AI Agent Error:', error)
    return NextResponse.json(
      { error: 'AIエージェントの処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
