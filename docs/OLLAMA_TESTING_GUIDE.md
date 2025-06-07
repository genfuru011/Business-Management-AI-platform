# 🧪 Ollama API Key 実装テストガイド

## 🚀 クイックスタート

### 1. 前提条件
- Node.js がインストール済み
- Ollama がインストール済み (`brew install ollama` または公式サイトから)

### 2. セットアップ手順

```bash
# 1. セットアップスクリプト実行
./scripts/setup-ollama-proxy.sh

# 2. Ollamaサーバー起動
ollama serve

# 3. 必要なモデルをインストール
ollama pull llama3.2

# 4. プロキシサーバー起動
npm run ollama-proxy

# 5. (別ターミナルで) 開発サーバー起動
npm run dev
```

## 🔧 設定

### 環境変数 (.env)

```bash
# Ollama with API Key
NEXT_PUBLIC_AI_PROVIDER=ollama
NEXT_PUBLIC_AI_MODEL=llama3.2
NEXT_PUBLIC_AI_API_KEY=ollama-local-key-123
NEXT_PUBLIC_AI_ENDPOINT=http://localhost:11435/v1

# プロキシサーバー設定
OLLAMA_API_KEYS=ollama-local-key-123,ollama-dev-key-456
OLLAMA_HOST=http://localhost:11434
OLLAMA_PROXY_PORT=11435
```

### 同LAN内の他のPCからアクセス

```bash
# プロキシサーバーを外部アクセス可能に
OLLAMA_PROXY_PORT=11435
OLLAMA_HOST=http://localhost:11434

# クライアント側設定
NEXT_PUBLIC_AI_ENDPOINT=http://192.168.1.100:11435/v1
```

## 🧪 テスト方法

### 1. ヘルスチェック

```bash
curl http://localhost:11435/health
```

期待されるレスポンス:
```json
{
  "status": "ok",
  "timestamp": "2025-06-07T10:30:00.000Z",
  "ollama_host": "http://localhost:11434"
}
```

### 2. APIキー認証テスト

```bash
# 有効なAPIキー
curl -H "Authorization: Bearer ollama-local-key-123" \
     http://localhost:11435/v1/models

# 無効なAPIキー (401エラー)
curl -H "Authorization: Bearer invalid-key" \
     http://localhost:11435/v1/models
```

### 3. チャット補完テスト

```bash
curl -X POST http://localhost:11435/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ollama-local-key-123" \
  -d '{
    "model": "llama3.2",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

### 4. ストリーミングテスト

```bash
curl -X POST http://localhost:11435/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ollama-local-key-123" \
  -d '{
    "model": "llama3.2",
    "messages": [
      {"role": "user", "content": "Tell me a short story"}
    ],
    "stream": true
  }'
```

## 🎯 ビジネス管理プラットフォームでの使用

### AIエージェントでのテスト

1. ブラウザで `http://localhost:3000` にアクセス
2. ダッシュボードページに移動
3. AIエージェント（チャットボックス）を開く
4. 質問を入力: "今月の売上状況を教えて"

### フロントエンド設定確認

ブラウザの開発者ツールで以下を確認:
- ネットワークタブでプロキシサーバーへのリクエスト
- コンソールでエラーログの確認

## 🐛 トラブルシューティング

### よくある問題

#### 1. "Connection refused" エラー
```bash
# Ollamaサーバーが起動しているか確認
ps aux | grep ollama

# ポートが使用中か確認
lsof -i :11434
lsof -i :11435
```

#### 2. "Invalid API key" エラー
```bash
# 環境変数を確認
echo $OLLAMA_API_KEYS

# プロキシサーバーのログを確認
npm run ollama-proxy
```

#### 3. モデルが見つからない
```bash
# インストール済みモデルを確認
ollama list

# 新しいモデルをインストール
ollama pull llama3.2
```

#### 4. プロキシサーバーが起動しない
```bash
# 依存関係を再インストール
npm install express http-proxy-middleware cors express-rate-limit

# Node.jsバージョンを確認 (Node.js 16以上推奨)
node --version
```

## 📊 パフォーマンス最適化

### 1. モデル選択

| モデル | サイズ | 推奨用途 | パフォーマンス |
|--------|--------|----------|----------------|
| llama3.2:1b | 1.3GB | 軽量タスク | ⭐⭐⭐⭐⭐ |
| llama3.2 | 2.0GB | 一般用途 | ⭐⭐⭐⭐ |
| llama3.1 | 4.7GB | 高精度 | ⭐⭐⭐ |

### 2. システム要件

- **RAM**: 最低8GB、推奨16GB以上
- **CPU**: 多コア推奨
- **GPU**: NVIDIA GPU使用でさらに高速化可能

### 3. 設定調整

```javascript
// ollama-proxy-server.js の設定
const ollamaRequest = {
  model: model,
  messages: messages,
  options: {
    temperature: 0.7,     // 創造性調整
    num_predict: 2048,    // 最大生成トークン数
    top_p: 0.9,          // 核サンプリング
    top_k: 40            // トップK サンプリング
  }
};
```

## 🔒 セキュリティ設定

### 1. APIキーのローテーション

```bash
# 定期的にAPIキーを変更
export OLLAMA_API_KEYS="new-key-1,new-key-2,old-key-1"
```

### 2. ネットワーク制限

```bash
# ファイアウォール設定 (macOS)
sudo pfctl -f /etc/pf.conf

# 特定IPからのみアクセス許可
# pf.conf に追加:
# pass in inet proto tcp from 192.168.1.0/24 to any port 11435
```

### 3. ログ監視

```bash
# アクセスログの確認
tail -f logs/ollama-proxy.log

# 異常なアクセスパターンの検出
grep "Unauthorized" logs/ollama-proxy.log
```

---

作成日: 2025年6月7日  
最終更新: 2025年6月7日
