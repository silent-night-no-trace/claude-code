type MemoryHeaderLike = {
  filename?: string
  filePath?: string
  mtimeMs?: number
}

export function logMemoryRecallShape(
  _memories: MemoryHeaderLike[],
  _selected: MemoryHeaderLike[],
): void {}

export function logMemoryWriteShape(
  _toolName: string,
  _toolInput: unknown,
  _filePath: string,
  _scope: string,
): void {}
