import dbConnect from '@/lib/database';

export async function POST(req: Request) {
  try {
    const { endpoint } = await req.json()

    // エンドポイントがMongoDBの場合、直接接続を試みる
    if (endpoint.includes('mongodb')) {
      try {
        await dbConnect();
        return Response.json({
          success: true,
          message: `データベース接続成功`,
          data: { status: 'connected' },
        })
      } catch (dbError) {
        throw new Error(`データベース接続エラー: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`)
      }
    }

    // 外部APIエンドポイントの接続テスト
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.has("Authorization") ? 
          req.headers.get("Authorization")! : ""
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()

    return Response.json({
      success: true,
      message: `API接続成功 - ${Array.isArray(data.models) ? data.models.length : Object.keys(data).length}個のリソースが利用可能`,
      data,
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "接続エラー",
      },
      { status: 500 },
    )
  }
}
