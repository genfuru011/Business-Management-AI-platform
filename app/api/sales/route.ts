import { NextResponse } from 'next/server'
import dbConnect from '@/lib/database'
import { Sale } from '@/lib/models'

export async function GET() {
  try {
    await dbConnect()
    
    const sales = await Sale.find()
      .populate('customer', 'name email company')
      .populate('invoice', 'invoiceNumber')
      .select('invoice customer amount paymentMethod saleDate notes saleType productName description quantity unitPrice')
      .sort({ saleDate: -1 })
    
    return NextResponse.json({
      success: true,
      data: sales
    })
  } catch (error) {
    console.error('Sales fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '売上の取得に失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    
    const body = await request.json()
    
    // 売上データのバリデーション
    if (!body.customer || !body.amount) {
      return NextResponse.json(
        {
          success: false,
          message: '顧客IDと金額は必須です'
        },
        { status: 400 }
      )
    }
    
    // 売上タイプに基づいてデータを構築
    const saleData = {
      customer: body.customer,
      amount: body.amount,
      paymentMethod: body.paymentMethod || 'cash',
      saleDate: body.saleDate || new Date(),
      notes: body.notes,
      saleType: body.saleType || 'direct_sale'
    }
    
    // 請求書ベースの売上の場合
    if (body.saleType === 'invoice_based' && body.invoice) {
      saleData.invoice = body.invoice
    }
    
    // 直接売上の場合の商品情報
    if (body.saleType === 'direct_sale') {
      if (body.productName) saleData.productName = body.productName
      if (body.description) saleData.description = body.description
      if (body.quantity) saleData.quantity = body.quantity
      if (body.unitPrice) saleData.unitPrice = body.unitPrice
    }
    
    const sale = new Sale(saleData)
    await sale.save()
    
    const populatedSale = await Sale.findById(sale._id)
      .populate('customer', 'name email company')
      .populate('invoice', 'invoiceNumber')
    
    return NextResponse.json({
      success: true,
      data: populatedSale,
      message: '売上が正常に記録されました'
    })
  } catch (error) {
    console.error('Sale creation error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '売上の記録に失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
