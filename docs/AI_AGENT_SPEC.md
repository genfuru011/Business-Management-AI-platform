# 🧠 AIエージェント機能仕様書

## 📌 概要

AIエージェント（AI Copilot）は、ビジネス管理AIプラットフォームの中核機能として、ユーザーの自然言語クエリを処理し、ビジネスデータに基づいた回答や洞察を提供します。GitHub Copilotのような直感的な支援を、ビジネス管理の文脈で実現しています。

## 🔧 アーキテクチャ

AIエージェントシステムは以下の主要コンポーネントで構成されています：

1. **BusinessAIAgent クラス** - AIエージェントの中核ロジック（`/lib/ai-agent.ts`）
2. **AILearningEngine クラス** - ユーザーフィードバックに基づく学習機能（`/lib/ai-learning.ts`）
3. **BusinessAIAgent コンポーネント** - フロントエンドUI（`/components/BusinessAIAgent.tsx`）
4. **APIエンドポイント** - バックエンドインターフェース（`/app/api/business-agent/route.ts`）

## ⚙️ 主要機能

### 1. 意図認識 (`analyzeIntent`)

ユーザークエリを分析し、以下のカテゴリに分類：

- **DASHBOARD_ANALYSIS** - ダッシュボード全体の分析
- **CUSTOMER_MANAGEMENT** - 顧客データの管理・分析
- **SALES_ANALYSIS** - 売上・販売データの分析
- **INVENTORY_MANAGEMENT** - 在庫・商品管理
- **FINANCIAL_REPORT** - 財務状況の分析・レポート
- **BUSINESS_INSIGHTS** - ビジネス全般の洞察提供
- **REPORT_GENERATION** - 各種レポート生成
- **GENERAL_QUERY** - 一般的な質問応答

### 2. 機能決定 (`getRequiredCapabilities`)

意図に基づき、必要な機能を自動選択：

- **DATA_ANALYSIS** - データ分析
- **REPORT_GENERATION** - レポート生成
- **CUSTOMER_INSIGHTS** - 顧客分析
- **SALES_FORECASTING** - 売上予測
- **INVENTORY_OPTIMIZATION** - 在庫最適化
- **FINANCIAL_ANALYSIS** - 財務分析

### 3. データ収集 (`collectBusinessData`)

必要なビジネスデータを自動収集：

- 顧客データ
- 売上データ
- 在庫データ
- 財務データ
- 過去のレポート

### 4. AI応答生成 (`generateResponse`)

収集データに基づき、LLMを活用して回答生成：

- システムプロンプト自動構築
- ストリーミングレスポンス対応
- コンテキストに応じた詳細応答

### 5. 継続的学習 (`AILearningEngine`)

ユーザーインタラクションから学習・改善：

- フィードバック収集（👍/👎）
- カテゴリ別学習パターン
- 満足度評価（1-5）
- ローカルストレージへの保存

## 🔄 処理フロー

1. ユーザーがクエリを入力
2. 意図分析（`analyzeIntent`）
3. 必要機能特定（`getRequiredCapabilities`）
4. ビジネスデータ収集（`collectBusinessData`）
5. コンテキスト構築（`AgentContext`）
6. AI応答生成（`generateResponse`）
7. ユーザーへの表示と学習データ記録

## 💻 使用例

```typescript
// AIエージェントへのクエリ例
const query = "先月の売上はどうだった？トレンドを教えて";

// AIエージェント処理の呼び出し
const response = await processBusinessQuery(query, {
  provider: "openai",
  modelId: "gpt-4o"
});

// 結果はストリーミング形式で返される
// クライアントでのハンドリング例
response.pipe(res);
```

## ⚡ AIフロントエンド

AIエージェントUIコンポーネント（`BusinessAIAgent.tsx`）は以下の機能を提供：

- リアルタイムチャットインターフェース
- クイック質問提案
- フィードバック収集機能
- 提案クエリギャラリー
- レスポンスの展開/折りたたみ

## 🛠️ 設定オプション

AIエージェントは環境変数で設定可能：

```
NEXT_PUBLIC_AI_PROVIDER=openrouter
NEXT_PUBLIC_AI_MODEL=deepseek/deepseek-r1-0528
NEXT_PUBLIC_AI_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_AI_ENDPOINT=https://openrouter.ai/api/v1 (optional)
```

## 📈 統計・学習データ

AIエージェントは以下の学習データを維持：

- カテゴリ別のユーザー質問
- 平均満足度スコア
- よく使われるキーワード
- 成功したレスポンスパターン

## 🔗 API連携

AIエージェントは他の機能と連携：

- カスタマー管理
- 販売分析
- 在庫管理
- 財務レポート
- ダッシュボード

## 🔮 今後の開発計画

1. より高度なAI意図認識（ディープラーニングモデル）
2. 複雑なマルチターン会話対応
3. ビジュアルデータ（グラフ・チャート）の自動生成
4. 予測分析機能の強化
5. サードパーティAPIとの連携拡大

----

作成日: 2025年6月7日
