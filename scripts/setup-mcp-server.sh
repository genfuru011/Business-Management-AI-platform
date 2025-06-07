#!/bin/bash

# MCP Server Setup Script
# Model Context Protocol サーバーの自動セットアップ

set -e

echo "🔗 MCPサーバーセットアップを開始します..."

# 1. 必要なディレクトリの作成
echo "📁 ディレクトリ構造を作成しています..."
mkdir -p config
mkdir -p logs

# 2. MCP SDK の依存関係インストール
echo "📦 MCP SDK をインストールしています..."
if npm list @modelcontextprotocol/sdk >/dev/null 2>&1; then
    echo "✅ @modelcontextprotocol/sdk は既にインストール済みです"
else
    echo "🔧 @modelcontextprotocol/sdk をインストール中..."
    npm install @modelcontextprotocol/sdk
fi

# 3. 追加の依存関係確認
echo "🔍 その他の依存関係を確認しています..."
if npm list mongoose >/dev/null 2>&1; then
    echo "✅ mongoose は既にインストール済みです"
else
    echo "🔧 mongoose をインストール中..."
    npm install mongoose
fi

# 4. 環境変数ファイルの設定
echo "⚙️ 環境変数を設定しています..."
if [ ! -f .env ]; then
    echo "❌ .env ファイルが見つかりません"
    exit 1
fi

# MCPサーバー用の環境変数を追加（まだない場合）
if ! grep -q "MCP_SERVER_PORT" .env; then
    echo "" >> .env
    echo "# MCP Server Configuration" >> .env
    echo "MCP_SERVER_PORT=3005" >> .env
    echo "MCP_SERVER_HOST=localhost" >> .env
    echo "MCP_API_KEY=mcp-business-key-456" >> .env
    echo "MCP_LOG_LEVEL=info" >> .env
    echo "✅ MCP環境変数を.envに追加しました"
else
    echo "✅ MCP環境変数は既に設定済みです"
fi

# 5. MCPサーバーファイルの実行権限付与
echo "🔐 MCPサーバーファイルに実行権限を付与しています..."
chmod +x scripts/mcp-server.js

# 6. MCPサーバーの基本動作テスト
echo "🧪 MCPサーバーの基本動作をテストしています..."

# Node.js バージョン確認
echo "📋 Node.js バージョン: $(node --version)"

# MCPサーバーファイルの構文チェック
echo "🔍 MCPサーバーファイルの構文をチェックしています..."
if node -c scripts/mcp-server.js; then
    echo "✅ MCPサーバーファイルの構文は正常です"
else
    echo "❌ MCPサーバーファイルに構文エラーがあります"
    exit 1
fi

# 7. JSONデータファイルの確認
echo "📄 JSONデータファイルを確認しています..."
data_files=("customers.json" "products.json" "sales.json" "finances.json")
for file in "${data_files[@]}"; do
    if [ -f "data/$file" ]; then
        echo "✅ data/$file が存在します"
    else
        echo "⚠️  data/$file が見つかりません（MCPサーバーはMongoDB接続にフォールバックします）"
    fi
done

# 8. MongoDBの接続テスト（オプション）
echo "🗄️ MongoDB接続をテストしています..."
MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/business-management"}

if command -v mongosh >/dev/null 2>&1; then
    if timeout 5 mongosh "$MONGODB_URI" --eval "db.runCommand('ping')" >/dev/null 2>&1; then
        echo "✅ MongoDB接続成功: $MONGODB_URI"
    else
        echo "⚠️  MongoDB接続失敗: JSONフォールバックモードで動作します"
    fi
else
    echo "ℹ️  mongosh が見つかりません。MongoDB接続テストをスキップします"
fi

# 9. MCPサーバー設定ファイルの確認
echo "📋 MCP設定ファイルを確認しています..."
if [ -f "config/mcp-server-config.json" ]; then
    echo "✅ MCP設定ファイルが存在します"
    if node -e "JSON.parse(require('fs').readFileSync('config/mcp-server-config.json'))" 2>/dev/null; then
        echo "✅ MCP設定ファイルのJSON形式は正常です"
    else
        echo "❌ MCP設定ファイルのJSON形式にエラーがあります"
        exit 1
    fi
else
    echo "❌ MCP設定ファイルが見つかりません"
    exit 1
fi

# 10. セットアップ完了メッセージ
echo ""
echo "🎉 MCPサーバーのセットアップが完了しました！"
echo ""
echo "📋 次の手順:"
echo "1. MCPサーバーを起動: npm run mcp-server"
echo "2. または開発モード: npm run mcp-server-dev"
echo "3. フルスタック開発: npm run dev-full-stack"
echo ""
echo "🔧 利用可能なMCPツール:"
echo "   - get_customers: 顧客データ取得"
echo "   - get_products: 商品データ取得"
echo "   - get_sales_data: 売上データ取得"
echo "   - get_financial_summary: 財務サマリー"
echo "   - search_business_data: データ検索"
echo ""
echo "🌐 MCPサーバーポート: 3005"
echo "📊 ダッシュボード: http://localhost:3001"
echo "🔗 Ollamaプロキシ: http://localhost:11435"
echo ""
echo "📄 詳細情報: docs/MCP_SERVER_SPEC.md"
