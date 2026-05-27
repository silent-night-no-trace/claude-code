function printUnavailable(command: string): void {
  process.stderr.write(
    `${command} is unavailable in the local reduced build.\n`,
  )
}

export async function logHandler(_logId?: string | number): Promise<void> {
  printUnavailable('claude log')
}

export async function errorHandler(_number?: number): Promise<void> {
  printUnavailable('claude error')
}

export async function exportHandler(
  _source: string,
  _outputFile: string,
): Promise<void> {
  printUnavailable('claude export')
}

export async function taskCreateHandler(
  _subject: string,
  _opts: { description?: string; list?: string },
): Promise<void> {
  printUnavailable('claude task create')
}

export async function taskListHandler(_opts: {
  list?: string
  pending?: boolean
  json?: boolean
}): Promise<void> {
  printUnavailable('claude task list')
}

export async function taskGetHandler(
  _id: string,
  _opts: { list?: string },
): Promise<void> {
  printUnavailable('claude task get')
}

export async function taskUpdateHandler(
  _id: string,
  _opts: {
    list?: string
    status?: string
    subject?: string
    description?: string
    owner?: string
    clearOwner?: boolean
  },
): Promise<void> {
  printUnavailable('claude task update')
}

export async function taskDirHandler(_opts: {
  list?: string
}): Promise<void> {
  printUnavailable('claude task dir')
}

export async function completionHandler(
  _shell: string,
  _opts: { output?: string },
  _program: unknown,
): Promise<void> {
  printUnavailable('claude completion')
}
