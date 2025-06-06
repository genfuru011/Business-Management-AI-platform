import { NextResponse } from 'next/server'
import dbConnect from '@/lib/database'
import { Customer, Product, Invoice, Sale, Expense } from '@/lib/models'

// デモデータ
const demoCustomers = [
  {
    name: "山田太郎",
    email: "yamada@example.com",
    phone: "090-1234-5678",
    company: "株式会社山田商事",
    address: {
      street: "丸の内1-1-1",
      city: "千代田区",
      state: "東京都",
      zipCode: "100-0001",
      country: "Japan"
    },
    notes: "VIP顧客、長期取引"
  },
  {
    name: "佐藤花子",
    email: "sato@example.com",
    phone: "080-9876-5432",
    company: "佐藤デザイン事務所",
    address: {
      street: "神宮前1-1-1",
      city: "渋谷区",
      state: "東京都",
      zipCode: "150-0001",
      country: "Japan"
    },
    notes: "デザイン業界"
  },
  {
    name: "田中一郎",
    email: "tanaka@example.com",
    phone: "070-1111-2222",
    company: "田中工業株式会社",
    address: {
      street: "梅田1-1-1",
      city: "大阪市北区",
      state: "大阪府",
      zipCode: "530-0001",
      country: "Japan"
    },
    notes: "製造業、新規顧客"
  }
]

const demoProducts = [
  {
    name: "ビジネス戦略コンサルティング",
    sku: "CONS-001",
    price: 300000,
    cost: 150000,
    category: "コンサルティング",
    stock: 100,
    description: "包括的なビジネス戦略立案支援サービス"
  },
  {
    name: "Webシステム開発パッケージ",
    sku: "WEB-001",
    price: 800000,
    cost: 400000,
    category: "システム開発",
    stock: 50,
    description: "カスタムWebアプリケーション開発"
  },
  {
    name: "マーケティング支援ツール",
    sku: "MAR-001",
    price: 150000,
    cost: 75000,
    category: "マーケティング",
    stock: 25,
    description: "デジタルマーケティング最適化ツール"
  }
]

