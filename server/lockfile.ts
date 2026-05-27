import { mkdir, readFile, rm, writeFile } from 'fs/promises'
import { join } from 'path'
import { getCwd } from '../utils/cwd.js'

type ServerLock = {
  pid: number
  port: number
  host: string
  httpUrl: string
  startedAt: number
}

const LOCK_DIR = join(getCwd(), '.claude')
const LOCK_FILE = join(LOCK_DIR, 'server.lock.json')

async function ensureLockDir(): Promise<void> {
  await mkdir(LOCK_DIR, { recursive: true })
}

export async function writeServerLock(lock: ServerLock): Promise<void> {
  await ensureLockDir()
  await writeFile(LOCK_FILE, `${JSON.stringify(lock, null, 2)}\n`, 'utf8')
}

export async function removeServerLock(): Promise<void> {
  await rm(LOCK_FILE, { force: true })
}

export async function probeRunningServer(): Promise<ServerLock | null> {
  try {
    const content = await readFile(LOCK_FILE, 'utf8')
    const parsed = JSON.parse(content) as Partial<ServerLock>
    if (
      typeof parsed.pid === 'number' &&
      typeof parsed.port === 'number' &&
      typeof parsed.host === 'string' &&
      typeof parsed.httpUrl === 'string' &&
      typeof parsed.startedAt === 'number'
    ) {
      return {
        pid: parsed.pid,
        port: parsed.port,
        host: parsed.host,
        httpUrl: parsed.httpUrl,
        startedAt: parsed.startedAt,
      }
    }
  } catch {
    return null
  }

  return null
}
