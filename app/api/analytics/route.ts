import { NextResponse } from 'next/server'
import dbConnect from '@/lib/database'
import { Customer, Product, Invoice, Sale, Expense } from '@/lib/models'

export async function GET(request: Request) {
  try {
    await dbConnect()

    // URLパラメータから期間を取得
    const { searchParams } = new URL(request.url)
    const periodParam = searchParams.get('period') || 'month'
    
    // 期間パラメータの検証
    const validPeriods = ['month', 'quarter', 'year']
    const period = validPeriods.includes(periodParam) ? periodParam : 'month'
    
    // 期間に基づいた日付範囲を計算
    const currentDate = new Date()
    let startDate: Date
    let endDate: Date = new Date()
    
    switch (period) {
      case 'quarter':
        // 現在の四半期の開始
        const quarter = Math.floor(currentDate.getMonth() / 3)
        startDate = new Date(currentDate.getFullYear(), quarter * 3, 1)
        break
      case 'year':
        // 今年の開始
        startDate = new Date(currentDate.getFullYear(), 0, 1)
        break
      case 'month':
      default:
        // 今月の開始
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        break
    }

    // 基本統計
    const totalCustomers = await Customer.countDocuments()
    const totalProducts = await Product.countDocuments()
    const totalInvoices = await Invoice.countDocuments()

    // 期間に基づいた売上と経費の集計
    const periodSales = await Sale.find({
      saleDate: { $gte: startDate, $lte: endDate }
    }).select('amount saleDate')
    
    const periodExpenses = await Expense.find({
      expenseDate: { $gte: startDate, $lte: endDate }
    }).select('amount expenseDate category')

    // 前期の日付範囲を計算（比較用）
    let previousStartDate: Date
    let previousEndDate: Date
    
    switch (period) {
      case 'quarter':
        // 前四半期
        const prevQuarter = Math.floor(currentDate.getMonth() / 3) - 1
        if (prevQuarter < 0) {
          previousStartDate = new Date(currentDate.getFullYear() - 1, 9, 1) // 前年Q4
          previousEndDate = new Date(currentDate.getFullYear() - 1, 11, 31)
        } else {
          previousStartDate = new Date(currentDate.getFullYear(), prevQuarter * 3, 1)
          previousEndDate = new Date(currentDate.getFullYear(), (prevQuarter + 1) * 3, 0)
        }
        break
      case 'year':
        // 前年
        previousStartDate = new Date(currentDate.getFullYear() - 1, 0, 1)
        previousEndDate = new Date(currentDate.getFullYear() - 1, 11, 31)
        break
      case 'month':
      default:
        // 前月
        previousStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        previousEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
        break
    }

    // 前期のデータを取得
    const previousPeriodSales = await Sale.find({
      saleDate: { $gte: previousStartDate, $lte: previousEndDate }
    }).select('amount saleDate')
    
    const previousPeriodExpenses = await Expense.find({
      expenseDate: { $gte: previousStartDate, $lte: previousEndDate }
    }).select('amount expenseDate category')

    // 全データの売上と経費（比較用）
    const allSales = await Sale.find().select('amount saleDate')
    const allExpenses = await Expense.find().select('amount expenseDate category')

    // データがある最古の月を計算（フォールバック用）
    const oldestSale = await Sale.findOne().sort({ saleDate: 1 })
    const oldestExpense = await Expense.findOne().sort({ expenseDate: 1 })
    
    let fallbackStartDate: Date
    if (oldestSale) {
      fallbackStartDate = new Date(oldestSale.saleDate.getFullYear(), oldestSale.saleDate.getMonth(), 1)
    } else {
      fallbackStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    }
    
    // 期間データがない場合はフォールバックを使用
    const activeSales = periodSales.length > 0 ? periodSales : allSales.filter(sale => 
      sale.saleDate >= fallbackStartDate
    )
    
    const activeExpenses = periodExpenses.length > 0 ? periodExpenses : allExpenses.filter(expense => 
      expense.expenseDate >= fallbackStartDate
    )

    const monthlyRevenue = activeSales.reduce((sum, sale) => sum + sale.amount, 0)
    const monthlyExpenseTotal = activeExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const monthlyProfit = monthlyRevenue - monthlyExpenseTotal

    // 前期との比較計算
    const previousRevenue = previousPeriodSales.reduce((sum, sale) => sum + sale.amount, 0)
    const previousExpenses = previousPeriodExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const previousProfit = previousRevenue - previousExpenses

    // 成長率計算
    const salesGrowth = previousRevenue > 0 ? ((monthlyRevenue - previousRevenue) / previousRevenue) * 100 : 0
    const expenseGrowth = previousExpenses > 0 ? ((monthlyExpenseTotal - previousExpenses) / previousExpenses) * 100 : 0
    const profitGrowth = previousProfit !== 0 ? ((monthlyProfit - previousProfit) / Math.abs(previousProfit)) * 100 : 0

    // 総売上と総経費
    const totalRevenue = allSales.reduce((sum, sale) => sum + sale.amount, 0)
    const totalExpenseAmount = allExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    // レポートページ用のデータ形式
    const netProfit = totalRevenue - totalExpenseAmount
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // 低在庫商品の計算
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 10 } })

    // 期間別売れ筋商品の取得（請求書のitemsから）
    const topProducts = await Invoice.aggregate([
      // 期間でフィルタリング
      {
        $match: {
          invoiceDate: { $gte: startDate, $lte: endDate }
        }
      },
      
      // 請求書のitemsを展開
      { $unwind: '$items' },
      
      // 商品情報でグループ化
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      
      // 商品の詳細情報を取得
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      
      // 売上順にソート
      { $sort: { totalRevenue: -1 } },
      
      // 上位5商品のみ
      { $limit: 5 },
      
      // 結果の整形
      {
        $project: {
          name: {
            $cond: {
              if: { $eq: ['$name', null] },
              then: { $arrayElemAt: ['$productDetails.name', 0] },
              else: '$name'
            }
          },
          sold: '$totalQuantity',
          revenue: '$totalRevenue'
        }
      }
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalSales: totalRevenue,
        totalExpenses: totalExpenseAmount,
        netProfit,
        profitMargin,
        totalCustomers,
        totalProducts,
        totalInvoices,
        totalExpenseItems: allExpenses.length,
        lowStockProducts,
        topProducts: topProducts || [],
        // 月次データ
        monthlyRevenue,
        monthlyExpenseTotal,
        monthlyProfit,
        monthlySalesCount: activeSales.length,
        monthlyExpenseCount: activeExpenses.length,
        // 成長率データ
        salesGrowth: parseFloat(salesGrowth.toFixed(1)),
        expenseGrowth: parseFloat(expenseGrowth.toFixed(1)),
        profitGrowth: parseFloat(profitGrowth.toFixed(1)),
        period: period // 使用した期間を返す
      }
    })

  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '分析データの取得に失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
