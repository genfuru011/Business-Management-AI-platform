import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database'
import { Product } from '@/lib/models'

// 商品一覧取得
export async function GET() {
  try {
    await dbConnect()
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, data: products })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// 新規商品作成
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const body = await request.json()
    
    const product = new Product(body)
    await product.save()
    
    return NextResponse.json(
      { success: true, data: product },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'このSKUは既に登録されています。' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
