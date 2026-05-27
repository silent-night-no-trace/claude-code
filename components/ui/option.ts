import type { ReactNode } from 'react'

export type Option = {
  label: ReactNode
  value: string
  description?: ReactNode
  disabled?: boolean
  dimDescription?: boolean
  type?: string
  initialValue?: string
}
