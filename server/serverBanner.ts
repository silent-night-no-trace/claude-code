type BannerConfig = {
  host: string
  port: number
  unix?: string
}

export function printBanner(
  config: BannerConfig,
  _authToken: string,
  actualPort: number,
): void {
  const location = config.unix
    ? `unix:${config.unix}`
    : `http://${config.host}:${actualPort || config.port}`
  process.stderr.write(`Server mode is reduced-build only: ${location}\n`)
}
