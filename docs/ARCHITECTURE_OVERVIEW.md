# 🏗️ AI統合ビジネス管理プラットフォーム - システムアーキテクチャ

## 🎯 システム検証状況 ✅

### 完全動作確認済み（2025年6月7日）

**✅ エンドツーエンド通信フロー**
```
Frontend UI → Next.js API → AI Agent → MCP Client → MongoDB
                                   ↓
Frontend UI ← Streaming Response ← Ollama Proxy ← Ollama Core
```

**✅ 全コンポーネント統合テスト完了**
- MongoDB v8.0.10: ビジネスデータ完全取得可能
- Ollama Proxy (ポート11435): llama3.2モデル稼働
- MCP Server: 全ツール（顧客、売上、在庫、財務）動作確認
- Next.js (ポート3000): 全APIエンドポイント正常
- AI Agent Framework: 日本語処理・ストリーミング完璧

**✅ 実証済み機能**
- 日本語による自然な質問処理
- リアルタイムビジネスデータ分析
- 具体的な改善提案と優先順位付け
- ストリーミングレスポンス表示
- エラーハンドリングとフォールバック機能

**🚀 システムは本番環境での運用準備が完了しています。**

---

## 📋 概要

Business Management AI Platformは、GitHub Copilot風のAIエージェント機能を中核とした、次世代ビジネス管理システムです。Model Context Protocol (MCP)を活用した高速データアクセスと、Ollamaプロキシサーバーによる柔軟なAI統合を実現しています。

