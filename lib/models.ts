import mongoose from 'mongoose'
import * as fs from 'fs'
import * as path from 'path'

// データファイルパス
const DATA_DIR = path.join(process.cwd(), 'data')

// JSONデータ読み込み関数
export function loadJsonData(filename: string) {
  try {
    const filePath = path.join(DATA_DIR, filename)
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(rawData)
    }
    return null
  } catch (error) {
    console.error(`Error loading JSON data from ${filename}:`, error)
    return null
  }
}

// 顧客モデル
const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Japan' }
  },
  company: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// 商品モデル
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  category: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    default: '個',
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// 請求書モデル
const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    description: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0.1, // 10%消費税
    min: 0,
    max: 1
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// 売上記録モデル
const SaleSchema = new mongoose.Schema({
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: false  // 請求書と売上を分離 - invoiceは任意に
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  // 売上が請求書ベースでない場合の商品情報
  productName: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    min: 1,
    default: 1
  },
  unitPrice: {
    type: Number,
    min: 0
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'bank_transfer', 'paypal', 'other'],
    default: 'cash'
  },
  saleDate: {
    type: Date,
    default: Date.now
  },
  // 売上タイプの追加
  saleType: {
    type: String,
    enum: ['invoice_based', 'direct_sale'],
    default: 'direct_sale'
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// 支出記録モデル
const ExpenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  expenseDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'bank_transfer', 'other'],
    default: 'cash'
  },
  receipt: {
    type: String, // ファイルパスまたはURL
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// インデックスの設定
CustomerSchema.index({ email: 1 })
ProductSchema.index({ sku: 1 })
ProductSchema.index({ name: 1, category: 1 })
InvoiceSchema.index({ invoiceNumber: 1 })
InvoiceSchema.index({ customer: 1, issueDate: -1 })
SaleSchema.index({ saleDate: -1 })
ExpenseSchema.index({ expenseDate: -1, category: 1 })

// モデルのエクスポート
export const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema)
export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)
export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema)
export const Sale = mongoose.models.Sale || mongoose.model('Sale', SaleSchema)
export const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema)
