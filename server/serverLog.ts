type ServerLogger = {
  info(message?: unknown, ...args: unknown[]): void
  warn(message?: unknown, ...args: unknown[]): void
  error(message?: unknown, ...args: unknown[]): void
  debug(message?: unknown, ...args: unknown[]): void
}

const noop = (_message?: unknown, ..._args: unknown[]): void => {}

export function createServerLogger(): ServerLogger {
  return {
    info: noop,
    warn: noop,
    error: noop,
    debug: noop,
  }
}
