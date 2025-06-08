"use client"

import { useState, useEffect } from 'react'
import { useChat } from 'ai/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { aiLearningEngine } from '@/lib/ai-learning'
import { llmSettingsStore } from '@/lib/llm-settings-store'
import { LLMSettings, getProviderApiEndpoint } from '@/lib/llm-providers'
import LLMSelector from '@/components/LLMSelector'
import { 
  Bot, 
  Send, 
  MessageSquare, 
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Minimize2,
  Maximize2,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Star,
  Brain
} from 'lucide-react'

interface BusinessAIAgentProps {
  className?: string
  externalQuery?: string
  onExternalQueryProcessed?: () => void
}

const suggestedQueries = [
  {
    icon: TrendingUp,
    text: "今月の売上分析をしてください",
    category: "売上分析"
  },
  {
    icon: Users,
    text: "顧客の動向を教えてください",
    category: "顧客管理"
  },
  {
    icon: Package,
    text: "在庫の最適化案を提案してください",
    category: "在庫管理"
  },
  {
    icon: DollarSign,
    text: "財務状況をまとめてください",
    category: "財務分析"
  }
]

export default function BusinessAIAgent({ 
  className = "",
  externalQuery,
  onExternalQueryProcessed
}: BusinessAIAgentProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentInteractionId, setCurrentInteractionId] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState<{[key: string]: boolean}>({})
  const [learningStats, setLearningStats] = useState(aiLearningEngine.getAnalytics())
  
  // LLM設定を動的に管理
  const [llmSettings, setLlmSettings] = useState<LLMSettings>(llmSettingsStore.getSettings())
  
  // LLM設定に基づいてAI設定を構築
  const aiSettings = {
    provider: llmSettings.providerId,
    apiKey: llmSettings.apiKey,
    modelId: llmSettings.modelId,
    apiEndpoint: getProviderApiEndpoint(llmSettings.providerId, llmSettings.customEndpoint)
  }

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: '/api/business-agent',
    body: {
      provider: aiSettings.provider,
      apiKey: aiSettings.apiKey,
      modelId: aiSettings.modelId,
      apiEndpoint: aiSettings.apiEndpoint
    },
    onError: (error) => {
      console.error('AIエージェントエラー:', error)
    },
    onFinish: (message) => {
      // AIの応答が完了したら学習エンジンに記録
      if (input.trim()) {
        const category = categorizeQuery(input)
        const interactionId = aiLearningEngine.recordInteraction({
          query: input,
          response: message.content,
          category,
          satisfaction: 3 // デフォルト値
        })
        setCurrentInteractionId(interactionId)
        setShowFeedback(prev => ({ ...prev, [message.id]: true }))
      }
    }
  })

  // クエリをカテゴリ分類
  const categorizeQuery = (query: string): string => {
    const lowerQuery = query.toLowerCase()
    if (lowerQuery.includes('売上') || lowerQuery.includes('収益') || lowerQuery.includes('revenue')) {
      return '売上分析'
    }
    if (lowerQuery.includes('顧客') || lowerQuery.includes('customer')) {
      return '顧客管理'
    }
    if (lowerQuery.includes('在庫') || lowerQuery.includes('商品') || lowerQuery.includes('inventory')) {
      return '在庫管理'
    }
    if (lowerQuery.includes('財務') || lowerQuery.includes('利益') || lowerQuery.includes('経費')) {
      return '財務分析'
    }
    return 'その他'
  }

  // フィードバックを記録
  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative', satisfaction: number) => {
    if (currentInteractionId) {
      aiLearningEngine.recordFeedback(currentInteractionId, feedback, satisfaction)
      setShowFeedback(prev => ({ ...prev, [messageId]: false }))
      setLearningStats(aiLearningEngine.getAnalytics())
    }
  }

  // 学習データの更新
  useEffect(() => {
    const interval = setInterval(() => {
      setLearningStats(aiLearningEngine.getAnalytics())
    }, 30000) // 30秒毎に更新

    return () => clearInterval(interval)
  }, [])

  // LLM設定の変更を監視
  useEffect(() => {
    const unsubscribe = llmSettingsStore.subscribe((newSettings) => {
      setLlmSettings(newSettings)
    })

    return unsubscribe
  }, [])

  const handleSuggestedQuery = (query: string) => {
    handleInputChange({ target: { value: query } } as any)
  }

  const compactView = (
    <Card className={`${className} border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <Bot className="h-5 w-5" />
          <span>ビジネスAIエージェント</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="ml-auto h-6 w-6 p-0"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          ビジネス分析、顧客管理、売上予測など、何でもお聞きください。
        </p>
        <div className="grid grid-cols-2 gap-2">
          {suggestedQueries.slice(0, 4).map((query, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs h-8 justify-start"
              onClick={() => handleSuggestedQuery(query.text)}
            >
              <query.icon className="h-3 w-3 mr-1" />
              {query.category}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const expandedView = (
    <Card className={`${className} border-blue-200 bg-white shadow-lg`}>
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <Bot className="h-5 w-5" />
          <span>ビジネスAIエージェント</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="ml-auto h-6 w-6 p-0"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </CardTitle>
        {/* LLM選択コンポーネント */}
        <div className="mt-2">
          <LLMSelector />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* 提案クエリ */}
        {messages.length === 0 && (
          <div className="p-4 border-b bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              💡 よく使われる質問
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {suggestedQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start h-10 text-left"
                  onClick={() => handleSuggestedQuery(query.text)}
                >
                  <query.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">{query.category}</div>
                    <div className="text-sm">{query.text}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* チャット履歴 */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>AIエージェントがビジネス管理をサポートします</p>
              <p className="text-sm">質問を入力するか、上の提案から選択してください</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center space-x-2 mb-1">
                    <Bot className="h-4 w-4" />
                    <span className="text-xs font-medium">AIエージェント</span>
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap">
                  {message.content}
                </div>

                {/* フィードバックボタン（AIアシスタントの回答のみ） */}
                {message.role === 'assistant' && showFeedback[message.id] && (
                  <div className="flex space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleFeedback(message.id, 'positive', 5)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      良い回答
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleFeedback(message.id, 'negative', 1)}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      悪い回答
                    </Button>
                  </div>
                )}

                {/* フィードバックリクエストボタン（AIアシスタントの回答のみ） */}
                {message.role === 'assistant' && !showFeedback[message.id] && (
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFeedback(prev => ({ ...prev, [message.id]: true }))}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      この回答を評価
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600">分析中...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 入力フォーム */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="ビジネスについて何でもお聞きください..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>

        {/* AI学習統計情報 */}
        {learningStats && (
          <div className="border-t p-4 bg-gray-50">
            <div className="flex items-center space-x-2 mb-3">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">AI学習統計</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">総インタラクション</span>
                  <span className="font-medium">{learningStats.totalInteractions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">満足度</span>
                  <span className="font-medium">{learningStats.overallSatisfaction.toFixed(1)}/5.0</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">カテゴリ数</span>
                  <span className="font-medium">{learningStats.categorySummary.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最終更新</span>
                  <span className="font-medium">{new Date(learningStats.lastUpdate).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // 外部クエリの処理
  useEffect(() => {
    if (externalQuery && externalQuery.trim()) {
      setInput(externalQuery)
      setIsExpanded(true)
      
      // 少し遅延してからsubmitする
      setTimeout(() => {
        const form = document.createElement('form')
        const event = new Event('submit', { bubbles: true, cancelable: true })
        Object.defineProperty(event, 'target', { value: form })
        Object.defineProperty(event, 'preventDefault', { value: () => {} })
        
        // inputの値を設定してsubmit
        handleInputChange({ target: { value: externalQuery } } as any)
        handleSubmit(event as any)
        
        // 処理完了を通知
        if (onExternalQueryProcessed) {
          onExternalQueryProcessed()
        }
      }, 500)
    }
  }, [externalQuery, handleInputChange, handleSubmit, setInput, onExternalQueryProcessed])

  return isExpanded ? expandedView : compactView
}
