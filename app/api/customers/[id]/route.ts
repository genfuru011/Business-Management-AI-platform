import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database'
import { Customer } from '@/lib/models'

// 特定顧客取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    const customer = await Customer.findById(id)
    
    if (!customer) {
      return NextResponse.json(
        { success: false, error: '顧客が見つかりません。' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: customer })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// 顧客情報更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const body = await request.json()
    const { id } = await params
    
    const customer = await Customer.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    
    if (!customer) {
      return NextResponse.json(
        { success: false, error: '顧客が見つかりません。' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: customer })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// 顧客削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    const customer = await Customer.findByIdAndDelete(id)
    
    if (!customer) {
      return NextResponse.json(
        { success: false, error: '顧客が見つかりません。' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '顧客を削除しました。' 
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
