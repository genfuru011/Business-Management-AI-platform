import { NextResponse } from 'next/server'
import dbConnect from '@/lib/database'
import { Invoice } from '@/lib/models'

export async function GET() {
  try {
    await dbConnect()
    
    const invoices = await Invoice.find()
      .populate('customer', 'name email company')
      .populate('items.product', 'name sku')
      .select('invoiceNumber customer items subtotal tax total status issueDate dueDate paidDate notes')
      .sort({ issueDate: -1 })
    
    return NextResponse.json({
      success: true,
      data: invoices
    })
  } catch (error) {
    console.error('Invoice fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '請求書の取得に失敗しました',
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
    const invoice = new Invoice(body)
    await invoice.save()
    
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('customer', 'name email company')
      .populate('items.product', 'name sku')
    
    return NextResponse.json({
      success: true,
      data: populatedInvoice,
      message: '請求書が正常に作成されました'
    })
  } catch (error) {
    console.error('Invoice creation error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '請求書の作成に失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
