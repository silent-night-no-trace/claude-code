type CachedMCConfig = {
  enabled?: boolean
  systemPromptSuggestSummaries?: boolean
  keepRecent?: number
  supportedModels?: string[]
}

export function getCachedMCConfig(): CachedMCConfig {
  return {
    enabled: false,
    systemPromptSuggestSummaries: false,
    keepRecent: 100,
    supportedModels: [],
  }
}
