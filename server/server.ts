type ServerConfig = {
  port: number
}

type StartedServer = {
  port: number
  stop(force?: boolean): void
}

export function startServer(
  config: ServerConfig,
  _sessionManager: unknown,
  _logger: unknown,
): StartedServer {
  return {
    port: config.port,
    stop(_force?: boolean) {},
  }
}
