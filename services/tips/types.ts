export type TipContext = {
  bashTools?: Set<string>
  readFileState?: unknown
}

export type Tip = {
  id: string
  content: () => Promise<string> | string
  cooldownSessions: number
  isRelevant: (context?: TipContext) => Promise<boolean> | boolean
}
