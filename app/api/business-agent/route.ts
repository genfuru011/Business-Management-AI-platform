import { NextRequest, NextResponse } from 'next/server'
import { processBusinessQuery } from '@/lib/ai-agent'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { 
      query, 
      provider,
      apiKey,
      modelId,
      apiEndpoint 
    } = await req.json()

    console.log('Business AI Agent Request:', { query, provider, modelId })

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'クエリが必要です' },
        { status: 400 }
      )
    }

    // AIエージェントでクエリを処理
    const result = await processBusinessQuery(query, {
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
