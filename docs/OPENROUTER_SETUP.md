# 🚀 OpenRouter + DeepSeek R1 セットアップガイド

このガイドでは、ビジネス管理AIプラットフォームでOpenRouter経由のDeepSeek R1無料APIを使用する方法を説明します。

## 📋 概要

- **プロバイダー**: OpenRouter
- **推奨モデル**: DeepSeek R1 0528 (無料)
- **API互換性**: OpenAI形式
- **エンドポイント**: `https://openrouter.ai/api/v1`

## 🔧 セットアップ手順

### 1. OpenRouterアカウント作成

1. [OpenRouter.ai](https://openrouter.ai)にアクセス
2. アカウントを作成
3. ダッシュボードでAPIキーを生成

### 2. 環境変数設定

`.env.local`ファイルを作成し、以下を設定：

```bash
# OpenRouter設定
NEXT_PUBLIC_AI_PROVIDER=openrouter
NEXT_PUBLIC_AI_MODEL=deepseek/deepseek-r1-0528
NEXT_PUBLIC_AI_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_AI_ENDPOINT=https://openrouter.ai/api/v1

# データベース設定
MONGODB_URI=mongodb://localhost:27017/business-management
USE_JSON_FALLBACK=true

# アプリケーション設定
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=AI統合ビジネス管理プラットフォーム
```

### 3. 利用可能なモデル

```typescript
// 無料モデル（推奨）
'deepseek/deepseek-r1-0528'               // DeepSeek R1 最新版（推奨・無料）
'deepseek/deepseek-r1-distill-llama-70b'  // DeepSeek R1 蒸留版（無料）
'deepseek/deepseek-r1-distill-qwen-32b'   // DeepSeek R1 Qwen版（無料）

// その他のモデル
'deepseek/deepseek-r1'                    // DeepSeek R1 フルモデル
'deepseek/deepseek-chat'                  // DeepSeek 汎用チャット
```

## 🛠️ プログラムでの使用方法

### 基本的な使用

```typescript
import { processBusinessQuery } from '@/lib/ai-agent'

const result = await processBusinessQuery(
  "売上分析をお願いします",
  {
    provider: 'openrouter',
    apiKey: process.env.NEXT_PUBLIC_AI_API_KEY,
    modelId: 'deepseek/deepseek-r1-0528',
    apiEndpoint: 'https://openrouter.ai/api/v1'
  }
)
```

### API経由での使用

```javascript
const response = await fetch('/api/business-agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "今月の財務状況を教えて",
    provider: 'openrouter',
    apiKey: 'your_openrouter_api_key',
    modelId: 'deepseek/deepseek-r1-0528'
  })
})
```

## 💰 料金について

### 無料モデル
- **DeepSeek R1 0528**: 完全無料（推奨）
- **DeepSeek R1 Distill Llama 70B**: 完全無料
- **DeepSeek R1 Distill Qwen 32B**: 完全無料

### 注意事項
- 無料モデルには使用制限がある場合があります
- 詳細はOpenRouterの利用規約を確認してください

## 🔒 セキュリティ

### APIキー管理
```bash
# 本番環境では環境変数で管理
export NEXT_PUBLIC_AI_API_KEY="your_secure_api_key"

# 開発環境では.env.localファイル
echo "NEXT_PUBLIC_AI_API_KEY=your_api_key" >> .env.local
```

### アクセス制御
- APIキーは適切に保護してください
- 本番環境では専用のAPIキーを使用
- 定期的なAPIキーローテーションを推奨

## 🚀 起動方法

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build
npm start
```

## 🔧 トラブルシューティング

### よくある問題

#### 1. APIキーエラー
```
Error: Invalid API key provided
```

**解決方法:**
- `.env.local`のAPIキーを確認
- OpenRouterダッシュボードでAPIキーの有効性を確認

#### 2. モデルアクセスエラー
```
Error: Model not found
```

**解決方法:**
- モデル名のスペルミスを確認
- OpenRouterで利用可能なモデルを確認

#### 3. レート制限エラー
```
Error: Rate limit exceeded
```

**解決方法:**
- しばらく待ってから再試行
- 有料プランへのアップグレードを検討

### デバッグ方法

```bash
# ログレベルを上げてデバッグ
DEBUG=* npm run dev

# APIテスト
curl -X POST http://localhost:3000/api/test-ai \
  -H "Content-Type: application/json" \
  -d '{"query": "Hello, test"}'
```

## 📚 参考リンク

- [OpenRouter公式サイト](https://openrouter.ai)
- [DeepSeek公式サイト](https://www.deepseek.com)
- [OpenAI API互換性ドキュメント](https://openrouter.ai/docs)

## 🤝 サポート

問題が発生した場合:
1. このドキュメントのトラブルシューティングを確認
2. OpenRouterのサポートに問い合わせ
3. プロジェクトのIssueで報告