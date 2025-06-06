import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/database'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    // データベース接続テスト
    const result = await db.admin().ping()
    
    // 基本的なコレクション情報を取得
    const collections = await db.listCollections().toArray()
    
    return NextResponse.json({
      status: 'connected',
      message: 'データベース接続成功',
      ping: result,
      collections: collections.map(col => col.name),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'データベース接続に失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
