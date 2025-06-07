#!/bin/bash

# Ollama Proxy Server セットアップスクリプト
# Usage: ./scripts/setup-ollama-proxy.sh

echo "🚀 Ollama Proxy Server セットアップを開始します..."

# 依存関係のインストール確認
echo "📦 依存関係を確認中..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js がインストールされていません"
    exit 1
fi

# プロキシサーバー用の依存関係をインストール
echo "📦 プロキシサーバー用依存関係をインストール中..."
npm install express http-proxy-middleware cors express-rate-limit --save-dev

# Ollamaサーバーの起動確認
echo "🔍 Ollamaサーバーの確認中..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollamaサーバーが起動中です"
else
    echo "⚠️  Ollamaサーバーが起動していません"
    echo "   Ollamaを起動してください: ollama serve"
fi

# 環境変数ファイルの確認
if [ ! -f .env ]; then
    echo "📝 .env ファイルを作成中..."
    cp .env.example .env
    echo "✅ .env ファイルを作成しました"
    echo "   必要に応じて設定を変更してください"
else
    echo "✅ .env ファイルが存在します"
fi

# プロキシサーバーの実行権限設定
chmod +x scripts/ollama-proxy-server.js

echo ""
echo "🎉 セットアップ完了！"
echo ""
echo "📋 使用方法:"
echo "   1. Ollamaサーバー起動: ollama serve"
echo "   2. プロキシサーバー起動: npm run ollama-proxy"
echo "   3. 開発サーバー起動: npm run dev"
echo "   または同時起動: npm run dev-with-proxy"
echo ""
echo "🔧 設定:"
echo "   - プロキシサーバーポート: 11435"
echo "   - APIキー: ollama-local-key-123"
echo "   - エンドポイント: http://localhost:11435/v1"
echo ""
echo "🔗 テストURL:"
echo "   - ヘルスチェック: curl http://localhost:11435/health"
echo "   - モデル一覧: curl -H \"Authorization: Bearer ollama-local-key-123\" http://localhost:11435/v1/models"
