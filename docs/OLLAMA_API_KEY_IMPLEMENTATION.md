# 🔐 Ollama APIキー認証実装ガイド

## 📌 概要

同PC内または同LAN内で動作するOllamaサーバーにAPIキー認証を追加し、OpenAI SDK経由でアクセスする実装方法について説明します。

## 🏗️ 実装方式

### 方式1: プロキシサーバー方式 (推奨)

Ollamaサーバーの前段にプロキシサーバーを配置し、APIキー認証を追加します。

#### 1.1 Express プロキシサーバー

```javascript
// ollama-proxy-server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// APIキー認証ミドルウェア
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['authorization']?.replace('Bearer ', '');
  const validApiKeys = process.env.OLLAMA_API_KEYS?.split(',') || ['ollama-local-key-123'];
  
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};

// プロキシ設定
app.use('/v1', apiKeyAuth, createProxyMiddleware({
  target: 'http://localhost:11434',
  changeOrigin: true,
  pathRewrite: {
    '^/v1/chat/completions': '/api/chat',
    '^/v1/models': '/api/tags'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Ollamaフォーマットに変換
    if (req.method === 'POST' && req.url.includes('chat/completions')) {
      // OpenAI形式からOllama形式への変換ロジック
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // Ollama形式からOpenAI形式への変換ロジック
  }
}));

app.listen(11435, () => {
  console.log('Ollama Proxy Server running on port 11435');
});
```

#### 1.2 設定例

```bash
# .env に追加
OLLAMA_PROXY_URL=http://localhost:11435
OLLAMA_API_KEY=ollama-local-key-123
```

### 方式2: カスタムAPIアダプター

OpenAI SDKのアダプターを作成してOllama APIに直接接続：

```typescript
// lib/ollama-adapter.ts
import { createOpenAI } from '@ai-sdk/openai';

export function createOllamaProvider(config: {
  baseURL: string;
  apiKey: string;
  model: string;
}) {
  return createOpenAI({
    baseURL: config.baseURL,
    apiKey: config.apiKey || 'dummy-key',
    fetch: async (url, options) => {
      // カスタムfetch実装でOllama APIに変換
      const ollamaUrl = url.toString().replace('/chat/completions', '/api/chat');
      
      // リクエストボディをOllama形式に変換
      if (options?.body) {
        const openaiRequest = JSON.parse(options.body as string);
        const ollamaRequest = {
          model: config.model,
          messages: openaiRequest.messages,
          stream: openaiRequest.stream || false
        };
        options.body = JSON.stringify(ollamaRequest);
      }
      
      return fetch(ollamaUrl, options);
    }
  });
}
```

### 方式3: APIゲートウェイ経由

```typescript
// app/api/ollama-gateway/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // APIキー検証
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');
    
    if (!isValidApiKey(apiKey)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // OpenAI形式からOllama形式に変換
    const ollamaRequest = {
      model: body.model,
      messages: body.messages,
      stream: body.stream || false
    };
    
    // Ollamaサーバーに転送
    const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ollamaRequest)
    });
    
    // レスポンスをOpenAI形式に変換して返却
    const result = await ollamaResponse.json();
    const openaiResponse = convertToOpenAIFormat(result);
    
    return NextResponse.json(openaiResponse);
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function isValidApiKey(apiKey: string | undefined): boolean {
  const validKeys = process.env.OLLAMA_API_KEYS?.split(',') || ['default-key'];
  return apiKey ? validKeys.includes(apiKey) : false;
}
```

## 🔧 現行システムとの統合

現在のビジネス管理プラットフォームに統合する場合：

### 1. 環境変数設定

```bash
# .env.example に追加
# Ollama Settings (Local/LAN)
NEXT_PUBLIC_AI_PROVIDER=ollama
NEXT_PUBLIC_AI_MODEL=llama3.2
NEXT_PUBLIC_AI_API_KEY=ollama-local-key-123
NEXT_PUBLIC_AI_ENDPOINT=http://localhost:11435/v1  # プロキシサーバー経由
# NEXT_PUBLIC_AI_ENDPOINT=http://192.168.1.100:11435/v1  # LAN内の他のPC
```

### 2. ai-agent.ts の設定確認

既存の実装は既に対応済み：

```typescript
// lib/ai-agent.ts (既存コード)
const llmProvider = createOpenAI({
  baseURL: this.aiConfig.apiEndpoint,  // Ollamaプロキシを指定
  apiKey: this.aiConfig.apiKey || "dummy"  // カスタムAPIキー
})
```

### 3. フロントエンド設定

```typescript
// components/BusinessAIAgent.tsx での使用例
const response = await fetch('/api/business-agent', {
  method: 'POST',
  body: JSON.stringify({
    query: userInput,
    provider: 'ollama',
    apiKey: 'ollama-local-key-123',
    modelId: 'llama3.2',
    apiEndpoint: 'http://localhost:11435/v1'
  })
});
```

## 🔒 セキュリティ考慮事項

1. **ネットワーク分離**: プロキシサーバーは内部ネットワークでのみアクセス可能
2. **APIキー管理**: 環境変数または設定ファイルで管理
3. **認証ログ**: アクセスログの記録
4. **レート制限**: 過度なリクエストの制限

## 🚦 動作確認手順

1. Ollamaサーバー起動: `ollama serve`
2. プロキシサーバー起動: `node ollama-proxy-server.js`
3. 環境変数設定: `.env` ファイル更新
4. アプリケーション起動: `npm run dev`
5. AIエージェントでテスト実行

## 📈 メリット

- **セキュリティ**: APIキー認証によるアクセス制御
- **互換性**: OpenAI SDKをそのまま使用可能
- **柔軟性**: 複数のAPIキーで異なるアクセス権限設定
- **監視**: プロキシ層でのログ記録・監視
- **パフォーマンス**: ローカルネットワークでの高速通信

---

作成日: 2025年6月7日
作成者: AI Business Management Team
