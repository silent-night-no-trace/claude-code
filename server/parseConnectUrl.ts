type ParsedConnectUrl = {
  serverUrl: string
  authToken: string
}

export function parseConnectUrl(ccUrl: string): ParsedConnectUrl {
  const parsed = new URL(ccUrl)

  const authToken = decodeURIComponent(parsed.username)
  if (!authToken) {
    throw new Error('Connect URL is missing an auth token.')
  }

  if (parsed.protocol === 'cc://') {
    return {
      serverUrl: `http://${parsed.host}`,
      authToken,
    }
  }

  if (parsed.protocol === 'cc+unix://') {
    const socketPath = decodeURIComponent(`${parsed.host}${parsed.pathname}`)
    if (!socketPath) {
      throw new Error('Connect URL is missing a unix socket path.')
    }
    return {
      serverUrl: `unix:${socketPath}`,
      authToken,
    }
  }

  throw new Error(`Unsupported connect URL protocol: ${parsed.protocol}`)
}
