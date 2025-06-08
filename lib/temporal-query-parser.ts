/**
 * Temporal Query Parser for Japanese Business Queries
 * 
 * Parses Japanese temporal expressions like "今月", "今年", "先月", etc.
 * and converts them to structured time periods for data analysis.
 */

export interface TemporalContext {
  period: 'month' | 'quarter' | 'year' | 'week' | 'day'
  timeframe: 'current' | 'previous' | 'specific'
  startDate?: Date
  endDate?: Date
  originalExpression?: string
}

export class JapaneseTemporalQueryParser {
  
  /**
   * Parse temporal expressions from Japanese query
   */
  static parseTemporalContext(query: string): TemporalContext | null {
    const lowerQuery = query.toLowerCase()
    const currentDate = new Date()
    
    // Define temporal patterns and their mappings
    const temporalPatterns = [
      // Current periods
      { pattern: /今月|このつき/, period: 'month' as const, timeframe: 'current' as const },
      { pattern: /今年|ことし/, period: 'year' as const, timeframe: 'current' as const },
      { pattern: /今四半期|この四半期/, period: 'quarter' as const, timeframe: 'current' as const },
      { pattern: /今週|こんしゅう/, period: 'week' as const, timeframe: 'current' as const },
      { pattern: /今日|きょう/, period: 'day' as const, timeframe: 'current' as const },
      
      // Previous periods
      { pattern: /先月|せんげつ/, period: 'month' as const, timeframe: 'previous' as const },
      { pattern: /去年|昨年|きょねん/, period: 'year' as const, timeframe: 'previous' as const },
      { pattern: /前四半期|ぜんしはんき/, period: 'quarter' as const, timeframe: 'previous' as const },
      { pattern: /先週|せんしゅう/, period: 'week' as const, timeframe: 'previous' as const },
      { pattern: /昨日|きのう/, period: 'day' as const, timeframe: 'previous' as const },
    ]
    
    // Find matching pattern
    for (const { pattern, period, timeframe } of temporalPatterns) {
      const match = lowerQuery.match(pattern)
      if (match) {
        const context = this.calculateDateRange(period, timeframe, currentDate)
        return {
          ...context,
          originalExpression: match[0]
        }
      }
    }
    
    return null
  }
  
  /**
   * Calculate actual date ranges based on period and timeframe
   */
  private static calculateDateRange(
    period: TemporalContext['period'], 
    timeframe: TemporalContext['timeframe'], 
    referenceDate: Date
  ): TemporalContext {
    let startDate: Date
    let endDate: Date
    
    switch (period) {
      case 'month':
        if (timeframe === 'current') {
          startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)
          endDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0)
        } else { // previous
          startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1)
          endDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0)
        }
        break
        
      case 'year':
        if (timeframe === 'current') {
          startDate = new Date(referenceDate.getFullYear(), 0, 1)
          endDate = new Date(referenceDate.getFullYear(), 11, 31)
        } else { // previous
          startDate = new Date(referenceDate.getFullYear() - 1, 0, 1)
          endDate = new Date(referenceDate.getFullYear() - 1, 11, 31)
        }
        break
        
      case 'quarter':
        const currentQuarter = Math.floor(referenceDate.getMonth() / 3)
        if (timeframe === 'current') {
          startDate = new Date(referenceDate.getFullYear(), currentQuarter * 3, 1)
          endDate = new Date(referenceDate.getFullYear(), (currentQuarter + 1) * 3, 0)
        } else { // previous
          const prevQuarter = currentQuarter - 1
          if (prevQuarter < 0) {
            startDate = new Date(referenceDate.getFullYear() - 1, 9, 1) // Previous year Q4
            endDate = new Date(referenceDate.getFullYear() - 1, 11, 31)
          } else {
            startDate = new Date(referenceDate.getFullYear(), prevQuarter * 3, 1)
            endDate = new Date(referenceDate.getFullYear(), (prevQuarter + 1) * 3, 0)
          }
        }
        break
        
      case 'week':
        const dayOfWeek = referenceDate.getDay()
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Adjust for Monday start
        
        if (timeframe === 'current') {
          startDate = new Date(referenceDate)
          startDate.setDate(referenceDate.getDate() - daysFromMonday)
          endDate = new Date(startDate)
          endDate.setDate(startDate.getDate() + 6)
        } else { // previous
          startDate = new Date(referenceDate)
          startDate.setDate(referenceDate.getDate() - daysFromMonday - 7)
          endDate = new Date(startDate)
          endDate.setDate(startDate.getDate() + 6)
        }
        break
        
      case 'day':
        if (timeframe === 'current') {
          startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate())
          endDate = new Date(startDate)
          endDate.setHours(23, 59, 59, 999)
        } else { // previous
          startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() - 1)
          endDate = new Date(startDate)
          endDate.setHours(23, 59, 59, 999)
        }
        break
        
      default:
        startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)
        endDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0)
    }
    
    return {
      period,
      timeframe,
      startDate,
      endDate
    }
  }
  
  /**
   * Convert temporal context to analytics API period parameter
   */
  static temporalContextToPeriod(context: TemporalContext): string {
    switch (context.period) {
      case 'month':
        return 'month'
      case 'quarter':
        return 'quarter'
      case 'year':
        return 'year'
      default:
        return 'month' // fallback
    }
  }
  
  /**
   * Get human-readable description of temporal context
   */
  static describeTemporalContext(context: TemporalContext): string {
    const periodMap = {
      month: '月',
      quarter: '四半期',
      year: '年',
      week: '週',
      day: '日'
    }
    
    const timeframeMap = {
      current: '今',
      previous: '前',
      specific: ''
    }
    
    return `${timeframeMap[context.timeframe]}${periodMap[context.period]}`
  }
}