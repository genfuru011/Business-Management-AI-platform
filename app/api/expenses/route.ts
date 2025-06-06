import { NextResponse } from 'next/server'
import dbConnect from '@/lib/database'
import { Expense } from '@/lib/models'

export async function GET() {
  try {
    await dbConnect()
    
    const expenses = await Expense.find()
      .select('description amount category expenseDate paymentMethod receipt notes')
      .sort({ expenseDate: -1 })
    
    return NextResponse.json({
      success: true,
      data: expenses
    })
  } catch (error) {
    console.error('Expenses fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '経費の取得に失敗しました',
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
    const expense = new Expense(body)
    await expense.save()
    
    return NextResponse.json({
      success: true,
      data: expense,
      message: '経費が正常に記録されました'
    })
  } catch (error) {
    console.error('Expense creation error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '経費の記録に失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
