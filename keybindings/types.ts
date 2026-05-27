export type KeybindingAction = string

export type KeybindingContextName = string

export type KeybindingBlock = {
  context: KeybindingContextName
  bindings: Record<string, string | null>
}

export type ParsedBinding = {
  context: KeybindingContextName
  action?: KeybindingAction | null
  key?: string
  keys?: string[]
  [key: string]: unknown
}