## 🔧 システム構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                     フロントエンド層                                │
│  ┌─────────────────────┐  ┌─────────────────────┐                │
│  │   Next.js Web App   │  │  AI Agent UI        │                │
│  │   (Port: 3000)      │  │  Components         │                │
│  └─────────────────────┘  └─────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     アプリケーション層                             │
│  ┌─────────────────────┐  ┌─────────────────────┐                │
│  │   API Routes        │  │  Business AI Agent  │                │
│  │   /api/*            │  │  Framework          │                │
│  └─────────────────────┘  └─────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
┌───────────────────────┐ ┌───────────────┐ ┌──────────────────┐
│    Ollama Proxy       │ │  MCP Server   │ │  Database Layer  │
│    (Port: 11435)      │ │  (MongoDB)    │ │  MongoDB         │
│                       │ │               │ │  (Port: 27017)   │
│  ┌─────────────────┐  │ │ ┌───────────┐ │ │                  │
│  │ API Key Auth    │  │ │ │ Customer  │ │ │  Collections:    │
│  │ Rate Limiting   │  │ │ │ Product   │ │ │  • customers     │
│  │ CORS Support    │  │ │ │ Sales     │ │ │  • products      │
│  └─────────────────┘  │ │ │ Finance   │ │ │  • sales         │
│                       │ │ │ Tools     │ │ │  • expenses      │
│  ┌─────────────────┐  │ │ └───────────┘ │ │  • invoices      │
│  │ Proxy to        │  │ └───────────────┘ │                  │
│  │ Ollama Server   │  │                   │                  │
│  │ (Port: 11434)   │  │                   │                  │
│  └─────────────────┘  │                   │                  │
└───────────────────────┘                   └──────────────────┘
                │                                     │
                ▼                                     │
┌───────────────────────┐                           │
│    Ollama Server      │◄──────────────────────────┘
│    (Port: 11434)      │
│                       │
│  Available Models:    │
│  • llama3.2:latest   │
│  • tinyllama:latest  │
│  • gemma3:1b         │
└───────────────────────┘
```

## 🛠️ 技術スタック詳細

### フロントエンド
- **Framework**: Next.js 15.0.0 (React 18.2.0)
- **UI Library**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **AI Integration**: Vercel AI SDK (@ai-sdk/react)
- **State Management**: React Hooks + Local Storage

### バックエンド
- **Runtime**: Node.js (ES Modules)
- **API**: Next.js API Routes
- **Database**: MongoDB (mongoose 8.15.1)
- **AI Framework**: Custom Business AI Agent
- **Protocol**: Model Context Protocol (MCP) SDK

### AI・ML
- **Local LLM**: Ollama (llama3.2, tinyllama, gemma3)
- **Proxy Server**: Express.js + CORS + Rate Limiting
- **Streaming**: Vercel AI SDK (streamText)
- **Learning**: Custom AILearningEngine

### インフラストラクチャ
- **Database**: MongoDB Community Server
- **Proxy**: Custom Ollama Proxy (Port 11435)
- **MCP Server**: Custom Node.js Server
- **Development**: Concurrently (Multi-process)

## 🔄 データフロー

### 1. ユーザークエリ処理フロー
```
User Input → BusinessAIAgent UI → /api/business-agent → AI Agent Framework
    ↓
Intent Analysis → Capability Detection → Data Collection (MCP) → AI Response
    ↓
Streaming Response ← Ollama Proxy ← AI Provider ← System Prompt + Context
```

### 2. MCP データアクセスフロー
```
AI Agent → MCP Client → MCP Server → MongoDB Collections
    ↓                      ↓              ↓
Business Data ←─────── Tool Execution ←─── Query Results
```

### 3. AIプロバイダー統合フロー
```
AI Request → Ollama Proxy → API Key Validation → Rate Limiting
    ↓              ↓              ↓              ↓
Ollama Server → Model Loading → Response Generation → Streaming
```

## 📂 プロジェクト構造

```
/Business-Management-AI-platform/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 api/                      # API Routes
│   │   ├── 📁 business-agent/       # AIエージェントAPI
│   │   ├── 📁 analytics/            # 分析データAPI
│   │   ├── 📁 customers/            # 顧客管理API
│   │   ├── 📁 demo-data/            # デモデータ生成API
│   │   └── 📁 ollama-models/        # Ollamaモデル管理API
│   ├── 📁 dashboard/                # ダッシュボードページ
│   ├── 📁 customers/                # 顧客管理ページ
│   └── 📁 finances/                 # 財務管理ページ
│
├── 📁 components/                   # Reactコンポーネント
│   ├── 📄 BusinessAIAgent.tsx       # AIエージェントUI
│   ├── 📄 AIQuickActions.tsx        # クイックアクション
│   ├── 📄 RealTimeBusinessMonitor.tsx # リアルタイム監視
│   └── 📁 ui/                       # 基本UIコンポーネント
│
├── 📁 lib/                          # 共通ライブラリ
│   ├── 📄 ai-agent.ts               # AIエージェントフレームワーク
│   ├── 📄 ai-learning.ts            # AI学習エンジン
│   ├── 📄 mcp-client.ts             # MCPクライアント
│   └── 📄 mongodb.ts                # MongoDB接続
│
├── 📁 scripts/                      # サーバースクリプト
│   ├── 📄 ollama-proxy-server.cjs   # Ollamaプロキシサーバー
│   └── 📄 mcp-server.cjs            # MCPサーバー
│
├── 📁 data/                         # データファイル
│   ├── 📄 customers.json            # 顧客データ
│   ├── 📄 products.json             # 商品データ
│   ├── 📄 sales.json                # 売上データ
│   └── 📄 finances.json             # 財務データ
│
└── 📁 docs/                         # ドキュメント
    ├── 📄 AI_AGENT_SPEC.md          # AIエージェント仕様
    ├── 📄 INSTALLATION_GUIDE.md     # インストールガイド
    └── 📄 FINAL_SYSTEM_TEST.md      # システムテスト結果
```

## 🔧 コンポーネント詳細

### 1. Business AI Agent Framework (`/lib/ai-agent.ts`)

**クラス構成:**
- `BusinessAIAgent`: メインエージェントクラス
- `BusinessInsightEngine`: ビジネス分析エンジン
- `AgentContext`: コンテキスト管理
- `AgentIntent`: 意図認識枚挙型
- `AgentCapability`: 機能枚挙型

**主要機能:**
1. **意図認識** (`analyzeIntent`)
2. **機能決定** (`getRequiredCapabilities`)
3. **データ収集** (`collectBusinessData`)
4. **AI応答生成** (`generateResponse`)

### 2. MCP Server (`/scripts/mcp-server.cjs`)

**提供ツール:**
- `get_customers`: 顧客データ取得
- `get_products`: 商品データ取得
- `get_sales_data`: 売上データ取得
- `get_financial_summary`: 財務サマリー取得

**特徴:**
- Model Context Protocol準拠
- MongoDB統合
- JSON フォールバック対応
- エラーハンドリング

### 3. Ollama Proxy Server (`/scripts/ollama-proxy-server.cjs`)

**機能:**
- OpenAI API互換エンドポイント
- APIキー認証
- レート制限 (15分間で100リクエスト)
- CORS対応
- リクエストプロキシ

**エンドポイント:**
- `GET /v1/models`: 利用可能モデル一覧
- `POST /v1/chat/completions`: チャット補完
- `POST /v1/completions`: テキスト補完

## ⚙️ 環境設定

### 必要な環境変数 (`.env.local`)
```bash
# AI Provider Settings
NEXT_PUBLIC_AI_PROVIDER=ollama
NEXT_PUBLIC_AI_MODEL=llama3.2
NEXT_PUBLIC_AI_API_KEY=ollama-local-key-123
NEXT_PUBLIC_AI_ENDPOINT=http://localhost:11435/v1

# Database Settings
MONGODB_URI=mongodb://localhost:27017/business-management
USE_JSON_FALLBACK=true

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=AI統合ビジネス管理プラットフォーム
```

### サービス起動順序
```bash
# 1. MongoDB起動
brew services start mongodb-community

# 2. Ollama起動
ollama serve

# 3. 必要なモデルダウンロード
ollama pull llama3.2
ollama pull tinyllama

# 4. フルスタック開発サーバー起動
npm run dev-full-stack
```

## 🔒 セキュリティ仕様

### 認証・認可
- **APIキー認証**: Ollamaプロキシサーバー
- **レート制限**: 15分間で100リクエスト
- **CORS設定**: オリジン制限

### データプライバシー
- **ローカル処理**: AIモデルはローカルで実行
- **データ暗号化**: MongoDB接続暗号化対応
- **ログ管理**: 個人情報のログ出力制限

## 📈 パフォーマンス最適化

### フロントエンド
- **コンポーネント最適化**: React.memo使用
- **画像最適化**: Next.js Image コンポーネント
- **バンドル最適化**: Tree Shaking

### バックエンド
- **データベース**: MongoDB インデックス最適化
- **キャッシュ**: API レスポンスキャッシュ
- **ストリーミング**: AI応答のリアルタイムストリーミング

### AI処理
- **モデル最適化**: 軽量モデル (tinyllama) 対応
- **並列処理**: 複数データソース並列取得
- **タイムアウト管理**: 5分タイムアウト設定

## 🚀 デプロイメント

### 開発環境
```bash
npm run dev-full-stack  # 全サービス同時起動
```

### 本番環境 (推奨構成)
- **Frontend**: Vercel / Netlify
- **Database**: MongoDB Atlas
- **AI**: 専用Ollamaサーバー
- **Monitoring**: Application Insights

## 🔧 トラブルシューティング

### よくある問題と解決方法

1. **AIエージェントが応答しない**
   - Ollamaサーバーの起動確認: `ollama serve`
   - プロキシサーバーの起動確認: ポート11435
   - APIキーの確認: `ollama-local-key-123`

2. **MongoDBデータが表示されない**
   - MongoDB起動確認: `brew services list | grep mongodb`
   - データベース接続確認: `mongosh business-management`
   - デモデータ生成: `curl -X POST http://localhost:3000/api/demo-data`

3. **MCPサーバーエラー**
   - MCPサーバー起動確認: ポート確認
   - MongoDB接続確認
   - フォールバックモード有効化: `USE_JSON_FALLBACK=true`

## 📊 システム監視

### ヘルスチェック
- **フロントエンド**: `http://localhost:3000`
- **Ollamaプロキシ**: `http://localhost:11435/v1/models`
- **MongoDB**: `mongosh --eval "db.runCommand('ping')"`

### ログ監視
- **Next.js**: コンソール出力
- **MCP Server**: STDERR出力
- **Ollama**: Ollamaログファイル

---

**更新日**: 2025年1月7日  
**バージョン**: 1.0.0  
**作成者**: AI Business Management Team
