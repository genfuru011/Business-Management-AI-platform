#!/usr/bin/env node

/**
 * Ollama Proxy Server with API Key Authentication
 * OpenAI API互換のエンドポイントを提供し、内部のOllamaサーバーにプロキシします
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.OLLAMA_PROXY_PORT || 11435;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

// ミドルウェア設定
app.use(express.json());
app.use(cors());

// レート制限
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 最大100リクエスト
  message: { error: 'Too many requests from this IP' }
});
app.use(limiter);

// APIキー認証ミドルウェア
const apiKeyAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const apiKey = authHeader?.replace('Bearer ', '');
  
  // 環境変数またはデフォルトのAPIキー
  const validApiKeys = (process.env.OLLAMA_API_KEYS || 'ollama-local-key-123,ollama-dev-key-456').split(',');
  
  console.log(`[${new Date().toISOString()}] API Key Request: ${apiKey ? '***' : 'None'}`);
  
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    console.log(`[${new Date().toISOString()}] Unauthorized request from ${req.ip}`);
    return res.status(401).json({ 
      error: { 
        message: 'Invalid API key provided',
        type: 'invalid_request_error',
        code: 'invalid_api_key'
      }
    });
  }
  
  console.log(`[${new Date().toISOString()}] Authorized request for ${req.path}`);
  next();
};

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    ollama_host: OLLAMA_HOST 
  });
});

// モデル一覧 (OpenAI互換)
app.get('/v1/models', apiKeyAuth, async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`);
    const data = await response.json();
    
    // OpenAI形式に変換
    const models = data.models?.map(model => ({
      id: model.name,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: 'ollama',
      permission: [],
      root: model.name,
      parent: null
    })) || [];
    
    res.json({
      object: 'list',
      data: models
    });
  } catch (error) {
    console.error('Models endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// チャット補完 (OpenAI互換)
app.post('/v1/chat/completions', apiKeyAuth, async (req, res) => {
  try {
    const { model, messages, stream = false, temperature, max_tokens, ...otherParams } = req.body;
    
    console.log(`[${new Date().toISOString()}] Chat request for model: ${model}`);
    
    // Ollama形式に変換
    const ollamaRequest = {
      model: model || 'llama3.2',
      messages: messages,
      stream: stream,
      options: {
        temperature: temperature,
        num_predict: max_tokens,
        ...otherParams
      }
    };
     if (stream) {
      // ストリーミングレスポンス
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5分タイムアウト
      
      const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ollamaRequest),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const ollamaData = JSON.parse(line);
            
            // OpenAI形式に変換
            const openaiChunk = {
              id: `chatcmpl-${Date.now()}`,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: model,
              choices: [{
                index: 0,
                delta: {
                  content: ollamaData.message?.content || ''
                },
                finish_reason: ollamaData.done ? 'stop' : null
              }]
            };
            
            res.write(`data: ${JSON.stringify(openaiChunk)}\n\n`);

            if (ollamaData.done) {
              res.write('data: [DONE]\n\n');
              res.end();
              return;
            }
          } catch (parseError) {
            // JSONパースエラーは無視
          }
        }
      }
    } else {
      // 非ストリーミングレスポンス
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5分タイムアウト
      
      const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ollamaRequest),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      // OpenAI形式に変換
      const openaiResponse = {
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: data.message?.content || ''
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: data.prompt_eval_count || 0,
          completion_tokens: data.eval_count || 0,
          total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        }
      };
      
      res.json(openaiResponse);
    }
  } catch (error) {
    console.error('Chat completion error:', error);
    
    if (error.name === 'AbortError') {
      res.status(408).json({ 
        error: { 
          message: 'Request timeout - The AI model took too long to respond', 
          type: 'timeout_error',
          code: 'request_timeout'
        } 
      });
    } else {
      res.status(500).json({ 
        error: { 
          message: 'Internal server error', 
          type: 'server_error' 
        } 
      });
    }
  }
});

// エラーハンドリング
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Ollama Proxy Server running on port ${PORT}`);
  console.log(`📡 Proxying to Ollama at ${OLLAMA_HOST}`);
  console.log(`🔑 Valid API keys: ${process.env.OLLAMA_API_KEYS ? '***' : 'ollama-local-key-123,ollama-dev-key-456'}`);
  console.log(`🌐 OpenAI compatible endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/v1/models`);
  console.log(`   - POST http://localhost:${PORT}/v1/chat/completions`);
  console.log(`   - GET  http://localhost:${PORT}/health`);
});

module.exports = app;
