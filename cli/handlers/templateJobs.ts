export async function templatesMain(_args: string[]): Promise<void> {
  process.stderr.write(
    'Template job commands are unavailable in the local reduced build.\n',
  )
}
