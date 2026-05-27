import type {
  ConfigScope,
  MCPServerConnection,
  McpClaudeAIProxyServerConfig,
  McpHTTPServerConfig,
  McpSSEServerConfig,
  McpStdioServerConfig,
} from '../../services/mcp/types.js'

type BaseServerInfo<TTransport extends string, TConfig> = {
  name: string
  client: MCPServerConnection
  scope: ConfigScope
  transport: TTransport
  config: TConfig
}

export type StdioServerInfo = BaseServerInfo<'stdio', McpStdioServerConfig>

export type SSEServerInfo = BaseServerInfo<'sse', McpSSEServerConfig> & {
  isAuthenticated?: boolean
}

export type HTTPServerInfo = BaseServerInfo<'http', McpHTTPServerConfig> & {
  isAuthenticated?: boolean
}

export type ClaudeAIServerInfo = BaseServerInfo<'claudeai-proxy', McpClaudeAIProxyServerConfig> & {
  isAuthenticated?: boolean
}
