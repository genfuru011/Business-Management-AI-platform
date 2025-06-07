# 🔗 MCPサーバー実装仕様書

## 📌 概要

Model Context Protocol (MCP) サーバーは、AIエージェントとビジネス管理データベース間の専用ブリッジとして機能します。OpenAI GPT、Anthropic Claude、ローカルLLMなど様々なAIプロバイダーから統一されたインターフェースでビジネスデータにアクセス可能にします。

## 🏗️ アーキテクチャ

```
Business Management APP
    ↓ (HTTP/WebSocket)
AI Agent (Ollama + Proxy)
    ↓ (MCP Protocol)
MCP Server
    ↓ (MongoDB/JSON)
Business Database
```

## ⚙️ 主要機能

### 1. ツール提供 (Tools)

- **get_customers** - 顧客データ取得
- **get_customer_by_id** - 個別顧客データ取得
- **get_products** - 商品データ取得
- **get_sales_data** - 売上データ取得・集計
- **get_financial_summary** - 財務サマリー取得
- **create_business_report** - ビジネスレポート生成
- **search_business_data** - 横断的データ検索

### 2. リソース提供 (Resources)

- **customer_list** - 顧客一覧データ
- **product_catalog** - 商品カタログ
- **sales_reports** - 売上レポート
- **financial_statements** - 財務諸表

### 3. プロンプト提供 (Prompts)

- **business_analysis** - ビジネス分析用プロンプト
- **customer_insights** - 顧客洞察プロンプト
- **sales_forecast** - 売上予測プロンプト

## 🛠️ 技術仕様

### プロトコル
- **MCP 1.0** - Model Context Protocol
- **JSON-RPC 2.0** - 通信プロトコル
- **WebSocket/HTTP** - トランスポート層

### データベース接続
- **MongoDB** - メインデータベース
- **JSON Fallback** - ローカルデータファイル対応

### セキュリティ
- **API Key認証**
- **リクエストレート制限**
- **データアクセス制御**

## 📂 ファイル構成

```
scripts/
├── mcp-server.js           # MCPサーバーメイン
├── mcp-tools.js           # ツール定義
├── mcp-resources.js       # リソース定義
└── mcp-prompts.js         # プロンプト定義

config/
└── mcp-server-config.json # MCP設定ファイル
```

## 🚀 APIエンドポイント

### Tools API
```javascript
// 顧客データ取得
{
  "name": "get_customers",
  "description": "顧客データを取得します",
  "inputSchema": {
    "type": "object",
    "properties": {
      "limit": { "type": "number" },
      "filter": { "type": "string" }
    }
  }
}
```

### Resources API
```javascript
// 売上レポートリソース
{
  "uri": "business://sales/monthly-report",
  "name": "月次売上レポート",
  "mimeType": "application/json"
}
```

## 🔧 設定項目

### 環境変数
```env
MCP_SERVER_PORT=3005
MCP_SERVER_HOST=localhost
MONGODB_URI=mongodb://localhost:27017/business-management
MCP_API_KEY=mcp-business-key-456
MCP_LOG_LEVEL=info
```

### 接続設定
```json
{
  "mcpServers": {
    "business-data": {
      "command": "node",
      "args": ["scripts/mcp-server.js"],
      "env": {
        "MCP_SERVER_PORT": "3005"
      }
    }
  }
}
```

## 📊 データフロー

1. **AIエージェント** がビジネス質問を受信
2. **MCPクライアント** が適切なツールを呼び出し
3. **MCPサーバー** がMongoDBからデータ取得
4. **構造化データ** をAIエージェントに返却
5. **AIエージェント** がデータを分析・回答生成

## 🎯 実装優先度

### Phase 1 (必須)
- [ ] MCPサーバー基盤実装
- [ ] 基本ツール (get_customers, get_sales_data)
- [ ] MongoDB接続・クエリ機能

### Phase 2 (重要)
- [ ] 全ビジネスツールの実装
- [ ] エラーハンドリング・ログ機能
- [ ] パフォーマンス最適化

### Phase 3 (拡張)
- [ ] リアルタイムデータ更新
- [ ] カスタムクエリ機能
- [ ] 分析ダッシュボード連携

## 🧪 テスト項目

- **単体テスト** - 各ツール機能の検証
- **統合テスト** - AIエージェント⇔MCP⇔DB連携
- **パフォーマンステスト** - 大容量データ処理
- **セキュリティテスト** - 認証・認可機能

---

作成日: 2025年6月7日
作成者: Business Management AI Team
