"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * メインページ - ダッシュボードへのリダイレクト
 * ビジネス管理AIプラットフォームのエントリーポイント
 */
export default function BusinessManagementPlatform() {
  const router = useRouter()
  
  // ダッシュボードページへ自動リダイレクト
  useEffect(() => {
    router.push('/dashboard')
  }, [router])
  
  // リダイレクト中に表示するロードメッセージ
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-slate-800">
            AI統合ビジネス管理プラットフォーム
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="animate-pulse flex justify-center my-4">
            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-blue-400"></div>
            </div>
          </div>
          <p className="text-slate-600">ダッシュボードへ移動中...</p>
          <p className="text-sm text-slate-500 mt-2">自動的にリダイレクトされない場合は、<a href="/dashboard" className="text-blue-600 hover:underline">こちら</a>をクリック</p>
        </CardContent>
      </Card>
    </div>
  )
}
