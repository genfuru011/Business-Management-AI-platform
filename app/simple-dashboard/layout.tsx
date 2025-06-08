import type React from "react"
import type { Metadata } from "next"
import "../globals.css"
import SimpleNavigation from "@/components/SimpleNavigation"

export const metadata: Metadata = {
  title: "Simple Business Management Platform",
  description: "シンプルなビジネス管理プラットフォーム（AI機能なし）",
}

export default function SimpleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <SimpleNavigation />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  )
}