import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database'
import { Customer } from '@/lib/models'

// 顧客一覧取得
export async function GET() {
  try {
    await dbConnect()
    const customers = await Customer.find({}).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, data: customers })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// 新規顧客作成
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const body = await request.json()
    
    const customer = new Customer(body)
    await customer.save()
    
    return NextResponse.json(
      { success: true, data: customer },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'このメールアドレスは既に登録されています。' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
