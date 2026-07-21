import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LocalFileStorage } from './localFileStorage.js'

const temporaryDirectories: string[] = []

afterEach(async () => {
  vi.useRealTimers()
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })))
})

describe('LocalFileStorage', () => {
  it('stores immutable objects and validates signed download tokens', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-21T00:00:00.000Z'))
    const directory = await mkdtemp(join(tmpdir(), 'workbench-files-'))
    temporaryDirectories.push(directory)
    const storage = new LocalFileStorage(directory, 'a-test-secret-that-is-longer-than-32-characters')
    const key = 'projects/project-1/files/file-1/v1/catalog.pdf'
    await storage.put({ key, contentType: 'application/pdf', bytes: Buffer.from('catalog') })

    expect((await storage.get(key)).toString()).toBe('catalog')
    const token = await storage.createDownloadToken(key, 300)
    expect(await storage.resolveDownloadToken(token)).toBe(key)
    expect(await storage.resolveDownloadToken(`${token}tampered`)).toBeNull()
    vi.advanceTimersByTime(301_000)
    expect(await storage.resolveDownloadToken(token)).toBeNull()
  })
})
