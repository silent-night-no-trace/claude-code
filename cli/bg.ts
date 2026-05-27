function printUnavailableMessage(command: string): void {
  process.stderr.write(
    `Background session command \"${command}\" is unavailable in the local reduced build.\n`,
  )
}

export async function psHandler(_args: string[]): Promise<void> {
  printUnavailableMessage('ps')
}

export async function logsHandler(_sessionId?: string): Promise<void> {
  printUnavailableMessage('logs')
}

export async function attachHandler(_sessionId?: string): Promise<void> {
  printUnavailableMessage('attach')
}

export async function killHandler(_sessionId?: string): Promise<void> {
  printUnavailableMessage('kill')
}

export async function handleBgFlag(_args: string[]): Promise<void> {
  printUnavailableMessage('--bg')
}
