import type * as React from 'react'

type Props = {
  onDone: (selection: string, modelAlias?: string) => void
}

export function AntModelSwitchCallout(_: Props): React.ReactNode {
  return null
}

export function shouldShowModelSwitchCallout(): boolean {
  return false
}
