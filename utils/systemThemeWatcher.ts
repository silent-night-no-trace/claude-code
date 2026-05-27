import type { SystemTheme } from './systemTheme.js'

export function watchSystemTheme(
  _internalQuerier: unknown,
  _onThemeChange: (theme: SystemTheme) => void,
): () => void {
  return () => {}
}
