import { NextResponse } from 'next/server'
import dbConnect from '@/lib/database'
import { Sale } from '@/lib/models'

export async function GET() {
  try {
    await dbConnect()
    
    const sales = await Sale.find()
      .populate('customer', 'name email company')
      .populate('invoice', 'invoiceNumber')
      .select('invoice customer amount paymentMethod saleDate notes')
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
    const sale = new Sale(body)
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
