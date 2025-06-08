# 📊 Simple Business Management Platform

## 概要

このディレクトリには、AI機能を省いたシンプルなビジネス管理プラットフォームが含まれています。
マイクロアーキテクチャの観点から、基本的なビジネス管理機能のみに焦点を当てています。

## 特徴

- 🏗️ **シンプルな構造**: 最小限のディレクトリ構成
- 📊 **基本機能**: 顧客管理、商品管理、請求書、財務管理
- 🚫 **AI機能なし**: AI関連の複雑さを排除
- 📱 **レスポンシブUI**: モダンで使いやすいインターフェース

## ディレクトリ構成

```
simple-version/
├── components/           # UI コンポーネント
│   ├── ui/              # 基本UIコンポーネント
│   └── business/        # ビジネス固有コンポーネント
├── pages/               # ページコンポーネント
│   ├── customers/       # 顧客管理
│   ├── products/        # 商品管理
│   ├── invoices/        # 請求書管理
│   └── finances/        # 財務管理
├── lib/                 # ユーティリティ関数
├── data/                # サンプルデータ
└── types/               # TypeScript型定義
```

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev:simple

# ビルド
npm run build:simple
```

## 主要機能

1. **顧客管理** - 顧客情報の追加、編集、削除
2. **商品管理** - 商品カタログの管理
3. **請求書管理** - 請求書の作成と管理
4. **財務ダッシュボード** - 売上とコストの可視化
5. **レポート出力** - 基本的なレポート機能

## 技術スタック

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Data**: JSON ファイル（ローカル）