import { NextRequest, NextResponse } from 'next/server'
import { BusinessReportGenerator } from '@/lib/business-report'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { reportType = 'comprehensive' } = await req.json()

    console.log('Generating business report:', reportType)

    // 各APIからビジネスデータを収集
    const businessData = await collectBusinessData()

    // レポート生成
    const report = await BusinessReportGenerator.generateComprehensiveReport(businessData)

    return NextResponse.json({
      success: true,
      report
    })

  } catch (error) {
    console.error('Business Report Generation Error:', error)
    return NextResponse.json(
      { error: 'レポート生成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // 簡易版のレポート取得
    const businessData = await collectBusinessData()
    const report = await BusinessReportGenerator.generateComprehensiveReport(businessData)

    return NextResponse.json({
      success: true,
      report
    })

  } catch (error) {
    console.error('Business Report Get Error:', error)
    return NextResponse.json(
      { error: 'レポート取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

async function collectBusinessData() {
  const businessData: any = {}
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  try {
    // 顧客データ
    try {
      const customersResponse = await fetch(`${baseUrl}/api/customers`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      if (customersResponse.ok) {
        const customersResult = await customersResponse.json()
        if (customersResult.success) {
          businessData.customers = customersResult.data.slice(0, 10)
        }
      }
    } catch (error) {
      console.error('Customers API error:', error)
      businessData.customers = []
    }

    // 分析データ（売上・財務）
    try {
      const analyticsResponse = await fetch(`${baseUrl}/api/analytics`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      if (analyticsResponse.ok) {
        const analyticsResult = await analyticsResponse.json()
        if (analyticsResult.success) {
          businessData.sales = [{
            totalSales: analyticsResult.totalSales || 0,
            monthlyRevenue: analyticsResult.monthlyRevenue || 0,
            salesGrowth: analyticsResult.salesGrowth || 0
          }]
          businessData.finances = [{
            netProfit: analyticsResult.netProfit || 0,
            profitMargin: analyticsResult.profitMargin || 0,
            totalExpenses: analyticsResult.totalExpenses || 0
          }]
        }
      }
    } catch (error) {
      console.error('Analytics API error:', error)
      businessData.sales = []
      businessData.finances = []
    }

    // 商品・在庫データ
    try {
      const productsResponse = await fetch(`${baseUrl}/api/products`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      if (productsResponse.ok) {
        const productsResult = await productsResponse.json()
        if (productsResult.success) {
          businessData.inventory = productsResult.data.slice(0, 10)
        }
      }
    } catch (error) {
      console.error('Products API error:', error)
      businessData.inventory = []
    }

  } catch (error) {
    console.error('Data collection error:', error)
  }

  return businessData
}
