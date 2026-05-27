import type { AgentMemoryScope } from '../../../tools/AgentTool/agentMemory.js'
import type { AgentColorName } from '../../../tools/AgentTool/agentColorManager.js'
import type { AgentDefinition } from '../../../tools/AgentTool/loadAgentsDir.js'
import type { SettingSource } from '../../../utils/settings/constants.js'

export type AgentCreationMethod = 'generate' | 'manual'

export type AgentWizardData = {
  location?: SettingSource
  method?: AgentCreationMethod
  generationPrompt?: string
  agentType?: string
  whenToUse?: string
  systemPrompt?: string
  selectedTools?: string[]
  selectedModel?: string
  selectedColor?: AgentColorName | 'automatic' | null
  selectedMemory?: AgentMemoryScope
  generatedAgent?: unknown
  finalAgent?: AgentDefinition
  wasGenerated?: boolean
  isGenerating?: boolean
}
