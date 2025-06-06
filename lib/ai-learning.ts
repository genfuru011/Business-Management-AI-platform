// AIエージェントの学習・改善機能
export interface UserInteraction {
  id: string
  query: string
  response: string
  timestamp: Date
  feedback?: 'positive' | 'negative' | 'neutral'
  category: string
  satisfaction: number // 1-5
}

export interface LearningPattern {
  category: string
  commonQueries: string[]
  successfulResponses: string[]
  frequentKeywords: string[]
  averageSatisfaction: number
  lastUpdated: Date
}

export class AILearningEngine {
  private interactions: UserInteraction[] = []
  private patterns: Map<string, LearningPattern> = new Map()
  private readonly STORAGE_KEY = 'ai_learning_data'

  constructor() {
    this.loadFromStorage()
  }

  // インタラクションを記録
  recordInteraction(interaction: Omit<UserInteraction, 'id' | 'timestamp'>) {
    const newInteraction: UserInteraction = {
      ...interaction,
      id: Date.now().toString(),
      timestamp: new Date()
    }

    this.interactions.push(newInteraction)
    this.updatePatterns(newInteraction)
    this.saveToStorage()

    return newInteraction.id
  }

  // フィードバックを記録
  recordFeedback(interactionId: string, feedback: 'positive' | 'negative' | 'neutral', satisfaction: number) {
    const interaction = this.interactions.find(i => i.id === interactionId)
    if (interaction) {
      interaction.feedback = feedback
      interaction.satisfaction = satisfaction
      this.updatePatterns(interaction)
      this.saveToStorage()
    }
  }

  // パターンを更新
  private updatePatterns(interaction: UserInteraction) {
    const category = interaction.category
    let pattern = this.patterns.get(category)

    if (!pattern) {
      pattern = {
        category,
        commonQueries: [],
        successfulResponses: [],
        frequentKeywords: [],
        averageSatisfaction: 0,
        lastUpdated: new Date()
      }
    }

    // よくある質問を更新
    const queryLower = interaction.query.toLowerCase()
    if (!pattern.commonQueries.some(q => q.toLowerCase().includes(queryLower.substring(0, 10)))) {
      pattern.commonQueries.push(interaction.query)
      if (pattern.commonQueries.length > 10) {
        pattern.commonQueries = pattern.commonQueries.slice(-10)
      }
    }

    // 成功した回答を記録
    if (interaction.satisfaction && interaction.satisfaction >= 4) {
      pattern.successfulResponses.push(interaction.response)
      if (pattern.successfulResponses.length > 5) {
        pattern.successfulResponses = pattern.successfulResponses.slice(-5)
      }
    }

    // キーワードを抽出
    const keywords = this.extractKeywords(interaction.query)
    keywords.forEach(keyword => {
      if (!pattern.frequentKeywords.includes(keyword)) {
        pattern.frequentKeywords.push(keyword)
      }
    })

    // 満足度の平均を更新
    const categoryInteractions = this.interactions.filter(i => 
      i.category === category && i.satisfaction
    )
    if (categoryInteractions.length > 0) {
      pattern.averageSatisfaction = categoryInteractions.reduce((sum, i) => 
        sum + (i.satisfaction || 0), 0
      ) / categoryInteractions.length
    }

    pattern.lastUpdated = new Date()
    this.patterns.set(category, pattern)
  }

  // キーワード抽出
  private extractKeywords(text: string): string[] {
    const stopWords = ['の', 'は', 'が', 'を', 'に', 'で', 'と', 'から', 'まで', 'について', 'です', 'ます', 'した', 'する', 'される']
    return text
      .toLowerCase()
      .split(/[\s、。！？]+/)
      .filter(word => word.length > 1 && !stopWords.includes(word))
      .slice(0, 5)
  }

  // 改善提案を生成
  getImprovementSuggestions(): string[] {
    const suggestions: string[] = []
    
    for (const [category, pattern] of this.patterns) {
      if (pattern.averageSatisfaction < 3) {
        suggestions.push(`${category}の回答品質向上が必要です（満足度: ${pattern.averageSatisfaction.toFixed(1)}）`)
      }
      
      if (pattern.commonQueries.length > 5) {
        suggestions.push(`${category}でよく質問される内容の自動回答テンプレートを作成できます`)
      }
    }

    return suggestions
  }

  // 関連する質問を提案
  getSuggestedQueries(currentQuery: string, category: string): string[] {
    const pattern = this.patterns.get(category)
    if (!pattern) return []

    const currentKeywords = this.extractKeywords(currentQuery)
    
    return pattern.commonQueries
      .filter(query => {
        const queryKeywords = this.extractKeywords(query)
        return queryKeywords.some(keyword => currentKeywords.includes(keyword))
      })
      .slice(0, 3)
  }

  // 学習データの統計を取得
  getAnalytics() {
    const totalInteractions = this.interactions.length
    const categorySummary = Array.from(this.patterns.entries()).map(([category, pattern]) => ({
      category,
      interactions: this.interactions.filter(i => i.category === category).length,
      averageSatisfaction: pattern.averageSatisfaction,
      commonQueries: pattern.commonQueries.length
    }))

    const overallSatisfaction = this.interactions
      .filter(i => i.satisfaction)
      .reduce((sum, i, _, arr) => sum + (i.satisfaction || 0) / arr.length, 0)

    return {
      totalInteractions,
      overallSatisfaction,
      categorySummary,
      lastUpdate: new Date()
    }
  }

  // データの保存
  private saveToStorage() {
    if (typeof window !== 'undefined') {
      const data = {
        interactions: this.interactions.slice(-100), // 最新100件のみ保存
        patterns: Array.from(this.patterns.entries())
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    }
  }

  // データの読み込み
  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (data) {
        try {
          const parsed = JSON.parse(data)
          this.interactions = parsed.interactions || []
          this.patterns = new Map(parsed.patterns || [])
        } catch (error) {
          console.error('学習データの読み込みに失敗:', error)
        }
      }
    }
  }

  // データのリセット
  resetLearningData() {
    this.interactions = []
    this.patterns.clear()
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }
}

// シングルトンインスタンス
export const aiLearningEngine = new AILearningEngine()
