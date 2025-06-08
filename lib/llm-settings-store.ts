/**
 * LLM Settings Store with localStorage persistence
 */

import { LLMSettings, DEFAULT_LLM_SETTINGS } from './llm-providers'

const STORAGE_KEY = 'business-ai-llm-settings'

export class LLMSettingsStore {
  private static instance: LLMSettingsStore | null = null
  private settings: LLMSettings
  private listeners: ((settings: LLMSettings) => void)[] = []

  private constructor() {
    this.settings = this.loadFromStorage()
  }

  static getInstance(): LLMSettingsStore {
    if (!LLMSettingsStore.instance) {
      LLMSettingsStore.instance = new LLMSettingsStore()
    }
    return LLMSettingsStore.instance
  }

  private loadFromStorage(): LLMSettings {
    if (typeof window === 'undefined') {
      return DEFAULT_LLM_SETTINGS
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          ...DEFAULT_LLM_SETTINGS,
          ...parsed
        }
      }
    } catch (error) {
      console.error('Failed to load LLM settings from localStorage:', error)
    }

    return DEFAULT_LLM_SETTINGS
  }

  private saveToStorage(settings: LLMSettings): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save LLM settings to localStorage:', error)
    }
  }

  getSettings(): LLMSettings {
    return { ...this.settings }
  }

  updateSettings(newSettings: Partial<LLMSettings>): void {
    this.settings = {
      ...this.settings,
      ...newSettings
    }

    this.saveToStorage(this.settings)
    this.notifyListeners()
  }

  subscribe(listener: (settings: LLMSettings) => void): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.settings)
      } catch (error) {
        console.error('Error in LLM settings listener:', error)
      }
    })
  }

  resetSettings(): void {
    this.settings = { ...DEFAULT_LLM_SETTINGS }
    this.saveToStorage(this.settings)
    this.notifyListeners()
  }
}

export const llmSettingsStore = LLMSettingsStore.getInstance()