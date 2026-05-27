export type ConnectorTextBlock = {
  type: 'connector_text'
  text: string
  connectorId?: string
  [key: string]: unknown
}

export type ConnectorTextDelta = {
  type: 'connector_text_delta'
  text: string
  connectorId?: string
  [key: string]: unknown
}

export function isConnectorTextBlock(
  value: unknown,
): value is ConnectorTextBlock {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'connector_text' &&
    'text' in value &&
    typeof value.text === 'string'
  )
}
