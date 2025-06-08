/**
 * LLM Provider configurations for Business Management AI Platform
 */

export interface LLMProvider {
  id: string
  name: string
  models: LLMModel[]
  apiEndpoint?: string
  requiresApiKey: boolean
  description: string
  isLocal: boolean
}

export interface LLMModel {
  id: string
  name: string
  description: string
}

export const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: '最新の高性能モデル（推奨）'
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: '高速・低コストモデル'
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: '高性能モデル'
      }
    ],
    apiEndpoint: 'https://api.openai.com/v1',
    requiresApiKey: true,
    description: 'OpenAIの最新GPTモデル群',
    isLocal: false
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    models: [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        description: '最新の高性能モデル（推奨）'
      },
      {
        id: 'claude-3-5-sonnet-20240620',
        name: 'Claude 3.5 Sonnet (Previous)',
        description: '前バージョンの高性能モデル'
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        description: '高速・低コストモデル'
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        description: '最高性能モデル'
      }
    ],
    apiEndpoint: 'https://api.anthropic.com/v1',
    requiresApiKey: true,
    description: 'Anthropic社のClaude AI',
    isLocal: false
  },
  {
    id: 'google',
    name: 'Google Gemini',
    models: [
      {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash',
        description: '最新の高速モデル（推奨）'
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: '高性能モデル'
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        description: '高速モデル'
      }
    ],
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
    requiresApiKey: true,
    description: 'Google Gemini AI',
    isLocal: false
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    models: [
      {
        id: 'deepseek/deepseek-r1-distill-llama-70b',
        name: 'DeepSeek R1 Distill Llama 70B',
        description: 'DeepSeek R1の蒸留版（推奨・無料）'
      },
      {
        id: 'deepseek/deepseek-r1-distill-qwen-32b',
        name: 'DeepSeek R1 Distill Qwen 32B',
        description: 'DeepSeek R1 Qwen版（無料）'
      },
      {
        id: 'deepseek/deepseek-r1',
        name: 'DeepSeek R1',
        description: 'DeepSeek R1フルモデル'
      },
      {
        id: 'deepseek/deepseek-chat',
        name: 'DeepSeek Chat',
        description: 'DeepSeek汎用チャットモデル'
      }
    ],
    apiEndpoint: 'https://openrouter.ai/api/v1',
    requiresApiKey: true,
    description: 'OpenRouter経由のDeepSeek R1無料API',
    isLocal: false
  },
  {
    id: 'ollama',
    name: 'Ollama (ローカル)',
    models: [
      {
        id: 'llama3.2',
        name: 'Llama 3.2',
        description: 'Meta社の最新モデル（推奨）'
      },
      {
        id: 'llama3.1',
        name: 'Llama 3.1',
        description: 'Meta社の高性能モデル'
      },
      {
        id: 'tinyllama',
        name: 'TinyLlama',
        description: '軽量・高速モデル'
      },
      {
        id: 'codellama',
        name: 'Code Llama',
        description: 'コード生成特化モデル'
      }
    ],
    apiEndpoint: 'http://localhost:11434/v1',
    requiresApiKey: false,
    description: 'ローカル実行のオープンソースモデル',
    isLocal: true
  }
]

export interface LLMSettings {
  providerId: string
  modelId: string
  apiKey?: string
  customEndpoint?: string
}

export const DEFAULT_LLM_SETTINGS: LLMSettings = {
  providerId: 'openrouter',
  modelId: 'deepseek/deepseek-r1-distill-llama-70b',
  apiKey: '',
  customEndpoint: ''
}

export function getProviderById(providerId: string): LLMProvider | undefined {
  return LLM_PROVIDERS.find(p => p.id === providerId)
}

export function getModelById(providerId: string, modelId: string): LLMModel | undefined {
  const provider = getProviderById(providerId)
  return provider?.models.find(m => m.id === modelId)
}

export function getProviderApiEndpoint(providerId: string, customEndpoint?: string): string {
  if (customEndpoint) {
    return customEndpoint
  }
  
  const provider = getProviderById(providerId)
  return provider?.apiEndpoint || 'https://openrouter.ai/api/v1'
}