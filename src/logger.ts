import { appendFile, mkdir } from 'node:fs/promises'

const ready = mkdir('logs', { recursive: true }).catch(() => {})

export async function writeErrorLog(err: unknown, context: Record<string, unknown> = {}) {
  const stack = err instanceof Error ? (err.stack ?? err.message) : String(err)
  const line = `[${new Date().toISOString()}] ${JSON.stringify(context)}\n${stack}\n\n`

  console.error(line)

  try {
    await ready
    await appendFile('logs/error.log', line)
  } catch (writeErr) {
    console.error('Failed to write error log:', writeErr)
  }
}
