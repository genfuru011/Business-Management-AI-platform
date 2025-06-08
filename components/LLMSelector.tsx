"use client"

import { useState, useEffect } from 'react'
import { Settings, ChevronDown, Key, Server, Zap, Cloud, HardDrive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { LLM_PROVIDERS, LLMProvider, LLMModel, getProviderById, getModelById } from '@/lib/llm-providers'
import { llmSettingsStore, LLMSettingsStore } from '@/lib/llm-settings-store'
import { LLMSettings } from '@/lib/llm-providers'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface LLMSelectorProps {
  className?: string
  onSettingsChange?: (settings: LLMSettings) => void
}

export default function LLMSelector({ className = "", onSettingsChange }: LLMSelectorProps) {
  const [currentSettings, setCurrentSettings] = useState<LLMSettings>(llmSettingsStore.getSettings())
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [tempSettings, setTempSettings] = useState<LLMSettings>(currentSettings)

  const currentProvider = getProviderById(currentSettings.providerId)
  const currentModel = getModelById(currentSettings.providerId, currentSettings.modelId)

  useEffect(() => {
    const unsubscribe = llmSettingsStore.subscribe((settings) => {
      setCurrentSettings(settings)
      setTempSettings(settings)
      onSettingsChange?.(settings)
    })

    return unsubscribe
  }, [onSettingsChange])

  const handleProviderChange = (providerId: string) => {
    const provider = getProviderById(providerId)
    if (provider) {
      const defaultModel = provider.models[0]
      setTempSettings({
        ...tempSettings,
        providerId,
        modelId: defaultModel.id,
        customEndpoint: ''
      })
    }
  }

  const handleModelChange = (modelId: string) => {
    setTempSettings({
      ...tempSettings,
      modelId
    })
  }

  const handleSaveSettings = () => {
    llmSettingsStore.updateSettings(tempSettings)
    setIsSettingsOpen(false)
  }

  const handleCancelSettings = () => {
    setTempSettings(currentSettings)
    setIsSettingsOpen(false)
  }

  const getProviderIcon = (provider: LLMProvider) => {
    if (provider.isLocal) {
      return <HardDrive className="h-4 w-4" />
    }
    return <Cloud className="h-4 w-4" />
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Current Selection Display */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {currentProvider && getProviderIcon(currentProvider)}
          <span className="font-medium">{currentProvider?.name}</span>
          <span className="text-gray-400">•</span>
          <span>{currentModel?.name}</span>
          {currentProvider?.isLocal && (
            <Badge variant="outline" className="text-xs">
              ローカル
            </Badge>
          )}
        </div>
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Settings className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                LLM設定
              </DialogTitle>
              <DialogDescription>
                使用するAIプロバイダーとモデルを選択してください
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Provider Selection */}
              <div className="space-y-2">
                <Label htmlFor="provider">AIプロバイダー</Label>
                <Select value={tempSettings.providerId} onValueChange={handleProviderChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="プロバイダーを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {LLM_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex items-center gap-2">
                          {getProviderIcon(provider)}
                          <span>{provider.name}</span>
                          {provider.isLocal && (
                            <Badge variant="outline" className="text-xs">
                              ローカル
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentProvider && (
                  <p className="text-sm text-gray-500">{currentProvider.description}</p>
                )}
              </div>

              {/* Model Selection */}
              {currentProvider && (
                <div className="space-y-2">
                  <Label htmlFor="model">モデル</Label>
                  <Select value={tempSettings.modelId} onValueChange={handleModelChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="モデルを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentProvider.models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex flex-col">
                            <span>{model.name}</span>
                            <span className="text-xs text-gray-500">{model.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* API Key Input */}
              {currentProvider?.requiresApiKey && (
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    APIキー
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="APIキーを入力してください"
                    value={tempSettings.apiKey || ''}
                    onChange={(e) => setTempSettings({
                      ...tempSettings,
                      apiKey: e.target.value
                    })}
                  />
                  <p className="text-sm text-gray-500">
                    {currentProvider.name}のAPIキーが必要です
                  </p>
                </div>
              )}

              {/* Custom Endpoint */}
              <div className="space-y-2">
                <Label htmlFor="endpoint" className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  カスタムエンドポイント（オプション）
                </Label>
                <Input
                  id="endpoint"
                  placeholder={currentProvider?.apiEndpoint || 'https://api.example.com/v1'}
                  value={tempSettings.customEndpoint || ''}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    customEndpoint: e.target.value
                  })}
                />
                <p className="text-sm text-gray-500">
                  デフォルト: {currentProvider?.apiEndpoint}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCancelSettings}>
                  キャンセル
                </Button>
                <Button onClick={handleSaveSettings}>
                  保存
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Provider Cards for Quick Reference */}
      {isSettingsOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {LLM_PROVIDERS.map((provider) => (
            <Card key={provider.id} className={`cursor-pointer transition-all ${
              tempSettings.providerId === provider.id ? 'ring-2 ring-blue-500' : ''
            }`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {getProviderIcon(provider)}
                  {provider.name}
                  {provider.isLocal && (
                    <Badge variant="outline" className="text-xs">
                      ローカル
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-500 mb-2">{provider.description}</p>
                <div className="text-xs">
                  <span className="font-medium">利用可能モデル: </span>
                  {provider.models.length}個
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}