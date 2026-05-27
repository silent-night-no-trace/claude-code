import type * as React from 'react'

type Props = {
  defaultDir: string
  onInstalled: (dir: string) => void
  onCancel: () => void
  onError: (message: string) => void
}

export async function computeDefaultInstallDir(): Promise<string> {
  return ''
}

export function NewInstallWizard(_: Props): React.ReactNode {
  return null
}
