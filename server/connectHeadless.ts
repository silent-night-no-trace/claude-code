export async function runConnectHeadless(
  _connectConfig: unknown,
  _prompt: string,
  _outputFormat: string,
  _interactive: boolean,
): Promise<void> {
  throw new Error(
    'Headless direct-connect mode is unavailable in the local reduced build.',
  )
}