export async function POST() {
  try {
    await dbConnect()

    // 既存データを削除
    await Customer.deleteMany({})
    await Product.deleteMany({})
    await Invoice.deleteMany({})
    await Sale.deleteMany({})
    await Expense.deleteMany({})

    // デモデータを挿入
    const customers = await Customer.insertMany(demoCustomers)
    const products = await Product.insertMany(demoProducts)

    // サンプル請求書を作成（現在の期間 + 過去の期間）
    const currentDate = new Date()
    const dueDate = new Date()
    dueDate.setDate(currentDate.getDate() + 30)

    // 現在の月、四半期、年
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()
    const currentQuarter = Math.floor(currentMonth / 3)

    // 過去のデータ用の日付計算
    const lastMonth = new Date(currentYear, currentMonth - 1, 15)
    const lastQuarter = new Date(currentYear, (currentQuarter - 1) * 3 + 1, 15)
    const lastYear = new Date(currentYear - 1, currentMonth, 15)

    const demoInvoices = [
      // 現在の期間のデータ
      {
        invoiceNumber: "INV-2025-001",
        customer: customers[0]._id,
        items: [
          {
            product: products[0]._id,
            name: products[0].name,
            description: products[0].description,
            quantity: 1,
            price: products[0].price,
            total: products[0].price
          }
        ],
        subtotal: products[0].price,
        tax: products[0].price * 0.1,
        total: products[0].price * 1.1,
        status: 'paid',
        issueDate: new Date(currentYear, currentMonth, 5),
        dueDate: dueDate,
        paidDate: new Date(currentYear, currentMonth, 10)
      },
      {
        invoiceNumber: "INV-2025-002",
        customer: customers[1]._id,
        items: [
          {
            product: products[1]._id,
            name: products[1].name,
            description: products[1].description,
            quantity: 1,
            price: products[1].price,
            total: products[1].price
          }
        ],
        subtotal: products[1].price,
        tax: products[1].price * 0.1,
        total: products[1].price * 1.1,
        status: 'paid',
        issueDate: new Date(currentYear, currentMonth, 15),
        dueDate: dueDate,
        paidDate: new Date(currentYear, currentMonth, 20)
      },
      // 前月のデータ（比較用）
      {
        invoiceNumber: "INV-2025-003",
        customer: customers[0]._id,
        items: [
          {
            product: products[0]._id,
            name: products[0].name,
            description: products[0].description,
            quantity: 1,
            price: products[0].price * 0.8, // 前月は少し安かった
            total: products[0].price * 0.8
          }
        ],
        subtotal: products[0].price * 0.8,
        tax: products[0].price * 0.8 * 0.1,
        total: products[0].price * 0.8 * 1.1,
        status: 'paid',
        issueDate: lastMonth,
        dueDate: new Date(lastMonth.getTime() + 30 * 24 * 60 * 60 * 1000),
        paidDate: new Date(lastMonth.getTime() + 10 * 24 * 60 * 60 * 1000)
      },
      // 前年のデータ（比較用）
      {
        invoiceNumber: "INV-2024-001",
        customer: customers[2]._id,
        items: [
          {
            product: products[2]._id,
            name: products[2].name,
            description: products[2].description,
            quantity: 1,
            price: products[2].price * 0.7, // 前年はさらに安かった
            total: products[2].price * 0.7
          }
        ],
        subtotal: products[2].price * 0.7,
        tax: products[2].price * 0.7 * 0.1,
        total: products[2].price * 0.7 * 1.1,
        status: 'paid',
        issueDate: lastYear,
        dueDate: new Date(lastYear.getTime() + 30 * 24 * 60 * 60 * 1000),
        paidDate: new Date(lastYear.getTime() + 15 * 24 * 60 * 60 * 1000)
      }
    ]

    const invoices = await Invoice.insertMany(demoInvoices)

    // サンプル売上データ（現在の期間 + 過去の期間）
    const demoSales = [
      // 現在の期間
      {
        invoice: invoices[0]._id,
        customer: customers[0]._id,
        amount: invoices[0].total,
        paymentMethod: 'bank_transfer',
        saleDate: new Date(currentYear, currentMonth, 10)
      },
      {
        invoice: invoices[1]._id,
        customer: customers[1]._id,
        amount: invoices[1].total,
        paymentMethod: 'credit_card',
        saleDate: new Date(currentYear, currentMonth, 20)
      },
      // 前月のデータ
      {
        invoice: invoices[2]._id,
        customer: customers[0]._id,
        amount: invoices[2].total,
        paymentMethod: 'bank_transfer',
        saleDate: new Date(lastMonth.getTime() + 10 * 24 * 60 * 60 * 1000)
      },
      // 前年のデータ
      {
        invoice: invoices[3]._id,
        customer: customers[2]._id,
        amount: invoices[3].total,
        paymentMethod: 'cash',
        saleDate: new Date(lastYear.getTime() + 15 * 24 * 60 * 60 * 1000)
      }
    ]

    const sales = await Sale.insertMany(demoSales)

    // サンプル経費データ（現在の期間 + 過去の期間）
    const demoExpenses = [
      // 現在の期間
      {
        description: "オフィス賃料",
        amount: 150000,
        category: "賃貸料",
        expenseDate: new Date(currentYear, currentMonth, 1),
        vendor: "不動産管理会社"
      },
      {
        description: "マーケティング広告費",
        amount: 100000,
        category: "広告宣伝費",
        expenseDate: new Date(currentYear, currentMonth, 15),
        vendor: "広告代理店"
      },
      // 前月のデータ
      {
        description: "オフィス賃料",
        amount: 150000,
        category: "賃貸料",
        expenseDate: lastMonth,
        vendor: "不動産管理会社"
      },
      {
        description: "備品購入",
        amount: 50000,
        category: "事務用品",
        expenseDate: new Date(lastMonth.getTime() + 10 * 24 * 60 * 60 * 1000),
        vendor: "オフィス用品店"
      },
      // 前年のデータ
      {
        description: "システム開発費",
        amount: 80000,
        category: "外注費",
        expenseDate: lastYear,
        vendor: "開発会社"
      }
    ]

    const expenses = await Expense.insertMany(demoExpenses)

    return NextResponse.json({
      success: true,
      message: "デモデータが正常に作成されました",
      data: {
        customers: customers.length,
        products: products.length,
        invoices: invoices.length,
        sales: sales.length,
        expenses: expenses.length
      }
    })

  } catch (error) {
    console.error('Demo data creation error:', error)
    return NextResponse.json(
      {
        success: false,
        message: "デモデータの作成に失敗しました",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
