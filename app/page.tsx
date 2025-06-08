"use client"

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Zap, 
  Settings,
  ArrowRight,
  Users,
  Package,
  FileText,
  DollarSign
} from 'lucide-react'

/**
 * メインページ - バージョン選択
 * ビジネス管理プラットフォームのエントリーポイント
 */
export default function BusinessManagementPlatform() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ビジネス管理プラットフォーム
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            ビジネスニーズに合わせて選択してください
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* AI統合版 */}
          <Card className="relative overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <div className="absolute top-4 right-4">
              <Badge className="bg-blue-600 text-white">
                <Brain className="h-3 w-3 mr-1" />
                AI統合
              </Badge>
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-blue-900 flex items-center">
                <Zap className="h-6 w-6 mr-2 text-blue-600" />
                フル機能版
              </CardTitle>
              <p className="text-gray-600">
                AI機能を含む完全なビジネス管理プラットフォーム
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">主な機能:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Brain className="h-4 w-4 mr-2 text-blue-600" />
                    AIビジネスエージェント
                  </li>
                  <li className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-green-600" />
                    顧客管理
                  </li>
                  <li className="flex items-center">
                    <Package className="h-4 w-4 mr-2 text-purple-600" />
                    商品管理
                  </li>
                  <li className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-orange-600" />
                    請求書管理
                  </li>
                  <li className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-yellow-600" />
                    財務分析
                  </li>
                  <li className="flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-gray-600" />
                    パフォーマンス監視
                  </li>
                </ul>
              </div>
              <div className="pt-4">
                <Link href="/dashboard">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    フル機能版を使用
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* シンプル版 */}
          <Card className="relative overflow-hidden border-2 border-green-200 hover:border-green-400 transition-colors">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                🚫 AI機能なし
              </Badge>
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-green-900 flex items-center">
                <Settings className="h-6 w-6 mr-2 text-green-600" />
                シンプル版
              </CardTitle>
              <p className="text-gray-600">
                AI機能を省いた軽量なビジネス管理ツール
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">主な機能:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-green-600" />
                    顧客管理
                  </li>
                  <li className="flex items-center">
                    <Package className="h-4 w-4 mr-2 text-purple-600" />
                    商品管理
                  </li>
                  <li className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-orange-600" />
                    請求書管理
                  </li>
                  <li className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-yellow-600" />
                    基本的な財務管理
                  </li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800">
                  💡 軽量で高速、シンプルな操作性
                </p>
              </div>
              <div className="pt-2">
                <Link href="/simple-dashboard">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    シンプル版を使用
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            いつでもバージョンを切り替えることができます
          </p>
        </div>
      </div>
    </div>
  )
}
